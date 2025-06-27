'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

interface Transaction {
  id: string;
  txHash: string;
  amount: number;
  confirmations: number;
  targetConfirmations: number;
  accountAddress: string;
}

interface DepositAccount {
  contractId: string;
  btcAddress: string;
}

interface WithdrawAccount {
  contractId: string;
  btcAddress: string;
  pendingBalance: number;
}

interface PendingWithdrawal {
  id: string;
  accountId: string;
  amount: number;
  status: 'pending' | 'confirmed';
  timestamp: Date;
}

type SwapDirection = 'btc-to-cbtc' | 'cbtc-to-btc';
type WizardStep = 1 | 2 | 3 | 4;

export default function Home() {
  const [isMobile, setIsMobile] = useState(true);
  const [swapDirection, setSwapDirection] = useState<SwapDirection>('btc-to-cbtc');
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedAccount, setSelectedAccount] = useState<DepositAccount | null>(null);
  const [swapAmount, setSwapAmount] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [newAccountAddress, setNewAccountAddress] = useState('');
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] = useState<WithdrawAccount | null>(null);
  const [newWithdrawAddress, setNewWithdrawAddress] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [btcBalance, setBtcBalance] = useState(0.025);
  const [cbtcBalance, setCbtcBalance] = useState(0.001);
  const [completedDeposits, setCompletedDeposits] = useState<Set<string>>(new Set());
  
  // Withdrawal interface state
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAddressError, setWithdrawAddressError] = useState('');
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawalSubmitted, setWithdrawalSubmitted] = useState(false);
  const [withdrawContractId] = useState(() => 
    Math.random().toString(36).substr(2, 16) + "..." + Math.random().toString(36).substr(2, 8)
  );

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Transaction history for display
  const [transactionHistory, setTransactionHistory] = useState<Array<{
    id: string;
    type: 'mint' | 'burn';
    amount: number;
    contractId: string;
    btcAddress: string;
    confirmations: number;
    targetConfirmations: number;
    status: 'pending' | 'completed';
    timestamp: Date;
  }>>([]);



  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 1024);

      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleKeycloakLogin = () => {
    // Simulate Keycloak login - in real app this would redirect to Keycloak
    setIsAuthenticated(true);
    setShowLoginPrompt(false);
    alert('Successfully logged in via Keycloak!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    alert('Logged out');
  };

  const handleAuthenticationChange = (isAuth: boolean) => {
    setIsAuthenticated(isAuth);
    if (isAuth) {
      setShowLoginPrompt(false);
    }
  };

  const checkAuthAndProceed = (action: () => void) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    action();
  };

  // Bitcoin address validation
  const validateBitcoinAddress = (address: string): boolean => {
    if (!address || address.length < 26) return false;
    
    // Legacy addresses (P2PKH and P2SH)
    const legacyPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    
    // Mainnet Bech32 (P2WPKH and P2WSH)
    const segwitPattern = /^bc1[a-z0-9]{39,59}$/;
    
    // Mainnet Taproot (P2TR)
    const taprootPattern = /^bc1p[a-z0-9]{58}$/;
    
    // Testnet addresses
    const testnetLegacyPattern = /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const testnetBech32Pattern = /^(tb1|bcrt1)[a-z0-9]{39,59}$/;
    const testnetTaprootPattern = /^(tb1p|bcrt1p)[a-z0-9]{58}$/;
    
    return legacyPattern.test(address) || 
           segwitPattern.test(address) || 
           taprootPattern.test(address) ||
           testnetLegacyPattern.test(address) ||
           testnetBech32Pattern.test(address) ||
           testnetTaprootPattern.test(address);
  };

  // Generate a proper full Bitcoin address
  const generateBitcoinAddress = (): string => {
    // Generate a proper testnet address for demonstration
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let address = 'bcrt1q';
    
    // Generate 39 characters for a valid bech32 testnet address
    for (let i = 0; i < 39; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
  };

  const simulateDeposit = (accountAddress: string, amount: number) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      txHash: `7e3dd95e39e93a1b9e6ee8de4cf3e69ce639854a387916556efc3aee63f7def`,
      amount,
      confirmations: 0,
      targetConfirmations: 6,
      accountAddress
    };
    
    // Add to transaction history
    const historyTransaction = {
      id: newTransaction.id,
      type: 'mint' as const,
      amount,
      contractId: selectedAccount?.contractId || 'Unknown',
      btcAddress: accountAddress,
      confirmations: 0,
      targetConfirmations: 6,
      status: 'pending' as const,
      timestamp: new Date()
    };
    setTransactionHistory(prev => [historyTransaction, ...prev]);
    
    setActiveTransactions(prev => [...prev, newTransaction]);
    
    // Simulate confirmation progression
    const interval = setInterval(() => {
      setActiveTransactions(prev => 
        prev.map(tx => 
          tx.id === newTransaction.id 
            ? { ...tx, confirmations: Math.min(tx.confirmations + 1, tx.targetConfirmations) }
            : tx
        )
      );
      
      // Update transaction history
      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.id === newTransaction.id 
            ? { ...tx, confirmations: Math.min(tx.confirmations + 1, tx.targetConfirmations) }
            : tx
        )
      );
    }, 2000);

    // Clean up completed transactions after they reach target confirmations
    setTimeout(() => {
      clearInterval(interval);
      setActiveTransactions(prev => prev.filter(tx => tx.id !== newTransaction.id));
      
      // Update transaction history to completed
      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.id === newTransaction.id 
            ? { ...tx, status: 'completed' as const }
            : tx
        )
      );
      
              // Update balances and mark as completed when transaction completes (for BTC->CBTC minting)
      if (swapDirection === 'btc-to-cbtc') {
        setCbtcBalance(prev => prev + amount);
        setCompletedDeposits(prev => new Set(prev).add(accountAddress));
      }
    }, 12000);
  };

  const addWithdrawalToHistory = (amount: number, contractId: string, btcAddress: string) => {
    const historyTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'burn' as const,
      amount,
      contractId,
      btcAddress,
      confirmations: 6,
      targetConfirmations: 6,
      status: 'completed' as const,
      timestamp: new Date()
    };
    setTransactionHistory(prev => [historyTransaction, ...prev]);
  };

  const confirmWithdrawal = (withdrawalId: string) => {
    const withdrawal = pendingWithdrawals.find(w => w.id === withdrawalId);
    
    setPendingWithdrawals(prev => 
      prev.map(withdrawal => 
        withdrawal.id === withdrawalId 
          ? { ...withdrawal, status: 'confirmed' }
          : withdrawal
      )
    );
    
    // Update balances when withdrawal is confirmed
    if (withdrawal) {
      setCbtcBalance(prev => prev - withdrawal.amount);
      setBtcBalance(prev => prev + withdrawal.amount);
    }
    
    // Remove confirmed withdrawal after 3 seconds
    setTimeout(() => {
      setPendingWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));
    }, 3000);
  };

  const [depositAccounts, setDepositAccounts] = useState<DepositAccount[]>([
    {
      contractId: "0015d0eebf2ef5c0da2693367df5527cdc83ec051ca420aec20c7eedb9fb8a6747ca11122039bd8633ddd39dc9151bdf291625f3a2dd176ff86e3801f8320432ddf9aff8eb",
      btcAddress: "bcrt1q38ccn2f9fkwhqhztp4zs26m38usms348xz6h70c680zr29795yusnw4kvh"
    },
    {
      contractId: "0033a679360750e815430e34ace316bdc98c525e7bae9631da5bc19471ad69e2cca1112204b33175b1b3d34243a804b8e1425468bcdaef77ea15f8fef2d4b4de185918643",
      btcAddress: "bcrt1q2kf3uu3chmxmk78vjxtqfk8xrzp6pf8qq4a4wtj4e65h06kvqrqp8rqlaz"
    }
  ]);

  const [withdrawAccounts, setWithdrawAccounts] = useState<WithdrawAccount[]>([
    {
      contractId: "004fe547...e55393",
      btcAddress: "bcrt1q5htran1qa5kuagk2xdwr3j7bq6aa6drenvh4ml8wfx2yz3kp5rtqq",
      pendingBalance: 1000000000
    },
    {
      contractId: "09967b1c...e890c2",
      btcAddress: "bcrt1qgc2rdrp2swqpqh55svvp5v4r45te60618m7n3x4y5z6a7b8c9d0e1f",
      pendingBalance: 0
    },
    {
      contractId: "0fd00db8...f92bc",
      btcAddress: "bcrt1q7hva1nqqqypqr593ea5g1j9h2r4lygo5k6l7m8n9p0q1r2s3t4u5v",
      pendingBalance: 0
    }
  ]);

  const createNewAccount = () => {
    if (!newAccountAddress) return;
    
    // Validate Bitcoin address before creating account
    if (!validateBitcoinAddress(newAccountAddress)) {
      alert('Please enter a valid Bitcoin address');
      return;
    }
    
    const newAccount: DepositAccount = {
      contractId: Math.random().toString(36).substr(2, 12) + "..." + Math.random().toString(36).substr(2, 6),
      btcAddress: newAccountAddress
    };
    
    setDepositAccounts(prev => [...prev, newAccount]);
    setSelectedAccount(newAccount);
    setNewAccountAddress('');
    setCurrentStep(2);
  };

  const createNewWithdrawAccount = () => {
    if (!newWithdrawAddress) return;
    
    // Validate Bitcoin address before creating account
    if (!validateBitcoinAddress(newWithdrawAddress)) {
      alert('Please enter a valid Bitcoin address');
      return;
    }
    
    const newAccount: WithdrawAccount = {
      contractId: Math.random().toString(36).substr(2, 12) + "..." + Math.random().toString(36).substr(2, 6),
      btcAddress: newWithdrawAddress,
      pendingBalance: 0
    };
    
    setWithdrawAccounts(prev => [...prev, newAccount]);
    setSelectedWithdrawAccount(newAccount);
    setNewWithdrawAddress('');
    setCurrentStep(2);
  };

  const selectAccount = (account: DepositAccount) => {
    setSelectedAccount(account);
    setCurrentStep(2);
  };

  const selectWithdrawAccount = (account: WithdrawAccount) => {
    setSelectedWithdrawAccount(account);
    setCurrentStep(2);
  };

  const proceedToDeposit = () => {
    if (swapAmount && parseFloat(swapAmount) > 0) {
      setCurrentStep(3);
    }
  };

  const proceedToWithdraw = () => {
    if (swapAmount && parseFloat(swapAmount) > 0) {
      setCurrentStep(3);
    }
  };

  const checkDepositStatus = () => {
    // Simulate checking for deposits
    if (selectedAccount && swapAmount) {
      simulateDeposit(selectedAccount.btcAddress, parseFloat(swapAmount));
      setCurrentStep(4);
    }
  };

  const submitWithdrawal = () => {
    if (selectedWithdrawAccount && swapAmount) {
      const newWithdrawal: PendingWithdrawal = {
        id: Math.random().toString(36).substr(2, 9),
        accountId: selectedWithdrawAccount.contractId,
        amount: parseFloat(swapAmount),
        status: 'pending',
        timestamp: new Date()
      };
      
      setPendingWithdrawals(prev => [...prev, newWithdrawal]);
      
      // Update pending balance
      setWithdrawAccounts(prev => 
        prev.map(account => 
          account.contractId === selectedWithdrawAccount.contractId
            ? { ...account, pendingBalance: account.pendingBalance + parseFloat(swapAmount) * 100000000 }
            : account
        )
      );
      
      setCurrentStep(4);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedAccount(null);
    setSelectedWithdrawAccount(null);
    setSwapAmount('');
    setNewAccountAddress('');
    setNewWithdrawAddress('');
  };

  const switchDirection = (direction: SwapDirection) => {
    setSwapDirection(direction);
    resetWizard();
  };

  const handleSwapTokens = () => {
    setSwapDirection(swapDirection === 'btc-to-cbtc' ? 'cbtc-to-btc' : 'btc-to-cbtc');
    setSwapAmount('');
  };

  const startSwapFlow = () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) return;
    
    if (swapDirection === 'btc-to-cbtc') {
      // Auto-create deposit account for BTC->CBTC flow
      const newAccount: DepositAccount = {
        contractId: Math.random().toString(36).substr(2, 16) + "..." + Math.random().toString(36).substr(2, 8),
        btcAddress: generateBitcoinAddress()
      };
      
      setDepositAccounts(prev => [...prev, newAccount]);
      setSelectedAccount(newAccount);
      setShowWizard(true);
    } else {
      // For CBTC->BTC, go to withdraw wizard
      setShowWizard(true);
      setCurrentStep(1);
    }
  };

  const backToSwapInterface = () => {
    setShowWizard(false);
    setSelectedAccount(null);
    setSelectedWithdrawAccount(null);
    setSwapAmount('');
    setNewAccountAddress('');
    setNewWithdrawAddress('');
    setCurrentStep(1);
    // Clear completed deposits when starting fresh
    setCompletedDeposits(new Set());
    // Clear withdrawal state
    setWithdrawAddress('');
    setWithdrawAddressError('');
    setConfirmWithdraw(false);
    setWithdrawalSubmitted(false);
  };

  const renderDepositInstructions = () => {
    if (swapDirection === 'btc-to-cbtc') {
      const relevantTransactions = activeTransactions.filter(tx => tx.accountAddress === selectedAccount?.btcAddress);
      const hasDeposit = relevantTransactions.length > 0;
      const isCompleted = selectedAccount && completedDeposits.has(selectedAccount.btcAddress);

      if (isCompleted) {
        return (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#f97316',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                    fill="white"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#065f46',
                margin: '0 0 0.5rem 0'
              }}>
                Success!
              </h2>
              <p style={{
                color: '#059669',
                fontSize: '1.125rem',
                margin: 0
              }}>
                {parseFloat(swapAmount).toFixed(8)} CBTC is now deposited into your wallet
              </p>
            </div>

            <button
              onClick={backToSwapInterface}
              style={{
                width: '100%',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Make Another Transaction
            </button>
          </div>
        );
      }

      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#374151',
              margin: '0 0 0.5rem 0'
            }}>
              Deposit BTC to Mint CBTC
            </h2>
            <p style={{
              color: '#6b7280',
              margin: 0
            }}>
              Send {swapAmount} BTC to the address below
            </p>
          </div>

          {/* Contract ID */}
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Contract ID:
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: '#374151',
              wordBreak: 'break-all',
              lineHeight: '1.4'
            }}>
              {selectedAccount?.contractId}
            </div>
          </div>

          {/* BTC Address */}
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Deposit {swapAmount} BTC to this BTC Address:
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                color: '#374151',
                fontWeight: '600',
                flex: 1,
                wordBreak: 'break-all'
              }}>
                {selectedAccount?.btcAddress}
              </div>
              <button
                onClick={() => copyToClipboard(selectedAccount?.btcAddress || '')}
                style={{
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Copy
              </button>
            </div>
          </div>

          {/* Active Transactions */}
          {hasDeposit && (
            <div style={{
              backgroundColor: '#fff7ed',
              border: '1px solid #f97316',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#f97316',
                  borderRadius: '50%'
                }} />
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#065f46'
                }}>
                  Deposit Detected!
                </span>
              </div>
              
              {relevantTransactions.map(tx => (
                  <div key={tx.id} style={{
                    backgroundColor: 'white',
                    border: '1px solid #dcfce7',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#065f46',
                        fontWeight: '600'
                      }}>
                        Transaction: {tx.amount.toFixed(8)} BTC
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#065f46',
                        fontWeight: '600'
                      }}>
                        {tx.confirmations} / {tx.targetConfirmations} confirmations
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {tx.txHash}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => {
              checkAuthAndProceed(() => {
                if (selectedAccount) {
                  if (hasDeposit) {
                    // Refresh status - just trigger a re-render, don't create new transactions
                    setActiveTransactions([...activeTransactions]);
                  } else {
                    // Check for deposit - simulate new deposit
                    simulateDeposit(selectedAccount.btcAddress, parseFloat(swapAmount));
                  }
                }
              });
            }}
            style={{
              width: '100%',
              backgroundColor: hasDeposit ? '#6b7280' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {hasDeposit ? 'Refresh Status' : 'Check for Deposit'}
          </button>
        </div>
      );
    }

    // For withdraw flow, show simplified withdrawal interface
    return renderWithdrawalInterface();
  };

  const renderTransactionHistory = () => {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '1.5rem',
        padding: isMobile ? '1rem' : '1.5rem',
        minHeight: isMobile ? '300px' : '500px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 'bold',
            color: '#374151',
            margin: 0
          }}>
            Transaction History
          </h3>
      
          
        </div>

        {!isAuthenticated ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3S15 4.34 15 6V8H9V6ZM18 20H6V10H18V20Z"
                  fill="#6b7280"
                />
                <circle cx="12" cy="15" r="2" fill="#6b7280"/>
              </svg>
            </div>
            <p style={{
              fontSize: '0.875rem',
              margin: '0 0 1rem 0'
            }}>
              Please log in to view your transaction history
            </p>
            <button
              onClick={() => setShowLoginPrompt(true)}
              style={{
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </div>
        ) : (
          <div>
            {transactionHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3ZM19 19H5V5H7V7H17V5H19V19Z"
                      fill="#6b7280"
                    />
                  </svg>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  No transactions yet
                </p>
              </div>
            ) : (
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {transactionHistory.map((tx, index) => (
                  <div
                    key={tx.id}
                    style={{
                      backgroundColor: tx.status === 'pending' ? '#f3f4f6' : 'white',
                      border: `1px solid ${tx.status === 'pending' ? '#d1d5db' : '#e5e7eb'}`,
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      marginBottom: index === transactionHistory.length - 1 ? 0 : '0.75rem'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {tx.type === 'mint' ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4L6 10H10V20H14V10H18L12 4Z"
                                fill="#6b7280"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 20L18 14H14V4H10V14H6L12 20Z"
                                fill="#6b7280"
                              />
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          {tx.type === 'mint' ? 'Mint' : 'Burn'} {tx.amount.toFixed(8)} {tx.type === 'mint' ? 'CBTC' : 'BTC'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: tx.status === 'completed' ? '#6b7280' : '#9ca3af',
                          borderRadius: '50%'
                        }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          textTransform: 'capitalize'
                        }}>
                          {tx.status}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        marginBottom: '0.25rem'
                      }}>
                        <strong>Contract ID:</strong> {tx.contractId}
                      </div>
                      <div style={{
                        marginBottom: '0.25rem',
                        fontFamily: 'monospace'
                      }}>
                        <strong>Address:</strong> {tx.btcAddress}
                      </div>
                      <div style={{
                        marginBottom: '0.25rem'
                      }}>
                        <strong>Confirmations:</strong> {tx.confirmations}/{tx.targetConfirmations}
                      </div>
                      <div>
                        <strong>Time:</strong> {tx.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLoginPrompt = () => {
    if (!showLoginPrompt) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1C8.5 1 5.6 3.9 5.6 7.4V10H4C2.9 10 2 10.9 2 12V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V12C22 10.9 21.1 10 20 10H18.4V7.4C18.4 3.9 15.5 1 12 1ZM16.4 10H7.6V7.4C7.6 5 9.6 3 12 3S16.4 5 16.4 7.4V10Z"
                fill="#374151"
              />
              <circle cx="12" cy="16" r="2" fill="#374151"/>
              <path d="M11 18H13V21H11V18Z" fill="#374151"/>
            </svg>
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#374151',
            margin: '0 0 1rem 0'
          }}>
            Authentication Required
          </h3>
          <p style={{
            color: '#6b7280',
            margin: '0 0 2rem 0',
            lineHeight: '1.5'
          }}>
            You need to log in to perform this action and view your transactions.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            <button
              onClick={() => setShowLoginPrompt(false)}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleKeycloakLogin}
              style={{
                flex: 1,
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Login 
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderWithdrawalInterface = () => {
    if (withdrawalSubmitted) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#f97316',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 2V8H18V2H6ZM8 4H16V6H8V4Z"
                  fill="white"
                />
                <path
                  d="M6 8L18 8L15 12L18 16L6 16L9 12L6 8Z"
                  fill="white"
                />
                <path
                  d="M6 16V22H18V16H6ZM8 18H16V20H8V18Z"
                  fill="white"
                />
                <circle cx="12" cy="12" r="1" fill="white"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#ea580c',
              margin: '0 0 0.5rem 0'
            }}>
              Withdrawal Pending
            </h2>
            <p style={{
              color: '#ea580c',
              fontSize: '1.125rem',
              margin: '0 0 1rem 0'
            }}>
              {parseFloat(swapAmount).toFixed(8)} CBTC withdrawal is being processed
            </p>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: 0
            }}>
              BTC will be sent to: {withdrawAddress}
            </p>
          </div>

          <button
            onClick={backToSwapInterface}
            style={{
              width: '100%',
              backgroundColor: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Make Another Transaction
          </button>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#374151',
            margin: '0 0 0.5rem 0'
          }}>
            Withdraw BTC
          </h2>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            Burn {swapAmount} CBTC to receive {swapAmount} BTC
          </p>
        </div>

        {/* Contract ID */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            Contract ID:
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#374151',
            wordBreak: 'break-all',
                        lineHeight: '1.4'
          }}>
            {withdrawContractId}
          </div>
        </div>

        {/* BTC Address Input */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            Enter BTC address to receive {swapAmount} BTC:
          </div>
          <input
            type="text"
            value={withdrawAddress}
            onChange={(e) => {
              const address = e.target.value;
              setWithdrawAddress(address);
              
              // Validate address in real time
              if (address && !validateBitcoinAddress(address)) {
                setWithdrawAddressError('Invalid Bitcoin address format');
              } else {
                setWithdrawAddressError('');
              }
            }}
            placeholder="Enter your BTC address (e.g., bcrt1q... or bc1q... or 1...)"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${withdrawAddressError ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              outline: 'none'
            }}
          />
          {withdrawAddressError && (
            <div style={{
              fontSize: '0.75rem',
              color: '#ef4444',
              marginTop: '0.25rem'
            }}>
              {withdrawAddressError}
            </div>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <input
              type="checkbox"
              checked={confirmWithdraw}
              onChange={(e) => setConfirmWithdraw(e.target.checked)}
              style={{
                marginTop: '0.25rem',
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            />
            <label 
              onClick={() => setConfirmWithdraw(!confirmWithdraw)}
              style={{
                fontSize: '0.875rem',
                color: '#92400e',
                lineHeight: '1.5',
                flex: 1,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              I confirm that I want to burn {parseFloat(swapAmount).toFixed(8)} CBTC and withdraw {parseFloat(swapAmount).toFixed(8)} BTC to the address above. 
              This action cannot be undone.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => {
            checkAuthAndProceed(() => {
              if (withdrawAddress && confirmWithdraw && !withdrawAddressError) {
                setWithdrawalSubmitted(true);
                // Update balance
                setCbtcBalance(prev => prev - parseFloat(swapAmount));
                // Add to transaction history
                addWithdrawalToHistory(parseFloat(swapAmount), withdrawContractId, withdrawAddress);
              }
            });
          }}
          disabled={!withdrawAddress || !confirmWithdraw || !!withdrawAddressError}
          style={{
            width: '100%',
            backgroundColor: withdrawAddress && confirmWithdraw && !withdrawAddressError ? '#f97316' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '1rem',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: withdrawAddress && confirmWithdraw && !withdrawAddressError ? 'pointer' : 'not-allowed'
          }}
        >
          Confirm Withdrawal
        </button>
      </div>
    );
  };

  const renderSwapInterface = () => {
    const fromToken = swapDirection === 'btc-to-cbtc' ? 'BTC' : 'CBTC';
    const toToken = swapDirection === 'btc-to-cbtc' ? 'CBTC' : 'BTC';
    const fromBalance = swapDirection === 'btc-to-cbtc' ? btcBalance : cbtcBalance;
    const toBalance = swapDirection === 'btc-to-cbtc' ? cbtcBalance : btcBalance;
    const actionText = swapDirection === 'btc-to-cbtc' ? 'Deposit BTC for CBTC' : 'Withdraw BTC';

    return (
      <div style={{
        maxWidth: isMobile ? '100%' : '480px',
        margin: isMobile ? '1rem auto' : '2rem auto',
        padding: isMobile ? '0 0.5rem' : '0 1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '1.5rem',
          padding: isMobile ? '1rem' : '1.5rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0
            }}>
              {swapDirection === 'btc-to-cbtc' ? 'Mint CBTC' : 'Burn CBTC'}
            </h2>
          </div>

          {/* From Token Field */}
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '1rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                From
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Balance: {fromBalance.toFixed(8)} {fromToken}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="0.0"
                step="0.001"
                min="0"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#374151',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '2rem',
                padding: '0.5rem 0.75rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {fromToken === 'BTC' ? (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#f7931a',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      ₿
                    </div>
                  ) : (
                    <Image
                      src="/token.png"
                      alt="CBTC"
                      width={24}
                      height={24}
                      style={{ borderRadius: '50%' }}
                    />
                  )}
                </div>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {fromToken}
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '0.5rem'
            }}>
              <button
                onClick={() => setSwapAmount(fromBalance.toFixed(8))}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f97316',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff7ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Swap Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '0.5rem 0'
          }}>
            <button
              onClick={handleSwapTokens}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f97316';
                e.currentTarget.style.transform = 'rotate(180deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 21L3 16.5M3 16.5L7.5 12M3 16.5H16.5C18.9853 16.5 21 14.4853 21 12C21 9.51472 18.9853 7.5 16.5 7.5H12"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.5 3L21 7.5M21 7.5L16.5 12M21 7.5H7.5C5.01472 7.5 3 9.51472 3 12C3 14.4853 5.01472 16.5 7.5 16.5H12"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* To Token Field */}
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '1rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                To
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Balance: {toBalance.toFixed(8)} {toToken}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                flex: 1,
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#9ca3af',
                fontFamily: 'inherit'
              }}>
                {swapAmount ? parseFloat(swapAmount).toFixed(8) : '0.00000000'}
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '2rem',
                padding: '0.5rem 0.75rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {toToken === 'BTC' ? (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#f7931a',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      ₿
                    </div>
                  ) : (
                    <Image
                      src="/token.png"
                      alt="CBTC"
                      width={24}
                      height={24}
                      style={{ borderRadius: '50%' }}
                    />
                  )}
                </div>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {toToken}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => checkAuthAndProceed(startSwapFlow)}
            disabled={!swapAmount || parseFloat(swapAmount) <= 0}
            style={{
              width: '100%',
              backgroundColor: swapAmount && parseFloat(swapAmount) > 0 
                ? '#f97316'
                : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              padding: '1rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: swapAmount && parseFloat(swapAmount) > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (swapAmount && parseFloat(swapAmount) > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {actionText}
          </button>

          {/* Rate Display */}
          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            1 {fromToken} = 1 {toToken}
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (swapDirection === 'cbtc-to-btc') {
      switch (currentStep) {
        case 1:
          return (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
                Step 1: Select or Create Withdraw Account
              </h3>
              
              {/* Create New Withdraw Account Section */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#92400e' }}>
                  Create New Withdraw Account
                </h4>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={newWithdrawAddress}
                    onChange={(e) => setNewWithdrawAddress(e.target.value)}
                    placeholder="Enter BTC address to receive withdrawal"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                <button
                  onClick={createNewWithdrawAccount}
                  disabled={!newWithdrawAddress}
                  style={{
                    backgroundColor: newWithdrawAddress ? '#f97316' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: newWithdrawAddress ? 'pointer' : 'not-allowed'
                  }}
                >
                  Create Withdraw Account
                </button>
              </div>

              {/* Existing Withdraw Accounts */}
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                Or Select Existing Withdraw Account
              </h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {withdrawAccounts.map((account, index) => (
                  <div
                    key={index}
                    onClick={() => selectWithdrawAccount(account)}
                    style={{
                      backgroundColor: '#f9fafb',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f97316';
                      e.currentTarget.style.backgroundColor = '#fff7ed';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                        Withdraw Account {index + 1}:
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      {account.btcAddress}
                    </div>
                    {account.pendingBalance > 0 && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#f97316',
                        fontWeight: '600'
                      }}>
                        Pending Balance: {account.pendingBalance.toLocaleString()} satoshis
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );

        case 2:
          return (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
                Step 2: Enter Amount to Withdraw
              </h3>
              
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                    Selected Withdraw Account:
                  </span>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#374151',
                    marginTop: '0.25rem'
                  }}>
                    {selectedWithdrawAccount?.btcAddress}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Amount in CBTC to Burn:
                  </label>
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.001"
                    step="0.001"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    You will receive {swapAmount || '0'} BTC at the selected address
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      flex: 1,
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={proceedToWithdraw}
                    disabled={!swapAmount || parseFloat(swapAmount) <= 0}
                    style={{
                      flex: 2,
                      backgroundColor: swapAmount && parseFloat(swapAmount) > 0 ? '#f97316' : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: swapAmount && parseFloat(swapAmount) > 0 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          );

        case 3:
          return (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
                Step 3: Confirm Withdrawal
              </h3>
              
              <div style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #f97316',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#f97316',
                    borderRadius: '50%'
                  }} />
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#c2410c' }}>
                    Confirm Withdrawal Details
                  </span>
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                      Amount to Burn:
                    </span>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                      {swapAmount} CBTC
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                      You will receive:
                    </span>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                      {swapAmount} BTC
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                      Destination Address:
                    </span>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      color: '#374151',
                      wordBreak: 'break-all'
                    }}>
                      {selectedWithdrawAccount?.btcAddress}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{
                      flex: 1,
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={submitWithdrawal}
                    style={{
                      flex: 2,
                      backgroundColor: '#f97316',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Withdrawal
                  </button>
                </div>
              </div>
            </div>
          );

        case 4:
          return (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
                Step 4: Withdrawal Status
              </h3>
              
              <div style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #f97316',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#f97316',
                    borderRadius: '50%'
                  }} />
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#065f46' }}>
                    Withdrawal Submitted
                  </span>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: '600' }}>
                      Withdrawal Details:
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#065f46' }}>
                      Amount: {swapAmount} CBTC → {swapAmount} BTC
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#374151',
                    wordBreak: 'break-all'
                  }}>
                    Destination: {selectedWithdrawAccount?.btcAddress}
                  </div>
                </div>

                {/* Pending Withdrawals */}
                {pendingWithdrawals
                  .filter(w => w.accountId === selectedWithdrawAccount?.contractId)
                  .map(withdrawal => (
                    <div
                      key={withdrawal.id}
                      style={{
                        backgroundColor: withdrawal.status === 'pending' ? '#fef3c7' : '#fff7ed',
                        border: `1px solid ${withdrawal.status === 'pending' ? '#fbbf24' : '#f97316'}`,
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          color: withdrawal.status === 'pending' ? '#92400e' : '#065f46',
                          fontWeight: '600'
                        }}>
                          Status: {withdrawal.status === 'pending' ? 'Pending' : 'Confirmed'}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: withdrawal.status === 'pending' ? '#92400e' : '#065f46'
                        }}>
                          {withdrawal.amount} BTC
                        </span>
                      </div>
                    </div>
                  ))}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={resetWizard}
                    style={{
                      flex: 1,
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    New Transaction
                  </button>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
              Step 1: Select or Create Deposit Account
            </h3>
            
            {/* Create New Account Section */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#0369a1' }}>
                Create New Account
              </h4>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={newAccountAddress}
                  onChange={(e) => setNewAccountAddress(e.target.value)}
                  placeholder="Enter new BTC address"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <button
                onClick={createNewAccount}
                disabled={!newAccountAddress}
                style={{
                  backgroundColor: newAccountAddress ? '#f97316' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: newAccountAddress ? 'pointer' : 'not-allowed'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Existing Accounts */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
              Or Select Existing Account
            </h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {depositAccounts.map((account, index) => (
                <div
                  key={index}
                  onClick={() => selectAccount(account)}
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.backgroundColor = '#fff7ed';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                >
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                      Account {index + 1}:
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    {account.btcAddress}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
              Step 2: Enter Amount to Deposit
            </h3>
            
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                  Selected Account:
                </span>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: '#374151',
                  marginTop: '0.25rem'
                }}>
                  {selectedAccount?.btcAddress}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Amount in BTC:
                </label>
                <input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="0.001"
                  step="0.001"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={proceedToDeposit}
                  disabled={!swapAmount || parseFloat(swapAmount) <= 0}
                  style={{
                    flex: 2,
                    backgroundColor: swapAmount && parseFloat(swapAmount) > 0 ? '#f97316' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: swapAmount && parseFloat(swapAmount) > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
              Step 3: Awaiting Deposit
            </h3>
            
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '50%'
                }} />
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#92400e' }}>
                  Waiting for BTC Deposit
                </span>
              </div>
              
              <p style={{ color: '#92400e', marginBottom: '1.5rem' }}>
                Please send <strong>{swapAmount} BTC</strong> to the address below:
              </p>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                    Deposit Address:
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#374151',
                    flex: 1,
                    wordBreak: 'break-all'
                  }}>
                    {selectedAccount?.btcAddress}
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedAccount?.btcAddress || '')}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={checkDepositStatus}
                  style={{
                    flex: 2,
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Check for Deposit
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#374151' }}>
              Step 4: Deposit Status
            </h3>
            
            <div style={{
              backgroundColor: '#fff7ed',
              border: '1px solid #f97316',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#f97316',
                  borderRadius: '50%'
                }} />
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#065f46' }}>
                  Deposit Detected
                </span>
              </div>

              {/* Active Transactions */}
              {activeTransactions
                .filter(tx => tx.accountAddress === selectedAccount?.btcAddress)
                .map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: '600' }}>
                        Transaction ID:
                      </span>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#374151',
                        wordBreak: 'break-all'
                      }}>
                        {tx.txHash}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.875rem', color: '#065f46' }}>
                        Amount: {tx.amount.toFixed(8)} BTC
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#065f46',
                        fontWeight: '600'
                      }}>
                        {tx.confirmations} / {tx.targetConfirmations} confirmations
                      </span>
                    </div>
                  </div>
                ))}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => checkDepositStatus()}
                  style={{
                    flex: 1,
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Refresh Status
                </button>
                <button
                  onClick={resetWizard}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  New Transaction
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
              <Navbar 
          isAuthenticated={isAuthenticated}
          onAuthRequired={() => setShowLoginPrompt(true)}
          onAuthenticated={handleAuthenticationChange}
          cbtcBalance={cbtcBalance}
        />
        
        {renderLoginPrompt()}
        
        <div className="container">
          {/* Main Interface */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            alignItems: 'flex-start'
          }}>
            {/* Left Column - Swap Interface */}
            <div style={{
              flex: '1',
              minWidth: isMobile ? 'auto' : '480px',
              width: isMobile ? '100%' : 'auto'
            }}>
              {!showWizard ? (
                renderSwapInterface()
              ) : (
                <div>
                  {/* Back Button */}
                  <div style={{
                    marginBottom: '1rem'
                  }}>
                    <button
                      onClick={backToSwapInterface}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      ← Back to Swap
                    </button>
                  </div>

                  {/* Deposit Instructions */}
                  {renderDepositInstructions()}
                </div>
              )}
            </div>

            {/* Right Column - Transaction History */}
            <div style={{
              flex: '1',
              marginTop: isMobile ? '0' : '50px',
              minWidth: isMobile ? 'auto' : '400px',
              width: isMobile ? '100%' : 'auto'
            }}>
              {renderTransactionHistory()}
            </div>
          </div>
        </div>

      {/* Debug Floating Window */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        {!showDebug ? (
          <button
            onClick={() => setShowDebug(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Debug
          </button>
        ) : (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '1rem',
            minWidth: '300px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Debug: Simulate Transactions
              </h3>
              <button
                onClick={() => setShowDebug(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Deposit Debug */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Simulate BTC Deposits:
              </div>
              
              {/* Quick trigger for current transaction */}
              {showWizard && selectedAccount && swapDirection === 'btc-to-cbtc' && (
                <button
                  onClick={() => simulateDeposit(selectedAccount.btcAddress, parseFloat(swapAmount))}
                  style={{
                    width: '100%',
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}
                >
                  Simulate Current Deposit ({swapAmount} BTC)
                </button>
              )}

              {/* Quick trigger for withdrawal test */}
              {showWizard && swapDirection === 'cbtc-to-btc' && (
                <button
                  onClick={() => {
                    // Simulate withdrawal completion by just updating balance
                    setCbtcBalance(prev => prev - parseFloat(swapAmount));
                    setBtcBalance(prev => prev + parseFloat(swapAmount));
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}
                >
                  Simulate Withdrawal Complete ({swapAmount} BTC)
                </button>
              )}
              
              {depositAccounts.map((account, index) => (
                <div key={index} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => simulateDeposit(account.btcAddress, 0.001)}
                    style={{
                      width: '100%',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Deposit 0.001 BTC to Account {index + 1}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Withdrawal Debug */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Confirm Pending Withdrawals:
              </div>
              {pendingWithdrawals.filter(w => w.status === 'pending').length > 0 ? (
                pendingWithdrawals
                  .filter(w => w.status === 'pending')
                  .map(withdrawal => (
                    <button
                      key={withdrawal.id}
                      onClick={() => confirmWithdrawal(withdrawal.id)}
                      style={{
                        width: '100%',
                        backgroundColor: '#f97316',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        marginBottom: '0.25rem'
                      }}
                    >
                      Confirm {withdrawal.amount} BTC Withdrawal
                    </button>
                  ))
              ) : (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  fontStyle: 'italic'
                }}>
                  No pending withdrawals
                </div>
              )}
            </div>
            
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              * Deposits: 6-confirmation process (2s each)<br/>
              * Withdrawals: Click to confirm pending requests
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
