/*
 * BACKEND DEVELOPER INTEGRATION GUIDE
 * ====================================
 * 
 * This component implements a complete cbBTC vault deposit/withdrawal flow.
 * 
 * SMART CONTRACT INTEGRATION NEEDED:
 * 
 * 1. cbBTC Token Contract Integration:
 *    - Address: Use official cbBTC token contract address
 *    - Functions needed: balanceOf(), allowance(), approve()
 *    - cbBTC uses 8 decimal places (unlike ETH's 18)
 * 
 * 2. Vault Contract Integration:
 *    - Functions needed: deposit(), withdraw(), redeem(), balanceOf(), pricePerShare()
 *    - Must handle ERC-4626 vault standard or custom vault implementation
 * 
 * 3. User Position Tracking:
 *    - Load user's vault share balance on component mount
 *    - Convert shares to cbBTC amounts using pricePerShare()
 *    - Track whether user has ever deposited (for UI flow)
 * 
 * 4. Real-time Updates:
 *    - Listen for deposit/withdrawal events
 *    - Update user position after successful transactions
 *    - Refresh vault TVL and other stats
 * 
 * 5. Error Handling:
 *    - Handle insufficient balance, allowance, network errors
 *    - Provide user-friendly error messages
 *    - Implement retry mechanisms for failed transactions
 * 
 * SEARCH FOR "TODO:" COMMENTS THROUGHOUT THE FILE FOR SPECIFIC IMPLEMENTATION POINTS
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import Navbar from '@/components/Navbar';

import ConnectWalletModal from '@/components/ConnectWalletModal';
import OngoingTransactionCard from '@/components/vault/OngoingTransactionCard';
import { lagoonVaultDetails, LagoonVaultDetail } from '@/data/vaultDetails';
import { useWallet } from '@/context/WalletContext';
import { useTransaction } from '@/context/DepositContext';

export default function VaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;
  const { isConnected, kycStatus, walletAddress } = useWallet();
  const { createDeposit, createWithdrawal, getVaultTransactions, removeTransaction } = useTransaction();
  const [vaultDetail, setVaultDetail] = useState<LagoonVaultDetail | null>(null);
  const [timeRange, setTimeRange] = useState('6mo');
  const [showStrategyInfo, setShowStrategyInfo] = useState(false);

  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [userPosition, setUserPosition] = useState<{
    cbBTCBalance: string;
    usdValue: string;
    hasDeposited: boolean;
  }>({
    cbBTCBalance: '0',
    usdValue: '$0',
    hasDeposited: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [debugAppMode, setDebugAppMode] = useState('test');
  const [activeChartTab, setActiveChartTab] = useState<'price' | 'tvl'>('price');
  const [chartTimeRange, setChartTimeRange] = useState('1M');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [processedDepositIds, setProcessedDepositIds] = useState<Set<string>>(new Set());

  // Generate chart data based on active tab and time range
  const getChartData = () => {
    const timeRanges = {
      '1D': 24, // 24 hours
      '1W': 7,  // 7 days  
      '1M': 30, // 30 days
      '1Y': 12, // 12 months
      'ALL': 24 // 24 months
    };
    
    const points = timeRanges[chartTimeRange as keyof typeof timeRanges] || 30;
    const data = [];
    
    if (activeChartTab === 'price') {
      // Price per share data - starts around 1.044 and grows to ~1.049
      const basePrice = 1.044;
      const growthRate = 0.0001; // Small daily growth
      
      for (let i = 0; i < points; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (points - 1 - i));
        
        const price = basePrice + (i * growthRate) + (Math.random() * 0.0002 - 0.0001);
        
        data.push({
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          value: Number(price.toFixed(6)),
          rawDate: date
        });
      }
    } else {
             // TVL data - fluctuates around current TVL
       const baseTVL = vaultDetail?.tvl || 1200000; // $1.2M
      
      for (let i = 0; i < points; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (points - 1 - i));
        
        // Add some realistic fluctuation
        const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
        const tvl = baseTVL * (1 + fluctuation);
        
        data.push({
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          value: Number(tvl.toFixed(0)),
          rawDate: date
        });
      }
    }
    
    return data;
  };

  const chartData = getChartData();
  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = ((change / previousValue) * 100).toFixed(2);

  // Function to truncate wallet addresses
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (vaultId && lagoonVaultDetails[vaultId]) {
      setVaultDetail(lagoonVaultDetails[vaultId]);
    } else {
      router.push('/');
    }
  }, [vaultId, router]);

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, []);

  // Load user position when wallet is connected and KYC approved
  useEffect(() => {
    if (isConnected && kycStatus === 'approved' && walletAddress) {
      loadUserPosition();
    }
  }, [isConnected, kycStatus, walletAddress]);

  // Monitor transaction approvals and update position
  useEffect(() => {
    if (isConnected && walletAddress && vaultDetail) {
      const vaultTransactions = getVaultTransactions(vaultId, walletAddress);
      const newlyApprovedDeposits = vaultTransactions.filter(transaction => 
        transaction.type === 'deposit' && transaction.status === 'approved' && !processedDepositIds.has(transaction.id)
      );
      const newlyApprovedWithdrawals = vaultTransactions.filter(transaction => 
        transaction.type === 'withdrawal' && transaction.status === 'approved' && !processedDepositIds.has(transaction.id)
      );
      
      let positionChange = 0;
      
      if (newlyApprovedDeposits.length > 0) {
        // Calculate total newly approved deposit amount
        const totalNewlyApprovedAmount = newlyApprovedDeposits.reduce((sum, transaction) => 
          sum + parseFloat(transaction.amount), 0
        );
        positionChange += totalNewlyApprovedAmount;
        console.log(`Added ${totalNewlyApprovedAmount} cbBTC to position from ${newlyApprovedDeposits.length} approved deposits`);
      }
      
      if (newlyApprovedWithdrawals.length > 0) {
        // Calculate total newly approved withdrawal amount
        const totalNewlyWithdrawnAmount = newlyApprovedWithdrawals.reduce((sum, transaction) => 
          sum + parseFloat(transaction.amount), 0
        );
        positionChange -= totalNewlyWithdrawnAmount;
        console.log(`Removed ${totalNewlyWithdrawnAmount} cbBTC from position from ${newlyApprovedWithdrawals.length} approved withdrawals`);
      }
      
      if (positionChange !== 0) {
        // Update user position to reflect newly approved transactions
        setUserPosition(prev => ({
          cbBTCBalance: Math.max(0, parseFloat(prev.cbBTCBalance) + positionChange).toFixed(3),
          usdValue: `$${(Math.max(0, parseFloat(prev.cbBTCBalance) + positionChange) * 65000).toLocaleString()}`, // Mock BTC price
          hasDeposited: Math.max(0, parseFloat(prev.cbBTCBalance) + positionChange) > 0
        }));

        // Mark these transactions as processed
        setProcessedDepositIds(prev => {
          const newSet = new Set(prev);
          [...newlyApprovedDeposits, ...newlyApprovedWithdrawals].forEach(transaction => newSet.add(transaction.id));
          return newSet;
        });
      }
    }
  }, [isConnected, walletAddress, vaultDetail, getVaultTransactions, vaultId, processedDepositIds]);

  // Load debug app mode from localStorage (matches debug panel logic)
  useEffect(() => {
    const savedMode = localStorage.getItem('debugAppMode');
    const envMode = process.env.NEXT_PUBLIC_APP_MODE;
    setDebugAppMode(savedMode || envMode || 'test');

    // Listen for storage changes to sync with debug panel (different tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'debugAppMode' && e.newValue) {
        setDebugAppMode(e.newValue);
      }
    };

    // Listen for custom events to sync with debug panel (same tab)
    const handleAppModeChange = (e: CustomEvent) => {
      setDebugAppMode(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('debugAppModeChange', handleAppModeChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('debugAppModeChange', handleAppModeChange as EventListener);
    };
  }, []);

  /* 
   * BACKEND TODO: Load user's vault position from smart contract
   * This should call the vault contract to get:
   * - User's cbBTC balance in the vault
   * - USD value of their position
   * - Whether they have ever deposited (for UI flow)
   */
  const loadUserPosition = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual smart contract call
      // const vaultContract = new ethers.Contract(vaultDetail.address, vaultABI, provider);
      // const userShares = await vaultContract.balanceOf(walletAddress);
      // const sharePrice = await vaultContract.pricePerShare();
      // const cbBTCBalance = (userShares * sharePrice) / 1e18;
      
      // Mock data for frontend - replace with actual contract calls
      const mockPosition = {
        cbBTCBalance: '0.00', // Will be fetched from contract
        usdValue: '$0',
        hasDeposited: false // Check if user has ever deposited
      };
      
      setUserPosition(mockPosition);
      console.log('User position loaded:', mockPosition);
      
    } catch (error) {
      console.error('Failed to load user position:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = () => {
    setIsConnectWalletModalOpen(true);
  };

  const handleCompleteKYC = () => {
    router.push('/kyc');
  };

  /* 
   * BACKEND TODO: Implement cbBTC deposit to vault
   * Smart contract flow:
   * 1. Check user's cbBTC balance and allowance
   * 2. If allowance insufficient, prompt for approval transaction
   * 3. Call vault.deposit(amount) function
   * 4. Update user position after successful deposit
   */
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) < 0.001) {
      alert(`Please enter a valid deposit amount (minimum ${vaultDetail?.minimumDeposit || '0.001 cbBTC'})`);
      return;
    }

    try {
      setIsLoading(true);
      
      // Perform KYT check before deposit if enabled
      const kytCheckOnDeposit = process.env.NEXT_PUBLIC_KYT_CHECK_ON_DEPOSIT === 'true';
      const isTestMode = process.env.NEXT_PUBLIC_APP_MODE === 'test';
      
      if (kytCheckOnDeposit && !isTestMode) {
        console.log('Performing KYT check before deposit...');
        const kytResult = { passed: true, risk: 'low' };
        
        if (!kytResult.passed) {
          alert('Transaction blocked: Address failed KYT screening. Please contact support.');
          return;
        }
        
        if (kytResult.risk === 'high') {
          const confirmed = confirm('This transaction has been flagged as high risk. Do you want to proceed?');
          if (!confirmed) return;
        }
      }

      // TODO: Replace with actual smart contract calls
      /*
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // cbBTC token contract
      const cbBTCContract = new ethers.Contract(CBBTC_TOKEN_ADDRESS, ERC20_ABI, signer);
      
      // Check user's cbBTC balance
      const userBalance = await cbBTCContract.balanceOf(walletAddress);
      const depositAmountWei = ethers.utils.parseUnits(depositAmount, 8); // cbBTC has 8 decimals
      
      if (userBalance.lt(depositAmountWei)) {
        alert('Insufficient cbBTC balance');
        return;
      }
      
      // Check allowance
      const allowance = await cbBTCContract.allowance(walletAddress, vaultDetail.address);
      
      if (allowance.lt(depositAmountWei)) {
        // Request approval
        const approveTx = await cbBTCContract.approve(vaultDetail.address, depositAmountWei);
        await approveTx.wait();
      }
      
      // Deposit to vault
      const vaultContract = new ethers.Contract(vaultDetail.address, VAULT_ABI, signer);
      const depositTx = await vaultContract.deposit(depositAmountWei);
      await depositTx.wait();
      */

      // Mock successful deposit for frontend
      console.log(`Processing deposit: ${depositAmount} cbBTC`);
      
      // Create ongoing deposit record
      const depositId = createDeposit(vaultId, depositAmount, walletAddress);
      console.log('Created ongoing deposit:', depositId);
      
      setDepositAmount('');
      setShowDepositModal(false);
      alert(`Deposit of ${depositAmount} cbBTC submitted successfully! It will appear in your position once approved by the fund manager.`);
      
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to process deposit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* 
   * BACKEND TODO: Implement cbBTC withdrawal from vault
   * Smart contract flow:
   * 1. Check user's vault share balance
   * 2. Calculate cbBTC amount based on shares and current price per share
   * 3. Call vault.withdraw(shares) or vault.redeem(amount) function
   * 4. Update user position after successful withdrawal
   */
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > parseFloat(userPosition.cbBTCBalance)) {
      alert('Insufficient balance for withdrawal');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Replace with actual smart contract calls
      /*
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const vaultContract = new ethers.Contract(vaultDetail.address, VAULT_ABI, signer);
      
      // Calculate shares to withdraw based on amount
      const pricePerShare = await vaultContract.pricePerShare();
      const withdrawAmountWei = ethers.utils.parseUnits(withdrawAmount, 8);
      const sharesToWithdraw = withdrawAmountWei.mul(ethers.utils.parseUnits('1', 18)).div(pricePerShare);
      
      // Withdraw from vault
      const withdrawTx = await vaultContract.redeem(sharesToWithdraw);
      await withdrawTx.wait();
      */

      // Mock successful withdrawal for frontend
      console.log(`Processing withdrawal: ${withdrawAmount} cbBTC`);
      
      // Create ongoing withdrawal record
      const withdrawalId = createWithdrawal(vaultId, withdrawAmount, walletAddress);
      console.log('Created ongoing withdrawal:', withdrawalId);
      
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      alert(`Withdrawal of ${withdrawAmount} cbBTC submitted successfully! It will be processed once approved by the fund manager.`);
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Failed to process withdrawal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vaultDetail) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading vault details...</p>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    main: {
      maxWidth: isMobile ? '100%' : '1280px',
      margin: '0 auto',
      padding: isMobile ? '1rem 0.5rem' : '2rem 1rem'
    },
    heroSection: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.5rem' : '1rem',
      padding: isMobile ? '1.5rem' : '2rem',
      marginBottom: isMobile ? '1rem' : '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    heroTop: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '1.5rem' : '2rem',
      marginBottom: isMobile ? '1.5rem' : '2rem'
    },
    heroLeft: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between'
    },
    prospectusLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#3b82f6',
      fontSize: '0.875rem',
      textDecoration: 'none',
      marginBottom: '1.5rem'
    },
    heroRight: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    heroChart: {
      flex: 1,
      minHeight: isMobile ? '250px' : '300px',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: isMobile ? '1rem' : '1.5rem'
    },
    heroStats: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? '1rem' : '1.5rem'
    },
    heroStatCard: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    heroStatLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    heroStatValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    heroHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '2rem'
    },
    heroTitle: {
      flex: 1
    },
    vaultName: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    vaultSummary: {
      maxWidth: isMobile ? '100%' : '600px'
    },
    vaultSummaryText: {
      fontSize: isMobile ? '1rem' : '1.1rem',
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '0.75rem'
    },
    vaultSummaryCollapsed: {
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden'
    },
    expandButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#6b7280',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      padding: '0',
      textDecoration: 'underline'
    },

    vaultLiveBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '1rem',
      letterSpacing: '0.05em'
    },
    blinkingDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#10b981',
      borderRadius: '50%'
    },
    keyMetrics: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: isMobile ? '1rem' : '1.5rem',
      marginTop: isMobile ? '1rem' : '2rem'
    },
    metricCard: {
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    metricLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    metricValue: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.5rem' : '1rem',
      padding: isMobile ? '1.5rem' : '2rem',
      marginBottom: isMobile ? '1rem' : '2rem',
      border: '1px solid #e5e7eb'
    },
    twoColumnLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '1rem' : '2rem',
      marginBottom: isMobile ? '1rem' : '2rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    strategySection: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const
    },
    prospectusIcon: {
      width: '16px',
      height: '16px'
    },
    strategyList: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    strategyItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb'
    },
    strategyIcon: {
      width: '24px',
      height: '24px',
      color: '#6b7280'
    },
    strategyText: {
      flex: 1,
      fontSize: '0.9rem'
    },
    infoButton: {
      padding: '0.5rem',
      backgroundColor: '#f3f4f6',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    performanceStats: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    growthCallout: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginTop: '1rem'
    },
    feeSection: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.5rem' : '1rem',
      padding: isMobile ? '1.5rem' : '2rem',
      marginBottom: isMobile ? '1rem' : '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    feeGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? '1rem' : '1.5rem',
      marginBottom: isMobile ? '1rem' : '1.5rem'
    },
    feeItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem'
    },
    feeLabel: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    feeValue: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#111827'
    },
    divider: {
      height: '1px',
      backgroundColor: '#e5e7eb',
      margin: '1.5rem 0'
    },
    insuranceBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginTop: '1.5rem',
      gap: '0.5rem'
    },
    stepFlow: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    step: (active: boolean, completed: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: completed ? 'rgba(16, 185, 129, 0.1)' : active ? 'white' : '#f3f4f6',
      border: `1px solid ${completed ? '#10b981' : '#e5e7eb'}`,
      borderRadius: '0.75rem',
      cursor: active ? 'pointer' : 'default',
      opacity: active || completed ? 1 : 0.6
    }),
    stepNumber: (completed: boolean) => ({
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
      backgroundColor: completed ? '#10b981' : '#111827',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      fontSize: '0.875rem',
      fontWeight: 'bold'
    }),
    stepContent: {
      flex: 1
    },
    stepTitle: {
      fontWeight: '500',
      marginBottom: '0.25rem'
    },
    stepDescription: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    warningBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginTop: '1rem',
      gap: '0.5rem'
    },
    depositForm: {
      marginTop: '1rem',
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const
    },
    depositButton: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    clickableStep: {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    positionCard: {
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      padding: '2rem',
      color: 'white',
      marginTop: '1rem'
    },
    positionHeader: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#94a3b8',
      marginBottom: '0.5rem'
    },
    positionBalance: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    positionUSD: {
      fontSize: '1rem',
      color: '#94a3b8',
      marginBottom: '2rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem'
    },
    depositBtn: {
      flex: 1,
      padding: '1rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    withdrawBtn: {
      flex: 1,
      padding: '1rem',
      backgroundColor: 'transparent',
      color: 'white',
      border: '1px solid #475569',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    cbBTCIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '50%'
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      width: '90%',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      textAlign: 'center' as const
    },
    modernChart: {
      backgroundColor: '#ffffff',
      borderRadius: '1rem',
      padding: '0',
      minHeight: isMobile ? '400px' : '500px',
      border: '1px solid #e5e7eb'
    },
    chartTabs: {
      display: 'flex',
      backgroundColor: '#f9fafb',
      borderRadius: '1rem 1rem 0 0'
    },
    chartTab: {
      flex: 1,
      padding: '1rem 1.5rem',
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderRadius: '1rem 1rem 0 0'
    },
    activeChartTab: {
      backgroundColor: '#ffffff',
      color: '#111827'
    },
    chartContent: {
      padding: '1.5rem',
      color: '#111827'
    },
    chartValueSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
      flexWrap: (isMobile ? 'wrap' : 'nowrap') as 'wrap' | 'nowrap'
    },
    chartIcon: {
      marginRight: '1rem'
    },
    chartTokenIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%'
    },
    chartValues: {
      flex: 1
    },
    chartMainValue: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.25rem'
    },
    chartSubValue: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    dateRange: {
      fontSize: '0.75rem',
      color: '#6b7280',
      padding: '0.5rem 1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem'
    },
    timeRangeSelector: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      justifyContent: 'flex-end'
    },
    timeRangeButton: {
      padding: '0.5rem 0.75rem',
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    activeTimeRange: {
      backgroundColor: '#f97316',
      color: 'white'
    },
    chartArea: {
      height: isMobile ? '250px' : '300px',
      marginTop: '1rem'
    },
    inlineStats: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? '0.75rem' : '1rem',
      marginTop: '1.5rem'
    },
    inlineStatCard: {
      padding: '0.75rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const
    },
    inlineStatLabel: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    inlineStatValue: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    inlineStatValueLarge: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    contractAddressesSection: {
      marginTop: '1rem'
    },
    contractAddressesGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
      gap: '0.5rem'
    },
    addressCard: {
      padding: '0.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.375rem',
      border: '1px solid #e5e7eb',
      minHeight: 'auto'
    },
    addressLabel: {
      fontSize: '0.625rem',
      color: '#6b7280',
      marginBottom: '0.25rem',
      fontWeight: '500',
      textTransform: 'none' as const
    },
    addressContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    addressValue: {
      flex: 1,
      fontSize: '0.625rem',
      fontFamily: 'monospace',
      color: '#374151',
      cursor: 'pointer',
      padding: '0.125rem',
      borderRadius: '0.25rem',
      transition: 'all 0.2s ease',
      wordBreak: 'break-all' as const,
      lineHeight: '1.2'
    },
    copyButton: {
      padding: '0.125rem 0.25rem',
      backgroundColor: '#e5e7eb',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontSize: '0.625rem',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '20px',
      height: '20px'
    },
    positionOnlyCard: {
      width: '100%'
    },
    prospectusSection: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    prospectusContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      ...(isMobile ? { flexWrap: 'wrap' as const } : { flexWrap: 'nowrap' as const })
    },
    prospectusLeft: {
      flex: 1
    },
    prospectusTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    prospectusDescription: {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.5'
    },
    prospectusRight: {
      flexShrink: 0
    },
    prospectusButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#f97316',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '0.5rem',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer'
    },
    fullWidthStat: {
      marginTop: '1.5rem',
      marginBottom: '0.75rem'
    },
    fullWidthStatCard: {
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(249, 115, 22, 0.15) 100%)',
      borderRadius: '0.75rem',
      border: '2px solid #f97316',
      textAlign: 'center' as const,
      boxShadow: '0 8px 32px rgba(249, 115, 22, 0.2), 0 2px 8px rgba(249, 115, 22, 0.1)',
      position: 'relative' as const
    },
    riskLevelContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0.5rem'
    },
    riskLevelText: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#f59e0b'
    },
    riskLevelBar: {
      width: '100%',
      height: '6px',
      backgroundColor: '#e5e7eb',
      borderRadius: '3px',
      overflow: 'hidden',
      position: 'relative' as const
    },
    riskLevelFill: {
      width: '60%',
      height: '100%',
      backgroundColor: '#f59e0b',
      borderRadius: '3px'
    },
    tooltip: {
      position: 'absolute' as const,
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap' as const,
      marginBottom: '0.5rem',
      zIndex: 10,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      opacity: 0,
      visibility: 'hidden' as const,
      transition: 'opacity 0.2s ease, visibility 0.2s ease'
    },
    tooltipVisible: {
      opacity: 1,
      visibility: 'visible' as const
    },
    tooltipArrow: {
      content: '""',
      position: 'absolute' as const,
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderTop: '4px solid #1f2937'
    },
    statCardWithTooltip: {
      position: 'relative' as const,
      cursor: 'help'
    },
    tokenValue: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    tokenIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '50%'
    }
  };

  const renderLabelContent = (props: any) => {
    const { x, y, value } = props;
    return (
      <text x={x} y={y} dy={-10} fill="#111827" fontSize={12} textAnchor="middle">
        {value}
      </text>
    );
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e5e7eb',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            Vault: {payload[0].value}
          </p>
          <p style={{ margin: 0, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></span>
            BTC: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          {/* Two Column Layout */}
          <div style={styles.heroTop}>
            {/* Left Column */}
            <div style={styles.heroLeft}>
              <div>
                <div 
                  style={{
                    ...styles.vaultLiveBadge,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    const etherscanUrl = `https://etherscan.io/address/${vaultDetail.address}`;
                    window.open(etherscanUrl, '_blank');
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                >
                  <style>{`
                    @keyframes blink {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.3; }
                    }
                    .blinking-dot {
                      animation: blink 1.5s infinite;
                    }
                  `}</style>
                  <div 
                    className="blinking-dot"
                    style={styles.blinkingDot}
                  ></div>
                  <span style={{ marginLeft: '0.5rem' }}>VAULT LIVE</span>
                </div>
                <h1 style={styles.vaultName}>{vaultDetail.name}</h1>
                {/* Small Prospectus Link */}
                <div style={{ marginBottom: '1rem' }}>
                  <Link 
                    href={vaultDetail.prospectusUrl || "#"} 
                    style={{
                      fontSize: '0.875rem',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                    View Fund Prospectus
                  </Link>
                </div>
                <div style={styles.vaultSummary}>
                  <div 
                    style={{
                      ...styles.vaultSummaryText,
                      ...(showFullDescription ? {} : styles.vaultSummaryCollapsed)
                    }}
                  >
                    {vaultDetail.description}
                  </div>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    style={styles.expandButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f97316';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                                </div>
                
                                 {/* Stats Layout */}
                 {/* Target APY - Full Width */}
                 <div style={styles.fullWidthStat}>
                   <div 
                     style={{...styles.fullWidthStatCard, ...styles.statCardWithTooltip}}
                     onMouseEnter={() => setHoveredTooltip('apy')}
                     onMouseLeave={() => setHoveredTooltip(null)}
                   >
                     <div style={styles.inlineStatLabel}>Target APY</div>
                     <div style={styles.inlineStatValueLarge}>{vaultDetail.apr?.toFixed(1)}%</div>
                     <div style={{
                       ...styles.tooltip, 
                       ...(hoveredTooltip === 'apy' ? styles.tooltipVisible : {})
                     }}>
                       Annual Percentage Yield - The expected yearly return on your investment
                       <div style={styles.tooltipArrow}></div>
                     </div>
                   </div>
                 </div>

                 {/* Three Column Stats */}
                 <div style={styles.inlineStats}>
                   <div 
                     style={{...styles.inlineStatCard, ...styles.statCardWithTooltip}}
                     onMouseEnter={() => setHoveredTooltip('minimum')}
                     onMouseLeave={() => setHoveredTooltip(null)}
                   >
                     <div style={styles.inlineStatLabel}>Minimum Investment</div>
                     <div style={styles.tokenValue}>
                       <img 
                         src="https://app.lagoon.finance/logo_cbBTC.png" 
                         alt="cbBTC" 
                         style={styles.tokenIcon}
                       />
                       0.001 cbBTC
                     </div>
                     <div style={{
                       ...styles.tooltip, 
                       ...(hoveredTooltip === 'minimum' ? styles.tooltipVisible : {})
                     }}>
                       The smallest amount required to start investing in this vault
                       <div style={styles.tooltipArrow}></div>
                     </div>
                   </div>
                   <div 
                     style={{...styles.inlineStatCard, ...styles.statCardWithTooltip}}
                     onMouseEnter={() => setHoveredTooltip('tvl')}
                     onMouseLeave={() => setHoveredTooltip(null)}
                   >
                     <div style={styles.inlineStatLabel}>Total Value Locked</div>
                     <div style={styles.tokenValue}>
                       <img 
                         src="https://app.lagoon.finance/logo_cbBTC.png" 
                         alt="cbBTC" 
                         style={styles.tokenIcon}
                       />
                       5.28 cbBTC
                     </div>
                     <div style={{
                       ...styles.tooltip, 
                       ...(hoveredTooltip === 'tvl' ? styles.tooltipVisible : {})
                     }}>
                       Total amount of assets currently deposited in this vault
                       <div style={styles.tooltipArrow}></div>
                     </div>
                   </div>
                   <div 
                     style={{...styles.inlineStatCard, ...styles.statCardWithTooltip}}
                     onMouseEnter={() => setHoveredTooltip('risk')}
                     onMouseLeave={() => setHoveredTooltip(null)}
                   >
                     <div style={styles.inlineStatLabel}>Risk Level</div>
                     <div style={styles.riskLevelContainer}>
                       <div style={{
                         ...styles.riskLevelText,
                         color: vaultDetail.riskLevel === 'Low' ? '#10b981' : vaultDetail.riskLevel === 'Medium' ? '#f59e0b' : '#ef4444'
                       }}>{vaultDetail.riskLevel}</div>
                       <div style={styles.riskLevelBar}>
                         <div style={{
                           ...styles.riskLevelFill,
                           width: vaultDetail.riskLevel === 'Low' ? '33%' : vaultDetail.riskLevel === 'Medium' ? '66%' : '100%',
                           backgroundColor: vaultDetail.riskLevel === 'Low' ? '#10b981' : vaultDetail.riskLevel === 'Medium' ? '#f59e0b' : '#ef4444'
                         }}></div>
                       </div>
                     </div>
                     <div style={{
                       ...styles.tooltip, 
                       ...(hoveredTooltip === 'risk' ? styles.tooltipVisible : {})
                     }}>
                       Risk assessment based on strategy complexity and volatility
                       <div style={styles.tooltipArrow}></div>
                     </div>
                   </div>
                 </div>

                 {/* Invest Now Button */}
                 <div style={{
                   marginTop: '2rem',
                   display: 'flex',
                   justifyContent: 'center'
                 }}>
                   <button
                     onClick={() => {
                       const getStartedSection = document.getElementById('get-started-section');
                       if (getStartedSection) {
                         getStartedSection.scrollIntoView({ 
                           behavior: 'smooth',
                           block: 'start'
                         });
                       }
                     }}
                     style={{
                       display: 'inline-flex',
                       alignItems: 'center',
                       gap: '0.75rem',
                       padding: '1rem 2rem',
                       backgroundColor: '#f97316',
                       color: 'white',
                       border: 'none',
                       borderRadius: '0.75rem',
                       fontSize: '1.125rem',
                       fontWeight: '600',
                       cursor: 'pointer',
                       transition: 'all 0.2s ease',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundColor = '#ea580c';
                       e.currentTarget.style.transform = 'translateY(-2px)';
                       e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = '#f97316';
                       e.currentTarget.style.transform = 'translateY(0px)';
                       e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                     }}
                   >
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <circle cx="12" cy="12" r="10"/>
                       <polyline points="12,6 12,12 16,14"/>
                     </svg>
                     Invest Now
                   </button>
                 </div>

              </div>

            </div>

            {/* Right Column - Modern Chart Interface */}
            <div style={styles.heroRight}>
              <div style={styles.modernChart}>
                {/* Chart Tabs */}
                <div style={styles.chartTabs}>
                  <button
                    onClick={() => setActiveChartTab('price')}
                    style={{
                      ...styles.chartTab,
                      ...(activeChartTab === 'price' ? styles.activeChartTab : {})
                    }}
                  >
                    Price per share (cbBTC)
                  </button>
                  <button
                    onClick={() => setActiveChartTab('tvl')}
                    style={{
                      ...styles.chartTab,
                      ...(activeChartTab === 'tvl' ? styles.activeChartTab : {})
                    }}
                  >
                    TVL
                  </button>
                </div>

                {/* Chart Content */}
                <div style={styles.chartContent}>
                  {/* Value Display */}
                  <div style={styles.chartValueSection}>
                    <div style={styles.chartIcon}>
                      <img 
                        src="https://app.lagoon.finance/logo_cbBTC.png" 
                        alt="cbBTC" 
                        style={styles.chartTokenIcon}
                      />
                    </div>
                    <div style={styles.chartValues}>
                      <div style={styles.chartMainValue}>
                        {activeChartTab === 'price' 
                          ? `${currentValue.toFixed(6)} cbBTC`
                          : `$${(currentValue / 1000000).toFixed(2)}M`
                        }
                      </div>
                      <div style={styles.chartSubValue}>
                        {activeChartTab === 'price' 
                          ? `1 cbBTC ≈ $${(currentValue * 65000).toLocaleString()}`
                          : `${changePercent}% ${Number(changePercent) >= 0 ? '↗' : '↘'}`
                        }
                      </div>
                    </div>
                    
                    {/* Date Range */}
                    <div style={styles.dateRange}>
                      📅 {chartData[0]?.date} - {chartData[chartData.length - 1]?.date}
                    </div>
                  </div>

                  {/* Time Range Selector */}
                  <div style={styles.timeRangeSelector}>
                    {['1D', '1W', '1M', '1Y', 'ALL'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setChartTimeRange(range)}
                        style={{
                          ...styles.timeRangeButton,
                          ...(chartTimeRange === range ? styles.activeTimeRange : {})
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div style={styles.chartArea}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#e5e7eb" 
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize="12px"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize="12px"
                          axisLine={false}
                          tickLine={false}
                          domain={['dataMin * 0.999', 'dataMax * 1.001']}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            color: '#111827',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area
                          type="stepAfter"
                          dataKey="value"
                          stroke="#f97316"
                          strokeWidth={2}
                          fill="url(#orangeGradient)"
                          dot={false}
                          activeDot={{ r: 4, stroke: '#f97316', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Button (only if needed) */}
          {debugAppMode === 'test' && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={() => setUserPosition(prev => ({
                  ...prev,
                  hasDeposited: !prev.hasDeposited,
                  cbBTCBalance: prev.hasDeposited ? '0' : '0.125'
                }))}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Test: Toggle User Position
              </button>
            </div>
          )}
        </section>

        {/* Two Column Layout Starts */}
        <div style={styles.twoColumnLayout}>
          {/* Left Column */}
          <div>
            {/* Fee Structure & Additional Information */}
            <section style={styles.feeSection}>
              <div style={styles.feeGrid}>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Management Fee</div>
                  <div style={styles.feeValue}>{vaultDetail.managementFee || '2%'}</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Performance Fee</div>
                  <div style={styles.feeValue}>{vaultDetail.performanceFee || '25%'}</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Early Redemption</div>
                  <div style={styles.feeValue}>{vaultDetail.breakFee || '5%'}</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Notice Period</div>
                  <div style={styles.feeValue}>{vaultDetail.additionalInfo?.withdrawalNotice || '60 days'}</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Custody</div>
                  <div style={styles.feeValue}>{vaultDetail.custodySolution || 'Copper.co'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{vaultDetail.additionalInfo?.custodyDetails || 'Multi-Party Computation (MPC)'}</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>TVL Limit</div>
                  <div style={styles.feeValue}>{vaultDetail.tvlLimit || '2,500 BTC'}</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Available Capacity</div>
                  <div style={styles.feeValue}>{vaultDetail.availableCapacity || '892 BTC'}</div>
                </div>
              </div>

              {/* Contract Addresses */}
              {vaultDetail.contractAddresses && (
                <div style={styles.contractAddressesSection}>
                  <div style={styles.contractAddressesGrid}>
                    {vaultDetail.contractAddresses.administrator && (
                      <div style={styles.addressCard}>
                        <div style={styles.addressLabel}>Administrator</div>
                        <div style={styles.addressContainer}>
                          <div 
                            style={styles.addressValue}
                            onClick={() => window.open(`https://etherscan.io/address/${vaultDetail.contractAddresses?.administrator}`, '_blank')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f97316';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#374151';
                            }}
                          >
                            {truncateAddress(vaultDetail.contractAddresses.administrator)}
                          </div>
                          <button
                            style={styles.copyButton}
                            onClick={() => navigator.clipboard.writeText(vaultDetail.contractAddresses?.administrator || '')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#e5e7eb';
                            }}
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                    {vaultDetail.contractAddresses.safe && (
                      <div style={styles.addressCard}>
                        <div style={styles.addressLabel}>Safe</div>
                        <div style={styles.addressContainer}>
                          <div 
                            style={styles.addressValue}
                            onClick={() => window.open(`https://etherscan.io/address/${vaultDetail.contractAddresses?.safe}`, '_blank')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f97316';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#374151';
                            }}
                          >
                            {truncateAddress(vaultDetail.contractAddresses.safe)}
                          </div>
                          <button
                            style={styles.copyButton}
                            onClick={() => navigator.clipboard.writeText(vaultDetail.contractAddresses?.safe || '')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#e5e7eb';
                            }}
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                    {vaultDetail.contractAddresses.priceOracle && (
                      <div style={styles.addressCard}>
                        <div style={styles.addressLabel}>Price Oracle</div>
                        <div style={styles.addressContainer}>
                          <div 
                            style={styles.addressValue}
                            onClick={() => window.open(`https://etherscan.io/address/${vaultDetail.contractAddresses?.priceOracle}`, '_blank')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f97316';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#374151';
                            }}
                          >
                            {truncateAddress(vaultDetail.contractAddresses.priceOracle)}
                          </div>
                          <button
                            style={styles.copyButton}
                            onClick={() => navigator.clipboard.writeText(vaultDetail.contractAddresses?.priceOracle || '')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#e5e7eb';
                            }}
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                    {vaultDetail.contractAddresses.whitelistManager && (
                      <div style={styles.addressCard}>
                        <div style={styles.addressLabel}>Whitelist manager</div>
                        <div style={styles.addressContainer}>
                          <div 
                            style={styles.addressValue}
                            onClick={() => window.open(`https://etherscan.io/address/${vaultDetail.contractAddresses?.whitelistManager}`, '_blank')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f97316';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#374151';
                            }}
                          >
                            {truncateAddress(vaultDetail.contractAddresses.whitelistManager)}
                          </div>
                          <button
                            style={styles.copyButton}
                            onClick={() => navigator.clipboard.writeText(vaultDetail.contractAddresses?.whitelistManager || '')}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#e5e7eb';
                            }}
                            title="Copy address"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={styles.divider} />

              <div style={styles.insuranceBadge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{vaultDetail.insurance || 'Insured up to $500M through Ledger Enterprise'}</span>
              </div>

              <div style={styles.warningBadge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{vaultDetail.additionalInfo?.lockupPeriod || '12-month lock-up period with 5% early withdrawal penalty'}</span>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div>
            {/* Action Flow Section */}
            <section id="get-started-section" style={styles.section}>
              <div style={styles.sectionTitle}>
                {userPosition.hasDeposited ? 'Your Position' : 'Get Started'}
              </div>
              <div style={styles.stepFlow}>
                {/* Only show steps 1 & 2 if user doesn't have a position */}
                {!userPosition.hasDeposited && (
                  <>
                    {/* Step 1: Connect Wallet */}
                    <div 
                      style={{
                        ...styles.step(!isConnected, isConnected),
                        ...((!isConnected) ? styles.clickableStep : {})
                      }}
                      onClick={!isConnected ? handleConnectWallet : undefined}
                      onMouseEnter={(e) => {
                        if (!isConnected) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isConnected) {
                          e.currentTarget.style.transform = 'translateY(0px)';
                        }
                      }}
                    >
                      <div style={styles.stepNumber(isConnected)}>
                        {isConnected ? '✓' : '1'}
                      </div>
                      <div style={styles.stepContent}>
                        <div style={styles.stepTitle}>Connect Wallet</div>
                        <div style={styles.stepDescription}>
                          {isConnected ? 'Your wallet is connected and ready' : 'Connect your wallet to continue'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Step 2: Complete KYC */}
                    <div 
                      style={{
                        ...styles.step(isConnected && kycStatus !== 'approved', kycStatus === 'approved'),
                        ...(isConnected ? styles.clickableStep : {}),
                        ...(kycStatus === 'rejected' ? {
                          backgroundColor: '#fef2f2',
                          border: '1px solid #f87171'
                        } : {})
                      }}
                      onClick={isConnected ? handleCompleteKYC : undefined}
                      onMouseEnter={(e) => {
                        if (isConnected) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isConnected) {
                          e.currentTarget.style.transform = 'translateY(0px)';
                        }
                      }}
                    >
                      <div style={{
                        ...styles.stepNumber(kycStatus === 'approved'),
                        ...(kycStatus === 'rejected' ? {
                          backgroundColor: '#ef4444',
                          color: 'white'
                        } : {})
                      }}>
                        {kycStatus === 'approved' ? '✓' : kycStatus === 'rejected' ? '✗' : '2'}
                      </div>
                      <div style={styles.stepContent}>
                        <div style={styles.stepTitle}>Complete KYC</div>
                        <div style={styles.stepDescription}>
                          {kycStatus === 'approved' 
                            ? 'Your identity has been verified'
                            : kycStatus === 'in-progress'
                            ? 'Identity verification in progress'
                            : kycStatus === 'rejected'
                            ? 'Identity verification failed - click to retry'
                            : 'Complete identity verification'
                          }
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Step 3: Deposit Management */}
                {isConnected && kycStatus === 'approved' ? (
                  <div style={userPosition.hasDeposited ? styles.positionOnlyCard : styles.step(true, false)}>
                    {!userPosition.hasDeposited && (
                      <div style={styles.stepNumber(false)}>3</div>
                    )}
                    <div style={{ ...styles.stepContent, width: '100%' }}>
                      {!userPosition.hasDeposited ? (
                        // First-time deposit flow
                        <>
                          <div style={styles.stepTitle}>Make Deposit</div>
                          <div style={styles.stepDescription}>Enter the amount you'd like to deposit</div>
                          
                          <form onSubmit={handleDeposit} style={styles.depositForm}>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>
                                Deposit Amount (cbBTC)
                              </label>
                              <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                placeholder="0.001"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                style={{
                                  ...styles.formInput,
                                  opacity: isLoading ? 0.6 : 1
                                }}
                                disabled={isLoading}
                                required
                              />
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                Minimum: {vaultDetail?.minimumDeposit || '0.001 cbBTC'}
                              </div>
                            </div>
                            
                            <button 
                              type="submit"
                              disabled={isLoading}
                              style={{
                                ...styles.depositButton,
                                backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                if (!isLoading) e.currentTarget.style.backgroundColor = '#059669'
                              }}
                              onMouseLeave={(e) => {
                                if (!isLoading) e.currentTarget.style.backgroundColor = '#10b981'
                              }}
                            >
                              {isLoading ? 'Processing...' : 'Deposit cbBTC'}
                            </button>
                          </form>
                        </>
                      ) : (
                        // Position management for existing depositors
                        <>
                       
                          <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '1rem',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{
                              fontSize: '0.875rem',
                              color: '#6b7280',
                              marginBottom: '0.5rem',
                              fontWeight: '500'
                            }}>My position</div>
                            <div style={{
                              fontSize: '2rem',
                              fontWeight: 'bold',
                              color: '#111827',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '1.5rem'
                            }}>
                              <img 
                                src="https://app.lagoon.finance/logo_cbBTC.png" 
                                alt="cbBTC" 
                                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                              />
                              {userPosition.cbBTCBalance} cbBTC
                            </div>
                            
                            <div style={{
                              fontSize: '0.875rem',
                              color: '#6b7280',
                              marginBottom: '0.5rem',
                              fontWeight: '500'
                            }}>My wallet balance</div>
                            <div style={{
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              color: '#111827',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '1.5rem'
                            }}>
                              <img 
                                src="https://app.lagoon.finance/logo_cbBTC.png" 
                                alt="cbBTC" 
                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                              />
                              0 cbBTC {/* TODO: Load actual wallet balance */}
                              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>($0)</span>
                            </div>

                            <div style={{
                              display: 'flex',
                              gap: '1rem'
                            }}>
                              <button
                                onClick={() => setShowDepositModal(true)}
                                style={{
                                  flex: 1,
                                  padding: '0.75rem 1.5rem',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                disabled={isLoading}
                                onMouseEnter={(e) => {
                                  if (!isLoading) e.currentTarget.style.backgroundColor = '#059669';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isLoading) e.currentTarget.style.backgroundColor = '#10b981';
                                }}
                              >
                                Deposit
                              </button>
                              <button
                                onClick={() => setShowWithdrawModal(true)}
                                style={{
                                  flex: 1,
                                  padding: '0.75rem 1.5rem',
                                  backgroundColor: parseFloat(userPosition.cbBTCBalance) > 0 ? '#374151' : '#9ca3af',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  fontWeight: '500',
                                  cursor: parseFloat(userPosition.cbBTCBalance) > 0 ? 'pointer' : 'not-allowed',
                                  transition: 'all 0.2s ease'
                                }}
                                disabled={isLoading || parseFloat(userPosition.cbBTCBalance) === 0}
                                onMouseEnter={(e) => {
                                  if (!isLoading && parseFloat(userPosition.cbBTCBalance) > 0) {
                                    e.currentTarget.style.backgroundColor = '#1f2937';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isLoading && parseFloat(userPosition.cbBTCBalance) > 0) {
                                    e.currentTarget.style.backgroundColor = '#374151';
                                  }
                                }}
                              >
                                Withdraw
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={styles.step(false, false)}>
                    <div style={styles.stepNumber(false)}>3</div>
                    <div style={styles.stepContent}>
                      <div style={styles.stepTitle}>Make Deposit</div>
                      <div style={styles.stepDescription}>
                        Minimum {vaultDetail?.minimumDeposit || '0.001 cbBTC'} required
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Ongoing Transactions Section */}
            {isConnected && walletAddress && vaultDetail && (() => {
              const vaultTransactions = getVaultTransactions(vaultId, walletAddress);
              const pendingTransactions = vaultTransactions.filter(transaction => 
                transaction.status === 'pending' || 
                transaction.status === 'processing' || 
                (transaction.status === 'approved' && Date.now() - transaction.timestamp < 300000) || // Show approved for 5 minutes
                (transaction.status === 'rejected' && Date.now() - transaction.timestamp < 300000)   // Show rejected for 5 minutes
              );
              
              return pendingTransactions.length > 0 ? (
                <section style={styles.section}>
                  <div style={styles.sectionTitle}>
                    Ongoing Transactions
                  </div>
                  <div>
                    {pendingTransactions.map(transaction => (
                      <OngoingTransactionCard 
                        key={transaction.id}
                        transaction={transaction}
                        onRemove={removeTransaction}
                      />
                    ))}
                  </div>
                </section>
              ) : null;
            })()}
          </div>
        </div>
      </main>

      
      <ConnectWalletModal
        isOpen={isConnectWalletModalOpen}
        onClose={() => setIsConnectWalletModalOpen(false)}
      />

      {/* Deposit Modal */}
      {showDepositModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDepositModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Deposit cbBTC</div>
            <form onSubmit={handleDeposit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Amount (cbBTC)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="0.001"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={styles.formInput}
                  disabled={isLoading}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Minimum: {vaultDetail?.minimumDeposit || '0.001 cbBTC'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={styles.modalOverlay} onClick={() => setShowWithdrawModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Withdraw cbBTC</div>
            <form onSubmit={handleWithdraw}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Amount (cbBTC)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max={userPosition.cbBTCBalance}
                  placeholder="0.001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={styles.formInput}
                  disabled={isLoading}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Available: {userPosition.cbBTCBalance} cbBTC
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: isLoading ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 