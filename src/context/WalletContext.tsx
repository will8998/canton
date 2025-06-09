'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type KYCStatus = 'pending' | 'in-progress' | 'approved' | 'rejected';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  kycStatus: KYCStatus;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  connecting: boolean;
  error: string | null;
  updateKYCStatus: (status: KYCStatus) => void;
  startKYCProcess: () => void;
}

const defaultState: WalletContextType = {
  isConnected: false,
  walletAddress: '',
  kycStatus: 'pending',
  connect: async () => {},
  disconnect: () => {},
  connecting: false,
  error: null,
  updateKYCStatus: () => {},
  startKYCProcess: () => {}
};

const WalletContext = createContext<WalletContextType>(defaultState);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

// Wallet connection utilities
declare global {
  interface Window {
    ethereum?: any;
    TrezorConnect?: any;
  }
}

// Dynamic imports for hardware wallets
let TransportWebUSB: any = null;
let AppEth: any = null;
let TrezorConnect: any = null;

// Load hardware wallet libraries dynamically
const loadLedgerLibs = async () => {
  try {
    if (!TransportWebUSB || !AppEth) {
      console.log('Loading Ledger modules...');
      const [transportModule, appEthModule] = await Promise.all([
        import('@ledgerhq/hw-transport-webusb'),
        import('@ledgerhq/hw-app-eth')
      ]);
      TransportWebUSB = transportModule.default;
      AppEth = appEthModule.default;
      console.log('Ledger modules loaded');
    }
    return { TransportWebUSB, AppEth };
  } catch (error) {
    console.error('Failed to load Ledger libraries:', error);
    throw new Error('Failed to load Ledger libraries. Please refresh the page and try again.');
  }
};

const loadTrezorLib = async () => {
  try {
    if (!TrezorConnect) {
      console.log('Loading Trezor module...');
      const trezorModule = await import('@trezor/connect-web');
      TrezorConnect = trezorModule.default;
      
      // Initialize Trezor Connect
      await TrezorConnect.init({
        lazyLoad: true,
        manifest: {
          email: 'dev@bitsafe.com',
          appUrl: 'https://app.bitsafe.com',
        },
      });
      console.log('Trezor module loaded and initialized');
    }
    return TrezorConnect;
  } catch (error) {
    console.error('Failed to load Trezor library:', error);
    throw new Error('Failed to load Trezor library. Please refresh the page and try again.');
  }
};

// Utility function to validate Ethereum addresses
const isValidEthereumAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Basic Ethereum address validation: starts with 0x and is 42 characters long
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

// KYT (Know Your Transaction) check with Chainalysis
const performKYTCheck = async (address: string, context: 'wallet_connection' | 'deposit') => {
  try {
    const kytEnabled = process.env.NEXT_PUBLIC_KYT_ENABLED === 'true';
    if (!kytEnabled) {
      console.log('KYT checks disabled');
      return { passed: true, risk: 'low' };
    }

    console.log(`Performing KYT check for ${address} in context: ${context}`);
    
    // In a real implementation, this would call Chainalysis API
    // For now, it's a placeholder that always passes
    const mockKYTResult = {
      passed: true,
      risk: 'low',
      details: 'Address passed KYT screening'
    };

    console.log('KYT check result:', mockKYTResult);
    return mockKYTResult;

    /* Real implementation would look like:
    const response = await fetch('/api/kyt-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, context })
    });
    
    if (!response.ok) {
      throw new Error('KYT check failed');
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('KYT check error:', error);
    // In case of error, decide whether to fail safe or fail secure
    const riskTolerance = process.env.CHAINALYSIS_RISK_TOLERANCE || 'medium';
    return { 
      passed: riskTolerance === 'low' ? false : true, 
      risk: 'unknown',
      error: error instanceof Error ? error.message : 'KYT check failed'
    };
  }
};

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [kycStatus, setKycStatus] = useState<KYCStatus>('pending');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load wallet state from localStorage and validate against current wallet state
    const loadAndValidateWalletState = async () => {
      if (typeof window !== 'undefined') {
        const storedWalletAddress = localStorage.getItem('walletAddress');
        const storedKycStatus = localStorage.getItem('kycStatus') as KYCStatus;
        
        // Validate wallet address format
        if (storedWalletAddress && isValidEthereumAddress(storedWalletAddress)) {
          // If MetaMask is available, verify the stored address matches current account
          if (window.ethereum) {
            try {
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              const currentAccount = accounts[0]?.toLowerCase();
              const storedAccount = storedWalletAddress.toLowerCase();
              
              // If accounts don't match, clear cached data
              if (!currentAccount || currentAccount !== storedAccount) {
                console.log('Wallet account mismatch detected, clearing cache');
                localStorage.removeItem('walletAddress');
                localStorage.removeItem('kycStatus');
                setIsConnected(false);
                setWalletAddress('');
                setKycStatus('pending');
                return;
              }
            } catch (error) {
              console.log('Could not verify wallet state:', error);
              // If we can't verify, clear the cache to be safe
              localStorage.removeItem('walletAddress');
              localStorage.removeItem('kycStatus');
              setIsConnected(false);
              setWalletAddress('');
              setKycStatus('pending');
              return;
            }
          }
          
          // If validation passes, restore the wallet state
          setIsConnected(true);
          setWalletAddress(storedWalletAddress);
          
          // Check if we're in test mode and should auto-approve KYC
          const appMode = process.env.NEXT_PUBLIC_APP_MODE;
          const isTestMode = appMode === 'test';
          
          console.log('Loading stored wallet - App Mode:', appMode, 'Is Test Mode:', isTestMode);
          
          if (isTestMode) {
            console.log('Test mode detected on load: Auto-approving KYC');
            setKycStatus('approved');
            localStorage.setItem('kycStatus', 'approved');
          } else if (storedKycStatus) {
            setKycStatus(storedKycStatus);
          }
        } else {
          // Clear invalid wallet data
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('kycStatus');
          setIsConnected(false);
          setWalletAddress('');
          setKycStatus('pending');
        }
      }
    };

    loadAndValidateWalletState();
  }, []);

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Wallet accounts changed:', accounts);
        
        if (accounts.length === 0) {
          // User disconnected their wallet
          console.log('No accounts found, disconnecting');
          disconnect();
        } else if (isConnected) {
          const newAccount = accounts[0].toLowerCase();
          const currentAccount = walletAddress.toLowerCase();
          
          // If the account changed, disconnect and require reconnection
          if (newAccount !== currentAccount) {
            console.log('Account changed from', currentAccount, 'to', newAccount);
            disconnect();
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId);
        // Optionally handle chain changes - for now just log
      };

      const handleDisconnect = () => {
        console.log('Wallet disconnected');
        disconnect();
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      // Cleanup event listeners
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [isConnected, walletAddress]);

  // Validation effect: automatically disconnect if wallet address becomes invalid
  useEffect(() => {
    if (isConnected && !isValidEthereumAddress(walletAddress)) {
      console.warn('Invalid wallet address detected, disconnecting...', walletAddress);
      disconnect();
    }
  }, [isConnected, walletAddress]);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      return accounts[0];
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      }
      throw new Error(`MetaMask connection failed: ${error.message}`);
    }
  };

  const connectLedger = async () => {
    try {
      console.log('Attempting to load Ledger libraries...');
      const { TransportWebUSB, AppEth } = await loadLedgerLibs();
      console.log('Ledger libraries loaded successfully');
      
      // Check if WebUSB is supported
      if (!navigator.usb) {
        throw new Error('WebUSB is not supported in this browser. Please use Chrome or Edge.');
      }

      console.log('Creating Ledger transport...');
      // Create transport connection
      const transport = await TransportWebUSB.create();
      
      // Create Ethereum app instance
      const eth = new AppEth(transport);
      
      // Get Ethereum address (first account, standard derivation path)
      const path = "44'/60'/0'/0/0";
      console.log('Getting address from Ledger...');
      const result = await eth.getAddress(path, false);
      
      // Close transport
      await transport.close();
      
      return result.address;
    } catch (error: any) {
      console.error('Ledger connection error:', error);
      
      if (error.message && error.message.includes('Cannot resolve module')) {
        throw new Error('Ledger library loading failed. Please refresh the page and try again.');
      } else if (error.message && error.message.includes('No device selected')) {
        throw new Error('No Ledger device selected. Please connect your Ledger and unlock it with the Ethereum app open.');
      } else if (error.message && error.message.includes('0x6985')) {
        throw new Error('Transaction rejected by user on Ledger device.');
      } else if (error.message && error.message.includes('0x6982')) {
        throw new Error('Please unlock your Ledger device and open the Ethereum app.');
      } else if (error.message && error.message.includes('0x6a80')) {
        throw new Error('Please open the Ethereum app on your Ledger device.');
      }
      throw new Error(`Ledger connection failed: ${error.message}`);
    }
  };

  const connectTrezor = async () => {
    try {
      console.log('Attempting to load Trezor library...');
      const TrezorConnect = await loadTrezorLib();
      console.log('Trezor library loaded successfully');
      
      // Get Ethereum address from Trezor
      console.log('Getting address from Trezor...');
      const result = await TrezorConnect.ethereumGetAddress({
        path: "m/44'/60'/0'/0/0",
        showOnTrezor: true
      });

      if (!result.success) {
        if (result.payload.error === 'Cancelled') {
          throw new Error('Connection cancelled by user.');
        }
        throw new Error(`Trezor error: ${result.payload.error}`);
      }

      return result.payload.address;
    } catch (error: any) {
      console.error('Trezor connection error:', error);
      
      if (error.message && error.message.includes('Cannot resolve module')) {
        throw new Error('Trezor library loading failed. Please refresh the page and try again.');
      } else if (error.message && error.message.includes('Cancelled')) {
        throw new Error('Connection cancelled by user.');
      } else if (error.message && error.message.includes('device not found')) {
        throw new Error('Trezor device not found. Please connect your Trezor device.');
      } else if (error.message && error.message.includes('Firmware')) {
        throw new Error('Please update your Trezor firmware to the latest version.');
      }
      throw new Error(`Trezor connection failed: ${error.message}`);
    }
  };

  const connect = async (walletType: string) => {
    setConnecting(true);
    setError(null);

    try {
      // Clear any existing connection state first
      disconnect();
      
      let address: string;

      switch (walletType) {
        case 'metamask':
          address = await connectMetaMask();
          break;
        case 'ledger':
          address = await connectLedger();
          break;
        case 'trezor':
          address = await connectTrezor();
          break;
        default:
          throw new Error('Unsupported wallet type');
      }

      // Validate the address before saving
      if (!isValidEthereumAddress(address)) {
        throw new Error('Invalid wallet address received. Please try connecting again.');
      }

      setIsConnected(true);
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
      
      // Check if we're in test mode for automatic KYC approval
      const appMode = process.env.NEXT_PUBLIC_APP_MODE;
      const isTestMode = appMode === 'test';
      
      console.log('App Mode:', appMode, 'Is Test Mode:', isTestMode);
      
      if (isTestMode) {
        // Automatically approve KYC in test mode
        console.log('Test mode detected: Auto-approving KYC');
        setKycStatus('approved');
        localStorage.setItem('kycStatus', 'approved');
      } else {
        // Reset KYC status to pending when connecting a new wallet in production
        console.log('Production mode: Setting KYC to pending');
        setKycStatus('pending');
        localStorage.setItem('kycStatus', 'pending');
      }
      
      // Perform KYT check if enabled
      if (process.env.NEXT_PUBLIC_KYT_CHECK_ON_CONNECT === 'true' && !isTestMode) {
        await performKYTCheck(address, 'wallet_connection');
      }
      
      console.log('Successfully connected wallet:', address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    console.log('Disconnecting wallet...');
    setIsConnected(false);
    setWalletAddress('');
    setKycStatus('pending');
    setError(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('kycStatus');
    console.log('Wallet disconnected and cache cleared');
  };

  const updateKYCStatus = (status: KYCStatus) => {
    setKycStatus(status);
    localStorage.setItem('kycStatus', status);
  };

  const startKYCProcess = () => {
    setKycStatus('in-progress');
    localStorage.setItem('kycStatus', 'in-progress');
  };

  return (
    <WalletContext.Provider 
      value={{ 
        isConnected, 
        walletAddress, 
        kycStatus,
        connect, 
        disconnect,
        connecting,
        error,
        updateKYCStatus,
        startKYCProcess
      }}
    >
      {children}
    </WalletContext.Provider>
  );
} 