'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  connect: (address: string) => void;
  disconnect: () => void;
}

const defaultState: WalletContextType = {
  isConnected: false,
  walletAddress: '',
  connect: () => {},
  disconnect: () => {}
};

const WalletContext = createContext<WalletContextType>(defaultState);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

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

  const connect = (address: string) => {
    setIsConnected(true);
    setWalletAddress(address);
    localStorage.setItem('walletAddress', address);
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
} 