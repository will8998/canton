'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import ContactForm from './ContactForm';
import AnnouncementTicker from './AnnouncementTicker';

interface WalletState {
  isConnected: boolean;
  address: string;
  balance: number;
}

interface NavbarProps {
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
  onAuthenticated?: (isAuth: boolean) => void;
  cbtcBalance?: number;
}

export default function Navbar({ isAuthenticated = false, onAuthRequired, onAuthenticated, cbtcBalance = 0 }: NavbarProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    balance: 0
  });

  const connectWallet = async () => {
    // Simulate wallet connection
    const mockAddress = 'b0b5da7e9f2c8a1d3e4f5g6h7i8j9k0l1m2n3o4ed9';
    setWallet({
      isConnected: true,
      address: mockAddress,
      balance: cbtcBalance
    });
    
    // Connecting wallet also authenticates the user
    onAuthenticated?.(true);
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      balance: 0
    });
    
    // Disconnecting wallet also logs out
    onAuthenticated?.(false);
  };

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Auto-connect wallet when authenticated and update balance
      const mockAddress = 'b0b5da7e9f2c8a1d3e4f5g6h7i8j9k0l1m2n3o4ed9';
      setWallet(prev => ({
        isConnected: true,
        address: prev.address || mockAddress,
        balance: cbtcBalance
      }));
    } else {
      // Auto-disconnect wallet when not authenticated
      setWallet({
        isConnected: false,
        address: '',
        balance: 0
      });
    }
  }, [isAuthenticated, cbtcBalance]);

  return (
    <>
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-left">
            <Link href="/" className="nav-logo">
              <Image
                src="/logo.svg"
                alt="BitSafe Logo"
                width={120}
                height={32}
                priority
              />
            </Link>
          </div>
          
          <div className="nav-right">
            {!wallet.isConnected ? (
              <button 
                className="connect-button"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            ) : (
              <div 
                onClick={disconnectWallet}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Token Icon */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image
                    src="/token.png"
                    alt="Token"
                    width={20}
                    height={20}
                    style={{
                      borderRadius: '50%'
                    }}
                  />
                </div>
                
                {/* Balance */}
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {cbtcBalance.toFixed(8)} CBTC
                </span>
                
                {/* Connection Status */}
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%'
                }} />
                
                {/* Address */}
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontFamily: 'monospace'
                }}>
                  {formatAddress(wallet.address)}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
      <AnnouncementTicker />

      <ContactForm 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}