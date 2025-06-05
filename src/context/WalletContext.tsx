'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  connecting: boolean;
  error: string | null;
}

const defaultState: WalletContextType = {
  isConnected: false,
  walletAddress: '',
  connect: async () => {},
  disconnect: () => {},
  connecting: false,
  error: null
};

const WalletContext = createContext<WalletContextType>(defaultState);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

// Mock wallet addresses for demo
const MOCK_ADDRESSES = {
  metamask: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  ledger: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  trezor: '0x742d35Cc6634C0532925a3b844Bc454e4438f52A'
};

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load wallet state from localStorage on initial render
    if (typeof window !== 'undefined') {
      const storedWalletAddress = localStorage.getItem('walletAddress');
      if (storedWalletAddress) {
        setIsConnected(true);
        setWalletAddress(storedWalletAddress);
      }
    }
  }, []);

  const connect = async (walletType: string) => {
    setConnecting(true);
    setError(null);

    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock different wallet connections
      const address = MOCK_ADDRESSES[walletType as keyof typeof MOCK_ADDRESSES];
      if (!address) {
        throw new Error('Unsupported wallet type');
      }

      setIsConnected(true);
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    setError(null);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider 
      value={{ 
        isConnected, 
        walletAddress, 
        connect, 
        disconnect,
        connecting,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
} 