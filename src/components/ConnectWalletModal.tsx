'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@/context/WalletContext';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { connect, connecting, error } = useWallet();

  if (!isOpen) return null;

  const handleConnect = async (walletId: string) => {
    setConnectingWallet(walletId);
    setErrorMessage(null);
    
    try {
      await connect(walletId);
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to connect wallet');
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const getWalletStatus = (walletId: string) => {
    if (connectingWallet === walletId) {
      return 'Connecting...';
    }
    return null;
  };

  const isWalletDisabled = (walletId: string) => {
    return connectingWallet !== null;
  };

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect to your MetaMask browser extension',
      logo: '/metamask.svg'
    },
    {
      id: 'ledger',
      name: 'Ledger',
      description: 'Connect your Ledger device via USB (Chrome/Edge required)',
      logo: '/ledger.svg'
    },
    {
      id: 'trezor',
      name: 'Trezor',
      description: 'Connect your Trezor device (requires device confirmation)',
      logo: '/trezor.svg'
    }
  ];

  const styles = {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      width: '100%',
      maxWidth: '480px',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    header: {
      padding: '1.5rem',
      borderBottom: '1px solid #f3f4f6'
    },
    closeButton: {
      position: 'absolute' as const,
      right: '1.5rem',
      top: '1.5rem',
      background: '#f3f4f6',
      border: 'none',
      borderRadius: '0.75rem',
      padding: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    subtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    },
    content: {
      padding: '1.5rem'
    },
    walletList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    walletOption: (isConnecting: boolean, isDisabled: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      borderRadius: '1rem',
      border: `1px solid ${isConnecting ? '#111827' : '#e5e7eb'}`,
      backgroundColor: isConnecting ? '#f8f9fa' : 'white',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.6 : 1,
      transition: 'all 0.2s ease'
    }),
    walletLogo: {
      width: '40px',
      height: '40px',
      borderRadius: '0.75rem',
      backgroundColor: '#f3f4f6',
      padding: '0.5rem'
    },
    walletInfo: {
      flex: 1
    },
    walletName: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#111827'
    },
    walletDescription: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    footer: {
      padding: '1.5rem',
      borderTop: '1px solid #f3f4f6',
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    footerLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 style={styles.title}>Connect Wallet</h2>
          <p style={styles.subtitle}>Choose your preferred wallet to connect</p>
        </div>

        <div style={styles.content}>
          {errorMessage && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {errorMessage}
            </div>
          )}
          
          <div style={styles.walletList}>
            {wallets.map(wallet => {
              const isConnecting = connectingWallet === wallet.id;
              const isDisabled = isWalletDisabled(wallet.id);
              const status = getWalletStatus(wallet.id);
              
              return (
                <div
                  key={wallet.id}
                  style={styles.walletOption(isConnecting, isDisabled)}
                  onClick={() => !isDisabled && handleConnect(wallet.id)}
                >
                  <div style={styles.walletLogo}>
                    <Image
                      src={wallet.logo}
                      alt={`${wallet.name} logo`}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div style={styles.walletInfo}>
                    <div style={styles.walletName}>
                      {wallet.name}
                      {status && (
                        <span style={{ 
                          marginLeft: '0.5rem', 
                          fontSize: '0.75rem',
                          color: isConnecting ? '#3b82f6' : '#6b7280',
                          fontWeight: 'normal'
                        }}>
                          {status}
                        </span>
                      )}
                    </div>
                    <div style={styles.walletDescription}>{wallet.description}</div>
                  </div>
                  {isConnecting && (
                    <div style={{ 
                      width: '20px', 
                      height: '20px',
                      border: '2px solid #e5e7eb',
                      borderTop: '2px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Hardware Wallet Requirements:</strong>
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            • <strong>Ledger:</strong> Device connected via USB, Ethereum app open & unlocked
          </div>
          <div>
            • <strong>Trezor:</strong> Device connected, confirm address on device screen
          </div>
        </div>

        <div style={styles.footer}>
          <p>By connecting a wallet, you agree to BitSafe's</p>
          <div style={styles.footerLinks}>
            <Link href="/terms" style={styles.link}>Terms of Service</Link>
            <span>and</span>
            <Link href="/privacy" style={styles.link}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 