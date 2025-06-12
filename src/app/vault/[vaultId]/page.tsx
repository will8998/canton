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
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, BarChart, Bar
} from 'recharts';
import Navbar from '@/components/Navbar';

import ContactForm from '@/components/ContactForm';
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

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
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

  const [activeChartTab, setActiveChartTab] = useState<'price' | 'tvl' | 'returns'>('price');
  const [chartTimeRange, setChartTimeRange] = useState('1M');
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [activeFundTab, setActiveFundTab] = useState<'details' | 'performance' | 'team'>('details');
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
    } else if (activeChartTab === 'tvl') {
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
    } else {
      // Monthly Returns data
      const monthlyReturnsData = [
        { month: '2024-01', return: 0.8, cumulative: 0.8 },
        { month: '2024-02', return: 1.4, cumulative: 2.2 },
        { month: '2024-03', return: 0.5, cumulative: 2.7 },
        { month: '2024-04', return: 1.0, cumulative: 3.8 },
        { month: '2024-05', return: 0.7, cumulative: 4.5 },
        { month: '2024-06', return: 1.3, cumulative: 5.9 },
        { month: '2024-07', return: 0.9, cumulative: 6.8 },
        { month: '2024-08', return: 1.1, cumulative: 8.0 },
        { month: '2024-09', return: 0.6, cumulative: 8.6 },
        { month: '2024-10', return: 1.5, cumulative: 10.2 },
        { month: '2024-11', return: 0.8, cumulative: 11.1 },
        { month: '2024-12', return: 1.2, cumulative: 12.4 }
      ];
      
      return monthlyReturnsData.map(item => ({
        date: new Date(item.month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        }),
        value: item.return,
        cumulative: item.cumulative,
        rawDate: new Date(item.month + '-01')
      }));
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

  const handleContactUs = () => {
    setIsContactModalOpen(true);
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
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      border: '2px solid #f97316',
      position: 'relative' as const,
      transition: 'all 0.2s ease',
            cursor: 'pointer'
    },
    metricLabel: {
      fontSize: '0.875rem',
      color: '#111827',
      marginBottom: '0.5rem',
      fontWeight: '500',
      letterSpacing: '0.025em',
            textTransform: 'uppercase' as const
    },
    metricValue: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827',
            lineHeight: '1.3'
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
    strategyItemCard: {
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
    },
    contactCard: {
      backgroundColor: '#f8f9fa',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid #e5e7eb'
    },
    contactContent: {
      textAlign: 'center' as const
    },
    contactTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    },
    contactDescription: {
      fontSize: '1rem',
      color: '#6b7280',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },
    contactFeatures: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginBottom: '2rem'
    },
    contactFeature: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1rem',
      color: '#374151'
    },
    contactFeatureIcon: {
      fontSize: '1.25rem'
    },
    contactButton: {
      padding: '0.875rem 2rem',
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    performanceMetricsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: '2rem'
    },
    performanceMetricCard: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const,
      position: 'relative' as const
    },
    monthlyReturnsSection: {
      marginTop: '1.5rem'
    },
    monthlyReturnsTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    },
    monthlyReturnsTable: {
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    monthlyReturnsRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      borderBottom: '1px solid #e5e7eb'
    },
    monthlyReturnsHeader: {
      padding: '0.75rem',
      backgroundColor: '#f3f4f6',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      borderRight: '1px solid #e5e7eb'
    },
    monthlyReturnsCell: {
      padding: '0.75rem',
      fontSize: '0.875rem',
      color: '#111827',
      borderRight: '1px solid #e5e7eb'
    },
    heroPerformanceMetrics: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '0.75rem' : '1rem',
      marginTop: '2rem',
      marginBottom: '1.5rem'
    },
    heroMetricCard: {
      padding: '1.25rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const,
      position: 'relative' as const
    },
    heroMetricLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      fontWeight: '500'
    },
    heroMetricValue: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    secondaryInfoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '0.75rem' : '1rem',
      marginTop: '1rem'
    },
    secondaryInfoCard: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const,
      position: 'relative' as const
    },
    secondaryInfoLabel: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      fontWeight: '500'
    },
    feeStructureSection: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.5rem' : '1rem',
      padding: isMobile ? '1.5rem' : '2rem',
      marginBottom: isMobile ? '1rem' : '2rem',
      border: '1px solid #e5e7eb'
    },
    feeStructureGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? '1rem' : '1.5rem',
      marginBottom: '2rem'
    },
    feeStructureItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    feeStructureLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontWeight: '500'
    },
    feeStructureValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    feeStructureSubtext: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    feeStructureBadges: {
      display: 'flex',
      flexDirection: isMobile ? 'column' as const : 'row' as const,
      gap: '1rem',
      marginTop: '1.5rem'
    },
    ctaSection: {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      borderRadius: isMobile ? '0.5rem' : '1rem',
      padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
      marginBottom: isMobile ? '1rem' : '2rem',
      color: 'white',
      textAlign: 'center' as const
    },
    ctaContent: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    ctaTitle: {
      fontSize: isMobile ? '1.75rem' : '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: 'white'
    },
    ctaSubtitle: {
      fontSize: isMobile ? '1rem' : '1.25rem',
      lineHeight: '1.6',
      marginBottom: '2.5rem',
      color: 'rgba(255, 255, 255, 0.9)',
      maxWidth: '800px',
      margin: '0 auto 2.5rem auto'
    },
    ctaFeatures: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '1.5rem' : '2rem',
      marginBottom: '3rem'
    },
    ctaFeature: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      textAlign: 'left' as const
    },
    ctaFeatureIcon: {
      fontSize: '2rem',
      flexShrink: 0,
      marginTop: '0.25rem'
    },
    ctaFeatureContent: {
      flex: 1
    },
    ctaFeatureTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: 'white'
    },
    ctaFeatureText: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      color: 'rgba(255, 255, 255, 0.8)',
      margin: 0
    },
    ctaAction: {
      textAlign: 'center' as const
    },
    ctaButton: {
      padding: '1rem 2.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      color: '#f97316',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(249, 115, 22, 0.2)',
      marginBottom: '1rem'
    },
    ctaDisclaimer: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.7)',
      margin: 0,
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    // New VanEck-style layout styles
    heroLeftContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem'
    },
    fundHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    fundLogo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '60px',
      height: '60px',
      backgroundColor: '#f97316',
      borderRadius: '50%'
    },
    fundLogoIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%'
    },
    fundTitle: {
      flex: 1
    },
    fundName: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0,
      marginBottom: '0.5rem'
    },
    fundSymbol: {
      fontSize: '1.25rem',
      color: '#6b7280',
      margin: 0
    },
    fundDescription: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: '1.6',
      marginBottom: '2rem'
    },
    fundStats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem'
    },
    fundStat: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    fundStatLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    fundStatValue: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    investmentForm: {
      backgroundColor: '#f8f9fa',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid #e5e7eb'
    },
    investmentFormHeader: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '1.5rem'
    },
    investmentInputSection: {
      marginBottom: '1.5rem'
    },
    investmentInputWrapper: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      marginBottom: '1rem'
    },
    investmentInput: {
      flex: 1,
      padding: '1rem',
      border: 'none',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      outline: 'none',
      borderRadius: '0.5rem 0 0 0.5rem'
    },
    currencySelector: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderLeft: '1px solid #d1d5db',
      borderRadius: '0 0.5rem 0.5rem 0'
    },
    currencyIcon: {
      fontSize: '1.25rem',
      color: '#f59e0b'
    },
    currencyCode: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#111827'
    },
    currencyDropdown: {
      color: '#6b7280'
    },
    conversionArrow: {
      fontSize: '1.5rem',
      color: '#6b7280',
      textAlign: 'center' as const,
      margin: '0.5rem 0'
    },
    outputWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '1rem'
    },
    outputValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#6b7280'
    },
    outputCurrency: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    outputCurrencyIcon: {
      display: 'flex',
      alignItems: 'center'
    },
    vaultTokenIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '50%'
    },
    investmentDisclaimer: {
      fontSize: '0.75rem',
      color: '#6b7280',
      lineHeight: '1.4',
      marginBottom: '1.5rem'
    },
    investButton: {
      width: '100%',
      padding: '1rem',
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    // Fund Information Section Styles
    fundInfoSection: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '0.5rem' : '1rem',
      marginBottom: isMobile ? '1rem' : '2rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    fundTabs: {
      display: 'flex',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    fundTab: {
      flex: 1,
      padding: isMobile ? '1rem 0.75rem' : '1.25rem 1.5rem',
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: 'none',
      fontSize: isMobile ? '0.875rem' : '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center' as const
    },
    activeFundTab: {
      backgroundColor: '#ffffff',
      color: '#111827',
      fontWeight: '600'
    },
    fundTabContent: {
      padding: isMobile ? '1.5rem' : '2rem'
    },
    fundDetailsTab: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem'
    },
    fundDetailsTopRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '3rem',
      alignItems: 'start',
      marginBottom: '2rem'
    },
    fundDetailsLeft: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    fundDetailsRight: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    performanceTab: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem'
    },
    teamTab: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem'
    },
    fundDetailSection: {
      marginBottom: '1.5rem'
    },
    fundDetailTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
      marginBottom: '1.5rem',
      letterSpacing: '-0.025em',
      position: 'relative' as const,
      display: 'inline-block',
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        bottom: '-4px',
        left: 0,
        width: '30px',
        height: '2px',
        background: 'linear-gradient(90deg, #f97316, #ea580c)',
        borderRadius: '2px'
      }
    },
    fundDetailText: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: '1.6',
      marginBottom: '1rem'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '1.5rem',
      marginTop: '1.5rem'
    },
    strategiesLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '2rem',
      alignItems: 'start'
    },
    strategiesList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    strategyListItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem'
    },
    strategyBullet: {
      color: '#f97316',
      fontSize: '1.5rem',
      lineHeight: '1'
    },
    strategyContent: {
      flex: 1,
      fontSize: '1rem',
      color: '#374151',
      lineHeight: '1.5'
    },
    chartContainer: {
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    },
    chartTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '1rem',
      textAlign: 'center' as const
    },
    riskGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '1rem'
    },
    riskItem: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      fontSize: '0.875rem',
      color: '#374151',
      lineHeight: '1.5'
    },
    feesTable: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      marginBottom: '1rem'
    },
    feesHeader: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      backgroundColor: '#f3f4f6'
    },
    feesHeaderCell: {
      padding: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      borderRight: '1px solid #e5e7eb',
      textAlign: 'center' as const
    },
    feesRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb'
    },
    feesCell: {
      padding: '0.75rem',
      fontSize: '0.875rem',
      color: '#111827',
      borderRight: '1px solid #e5e7eb',
      textAlign: 'center' as const
    },
    additionalTerms: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    termItem: {
      fontSize: '0.875rem',
      color: '#374151',
      lineHeight: '1.5'
    },
    trackRecordNotice: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem',
      border: '1px solid #bfdbfe'
    },
    noticeIcon: {
      fontSize: '1.25rem',
      marginTop: '0.125rem'
    },
    performanceLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '2rem',
      alignItems: 'start'
    },
    performanceMetrics: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem'
    },
    performanceTabMetricCard: {
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const
    },
    performanceMetricValue: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    performanceMetricLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontWeight: '500'
    },
    auditedNote: {
      marginTop: '1rem',
      padding: '0.75rem',
      backgroundColor: '#f0fdf4',
      borderRadius: '0.5rem',
      border: '1px solid #bbf7d0',
      fontSize: '0.875rem',
      color: '#166534'
    },
    teamGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '1rem'
    },
    teamMember: {
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const
    },
    teamMemberRole: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      fontWeight: '500'
    },
    teamMemberName: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    governanceGrid: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    governanceItem: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      fontSize: '0.875rem',
      color: '#374151',
      lineHeight: '1.5'
    },
    serviceProvidersGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '1rem'
    },
    serviceProvider: {
      padding: '1.25rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const
    },
    serviceProviderRole: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      fontWeight: '500'
    },
    serviceProviderName: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#111827',
      lineHeight: '1.4'
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
          <div style={styles.heroTop}>
            {/* Left Column - Fund Information */}
            <div style={styles.heroLeft}>
              <div style={styles.heroLeftContent}>
                {/* Fund Header */}
                <div style={styles.fundHeader}>
                  <div style={styles.fundLogo}>
                    <img 
                      src="https://app.lagoon.finance/logo_cbBTC.png" 
                      alt="cbBTC" 
                      style={styles.fundLogoIcon}
                    />
                  </div>
                  <div style={styles.fundTitle}>
                    <h1 style={styles.fundName}>{vaultDetail.name}</h1>
                    <div style={styles.fundSymbol}>("{vaultDetail.name?.substring(0, 5).toUpperCase() || 'VAULT'}")</div>
                  </div>
                </div>

                {/* Fund Description */}
                <div style={styles.fundDescription}>
                  {vaultDetail.description}
                </div>

                {/* Fund Stats */}
                <div style={styles.fundStats}>
                  <div style={styles.fundStat}>
                    <div style={styles.fundStatLabel}>Minimum investment</div>
                    <div style={styles.fundStatValue}>0.001 BTC</div>
                  </div>
                  <div style={styles.fundStat}>
                    <div style={styles.fundStatLabel}>AUM</div>
                    <div style={styles.fundStatValue}>5.28 BTC</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Investment Form */}
            <div style={styles.heroRight}>
              <div style={styles.investmentForm}>
                <div style={styles.investmentFormHeader}>
                  Enter your investment
                </div>
                
                <div style={styles.investmentInputSection}>
                  <div style={styles.investmentInputWrapper}>
                    <input
                      type="number"
                      placeholder="0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      style={styles.investmentInput}
                      step="0.001"
                      min="0.001"
                    />
                    <div style={styles.currencySelector}>
                      <span style={styles.currencyIcon}>₿</span>
                      <span style={styles.currencyCode}>BTC</span>
                      <svg style={styles.currencyDropdown} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div style={styles.investmentDisclaimer}>
                  This is an estimate of the units you will receive subject to funds arriving during the current investment phase and the exchange rate applied to the funds.
                </div>

                <button 
                  style={styles.investButton}
                  onClick={() => setIsContactModalOpen(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0891b2';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0ea5e9';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                >
                  Invest
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Fund Information Section */}
        <section style={styles.fundInfoSection}>
          {/* Tab Navigation */}
          <div style={styles.fundTabs}>
            <button
              onClick={() => setActiveFundTab('details')}
              style={{
                ...styles.fundTab,
                ...(activeFundTab === 'details' ? styles.activeFundTab : {})
              }}
            >
              Fund Details
            </button>
            <button
              onClick={() => setActiveFundTab('performance')}
              style={{
                ...styles.fundTab,
                ...(activeFundTab === 'performance' ? styles.activeFundTab : {})
              }}
            >
              Historical Performance & Track Record
            </button>
            <button
              onClick={() => setActiveFundTab('team')}
              style={{
                ...styles.fundTab,
                ...(activeFundTab === 'team' ? styles.activeFundTab : {})
              }}
            >
              About Atitlan & Team
            </button>
          </div>

          {/* Tab Content */}
          <div style={styles.fundTabContent}>
            {activeFundTab === 'details' && (
              <div style={styles.fundDetailsTab}>
                {/* Two Column Layout */}
                <div style={styles.fundDetailsTopRow}>
                  {/* Left Column: Fund Name & Objective */}
                  <div style={styles.fundDetailsLeft}>
                    <div style={styles.fundDetailSection}>
                      <h3 style={styles.fundDetailTitle}>Fund Name</h3>
                      <p style={styles.fundDetailText}>Atitlan Bitcoin Multi-Strat Fund</p>
                      
                      <h3 style={styles.fundDetailTitle}>Objective</h3>
                      <p style={styles.fundDetailText}>
                        To generate consistent bitcoin-denominated returns for BTC holders who want to preserve their long-term HODL strategy while earning low-risk yield on their bitcoin holdings.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Target Return & Risk Metrics */}
                  <div style={styles.fundDetailsRight}>
                    <div style={styles.fundDetailSection}>
                      <h3 style={styles.fundDetailTitle}>Target Return & Risk Metrics</h3>
                      <div style={styles.metricsGrid}>
                        <div 
                          style={styles.metricCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f97316';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = 'white';
                            if (value) value.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = '#111827';
                            if (value) value.style.color = '#111827';
                          }}
                        >
                          <div className="metric-label" style={styles.metricLabel}>Annual Net Return Target</div>
                          <div className="metric-value" style={styles.metricValue}>12%+ (in BTC)</div>
                        </div>
                        <div 
                          style={styles.metricCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f97316';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = 'white';
                            if (value) value.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = '#111827';
                            if (value) value.style.color = '#111827';
                          }}
                        >
                          <div className="metric-label" style={styles.metricLabel}>Maximum Monthly Drawdown</div>
                          <div className="metric-value" style={styles.metricValue}>2%</div>
                        </div>
                        <div 
                          style={styles.metricCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f97316';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = 'white';
                            if (value) value.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = '#111827';
                            if (value) value.style.color = '#111827';
                          }}
                        >
                          <div className="metric-label" style={styles.metricLabel}>Return Type</div>
                          <div className="metric-value" style={styles.metricValue}>BTC-denominated, market-neutral</div>
                        </div>
                        <div 
                          style={styles.metricCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f97316';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = 'white';
                            if (value) value.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            const label = e.currentTarget.querySelector('.metric-label') as HTMLElement;
                            const value = e.currentTarget.querySelector('.metric-value') as HTMLElement;
                            if (label) label.style.color = '#111827';
                            if (value) value.style.color = '#111827';
                          }}
                        >
                          <div className="metric-label" style={styles.metricLabel}>Volatility</div>
                          <div className="metric-value" style={styles.metricValue}>Low, uncorrelated to BTC price (correlation cap at 0.4)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment Strategies */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Investment Strategies</h3>
                  <p style={styles.fundDetailText}>A diversified mix of:</p>
                  
                  <div style={styles.strategiesLayout}>
                    <div style={styles.strategiesList}>
                      <div style={styles.strategyListItem}>
                        <div style={styles.strategyBullet}>•</div>
                        <div style={styles.strategyContent}>
                          <strong>Short-Term Directional:</strong> long/short, momentum, mean-reversion
                        </div>
                      </div>
                      <div style={styles.strategyListItem}>
                        <div style={styles.strategyBullet}>•</div>
                        <div style={styles.strategyContent}>
                          <strong>Market-Neutral:</strong> arbitrage, basis trading, HFT
                        </div>
                      </div>
                      <div style={styles.strategyListItem}>
                        <div style={styles.strategyBullet}>•</div>
                        <div style={styles.strategyContent}>
                          <strong>Other Tactics:</strong> options trading
                        </div>
                      </div>
                    </div>
                    
                    {/* Strategy Allocation Pie Chart */}
                    <div style={styles.chartContainer}>
                      <div style={styles.chartTitle}>Strategy Allocation</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Short-Term Directional', value: 45, fill: '#f97316' },
                              { name: 'Market-Neutral', value: 40, fill: '#0ea5e9' },
                              { name: 'Options Trading', value: 15, fill: '#10b981' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, '']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <p style={styles.fundDetailText}>
                    All strategies are executed via segregated managed accounts with institutional-grade security.
                  </p>
                </div>

                {/* Risk Management */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Risk Management</h3>
                  <div style={styles.riskGrid}>
                    <div style={styles.riskItem}>
                      <strong>Counterparty Risk:</strong> Minimized via mirror-trading through regulated custodians
                    </div>
                    <div style={styles.riskItem}>
                      <strong>Pod Risk:</strong> SMAs with API-limited access, full control retained by fund
                    </div>
                    <div style={styles.riskItem}>
                      <strong>Strategy Risk:</strong> Live-only track record due diligence, continuous monitoring, and dynamic allocation updates
                    </div>
                    <div style={styles.riskItem}>
                      <strong>BTC Price Risk:</strong> Not a fund risk due to BTC-denomination of the product
                    </div>
                  </div>
                </div>

                {/* Fees & Terms */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Fees & Terms</h3>
                  <div style={styles.feesTable}>
                    <div style={styles.feesHeader}>
                      <div style={styles.feesHeaderCell}>Share Class</div>
                      <div style={styles.feesHeaderCell}>Management Fee</div>
                      <div style={styles.feesHeaderCell}>Performance Fee</div>
                      <div style={styles.feesHeaderCell}>Minimum Investment</div>
                      <div style={styles.feesHeaderCell}>Lock-up</div>
                    </div>
                    <div style={styles.feesRow}>
                      <div style={styles.feesCell}>Early Bird</div>
                      <div style={styles.feesCell}>1.5%</div>
                      <div style={styles.feesCell}>15%</div>
                      <div style={styles.feesCell}>10 BTC</div>
                      <div style={styles.feesCell}>6 months (3% break fee)</div>
                    </div>
                    <div style={styles.feesRow}>
                      <div style={styles.feesCell}>Standard</div>
                      <div style={styles.feesCell}>2%</div>
                      <div style={styles.feesCell}>20%</div>
                      <div style={styles.feesCell}>-</div>
                      <div style={styles.feesCell}>-</div>
                    </div>
                  </div>
                  
                  <div style={styles.additionalTerms}>
                    <div style={styles.termItem}><strong>Performance Fee:</strong> Only based on BTC gains (not USD)</div>
                    <div style={styles.termItem}><strong>Liquidity:</strong> Monthly, with 30-day notice</div>
                    <div style={styles.termItem}><strong>High Water Mark:</strong> Yes</div>
                    <div style={styles.termItem}><strong>Fund Impact:</strong> Up to 3% of proceeds allocated to Bitcoin education and Bitcoin Core development initiatives</div>
                  </div>
                </div>
              </div>
            )}

            {activeFundTab === 'performance' && (
              <div style={styles.performanceTab}>
                {/* Fund Track Record */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Fund Track Record</h3>
                  <div style={styles.trackRecordNotice}>
                    <div style={styles.noticeIcon}>ℹ️</div>
                    <p style={styles.fundDetailText}>
                      This is a newly launched Bitcoin-denominated fund and does not yet have an independent performance history.
                    </p>
                  </div>
                </div>

                {/* Reference Fund Performance */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Reference Fund (Atitlan Diversified Alpha Fund)</h3>
                  <p style={styles.fundDetailText}>
                    Operational since 2018 with the following key performance metrics:
                  </p>
                  
                  <div style={styles.performanceLayout}>
                    <div style={styles.performanceMetrics}>
                      <div style={styles.performanceTabMetricCard}>
                        <div style={styles.performanceMetricValue}>20%</div>
                        <div style={styles.performanceMetricLabel}>Average Yearly Net Return</div>
                      </div>
                      <div style={styles.performanceTabMetricCard}>
                        <div style={styles.performanceMetricValue}>1.4%</div>
                        <div style={styles.performanceMetricLabel}>Average Monthly Net Return</div>
                      </div>
                      <div style={styles.performanceTabMetricCard}>
                        <div style={styles.performanceMetricValue}>76%</div>
                        <div style={styles.performanceMetricLabel}>Positive Months</div>
                      </div>
                      <div style={styles.performanceTabMetricCard}>
                        <div style={styles.performanceMetricValue}>-0.1</div>
                        <div style={styles.performanceMetricLabel}>BTC Correlation</div>
                      </div>
                    </div>
                    
                    {/* Performance Chart */}
                    <div style={styles.chartContainer}>
                      <div style={styles.chartTitle}>Monthly Returns Distribution</div>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[
                          { month: 'Jan', return: 1.2 },
                          { month: 'Feb', return: 2.1 },
                          { month: 'Mar', return: 0.8 },
                          { month: 'Apr', return: 1.9 },
                          { month: 'May', return: 1.1 },
                          { month: 'Jun', return: 1.7 },
                          { month: 'Jul', return: 1.3 },
                          { month: 'Aug', return: 0.9 },
                          { month: 'Sep', return: 2.2 },
                          { month: 'Oct', return: 1.5 },
                          { month: 'Nov', return: 1.8 },
                          { month: 'Dec', return: 1.4 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}%`, 'Monthly Return']} />
                          <Bar dataKey="return" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div style={styles.auditedNote}>
                    <strong>Audited Track Record:</strong> 7 years
                  </div>
                  <p style={styles.fundDetailText}>
                    This fund has served as a benchmark and foundation for developing the Multi-Strat fund approach.
                  </p>
                </div>
              </div>
            )}

            {activeFundTab === 'team' && (
              <div style={styles.teamTab}>
                {/* Firm Overview */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Firm Overview</h3>
                  <p style={styles.fundDetailText}>
                    Atitlan Asset Management has been a pioneer in crypto market-neutral strategies since 2017. Originally formed as YRD Capital, the team evolved to form Atitlan Diversified Alpha Fund and expanded into BTC-denominated products by 2021.
                  </p>
                </div>

                {/* Key Team Members */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Key Team Members</h3>
                  <div style={styles.teamGrid}>
                    <div style={styles.teamMember}>
                      <div style={styles.teamMemberRole}>Founder & CEO/CIO</div>
                      <div style={styles.teamMemberName}>Yuval Reisman</div>
                    </div>
                    <div style={styles.teamMember}>
                      <div style={styles.teamMemberRole}>Chairman</div>
                      <div style={styles.teamMemberName}>Ian Morley</div>
                    </div>
                    <div style={styles.teamMember}>
                      <div style={styles.teamMemberRole}>Partner & CRO</div>
                      <div style={styles.teamMemberName}>Edward Misrahi</div>
                    </div>
                    <div style={styles.teamMember}>
                      <div style={styles.teamMemberRole}>COO and Partnership Manager</div>
                      <div style={styles.teamMemberName}>Alon Karniel</div>
                    </div>
                  </div>
                </div>

                {/* Advisory & Governance */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Advisory & Governance</h3>
                  <div style={styles.governanceGrid}>
                    <div style={styles.governanceItem}>
                      <strong>Investment Manager:</strong> Starmark Investment Management Limited (UK FCA regulated)
                    </div>
                    <div style={styles.governanceItem}>
                      <strong>Advisory Committee:</strong> Yuval Reisman, Ian Morley, Edward Misrahi
                    </div>
                    <div style={styles.governanceItem}>
                      <strong>Fund Directors:</strong> Yuval Reisman, Olivier Chevillon, Miles Perryman
                    </div>
                  </div>
                </div>

                {/* Service Providers */}
                <div style={styles.fundDetailSection}>
                  <h3 style={styles.fundDetailTitle}>Service Providers</h3>
                  <div style={styles.serviceProvidersGrid}>
                    <div style={styles.serviceProvider}>
                      <div style={styles.serviceProviderRole}>Auditor</div>
                      <div style={styles.serviceProviderName}>KPMG</div>
                    </div>
                    <div style={styles.serviceProvider}>
                      <div style={styles.serviceProviderRole}>Administrator</div>
                      <div style={styles.serviceProviderName}>NAV Consulting</div>
                    </div>
                    <div style={styles.serviceProvider}>
                      <div style={styles.serviceProviderRole}>Custodians</div>
                      <div style={styles.serviceProviderName}>Komainu & Zodia Custody<br/>(UK FCA registered)</div>
                    </div>
                    <div style={styles.serviceProvider}>
                      <div style={styles.serviceProviderRole}>Banking Partner</div>
                      <div style={styles.serviceProviderName}>Burling Bank</div>
                    </div>
                    <div style={styles.serviceProvider}>
                      <div style={styles.serviceProviderRole}>Legal Counsel</div>
                      <div style={styles.serviceProviderName}>Bolder (Cayman)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Two Column Layout Starts */}
        <div style={styles.twoColumnLayout}>
          {/* Left Column */}
          <div>
            {/* This column is now reserved for future content */}
          </div>

          {/* Right Column */}
          <div>


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

        {/* Call to Action Section */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>Interested in This Vault?</h2>
            <p style={styles.ctaSubtitle}>
              Join institutional investors and high-net-worth individuals who trust our proven strategies for Bitcoin yield generation. 
              Our team of experienced portfolio managers delivers consistent performance while maintaining strict risk controls.
            </p>
            
            <div style={styles.ctaFeatures}>
              <div style={styles.ctaFeature}>
                <div style={styles.ctaFeatureIcon}>🏦</div>
                <div style={styles.ctaFeatureContent}>
                  <h4 style={styles.ctaFeatureTitle}>Professional Portfolio Management</h4>
                  <p style={styles.ctaFeatureText}>Experienced team with proven track record in digital asset management and institutional trading strategies.</p>
                </div>
              </div>
              
              <div style={styles.ctaFeature}>
                <div style={styles.ctaFeatureIcon}>🔒</div>
                <div style={styles.ctaFeatureContent}>
                  <h4 style={styles.ctaFeatureTitle}>Institutional-Grade Security</h4>
                  <p style={styles.ctaFeatureText}>Multi-signature custody solutions with insurance coverage up to $500M through leading enterprise providers.</p>
                </div>
              </div>
              
              <div style={styles.ctaFeature}>
                <div style={styles.ctaFeatureIcon}>📈</div>
                <div style={styles.ctaFeatureContent}>
                  <h4 style={styles.ctaFeatureTitle}>Transparent Reporting</h4>
                  <p style={styles.ctaFeatureText}>Regular performance updates, detailed monthly statements, and full transparency on all investment activities.</p>
                </div>
              </div>
              
              <div style={styles.ctaFeature}>
                <div style={styles.ctaFeatureIcon}>⚡</div>
                <div style={styles.ctaFeatureContent}>
                  <h4 style={styles.ctaFeatureTitle}>Proven Strategy</h4>
                  <p style={styles.ctaFeatureText}>Consistent returns through market cycles with advanced risk management and systematic rebalancing protocols.</p>
                </div>
              </div>
            </div>
            
            <div style={styles.ctaAction}>
              <button 
                style={styles.ctaButton}
                onClick={() => setIsContactModalOpen(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ea580c';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(249, 115, 22, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f97316';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(249, 115, 22, 0.2)';
                }}
              >
                Contact Our Investment Team
              </button>
              <p style={styles.ctaDisclaimer}>
                Schedule a consultation to discuss your investment goals and learn how this vault fits into your portfolio strategy.
              </p>
            </div>
          </div>
        </section>
      </main>

      
      <ContactForm
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
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