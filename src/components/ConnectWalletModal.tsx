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
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const { connect } = useWallet();

  if (!isOpen) return null;

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect to your MetaMask Wallet',
      logo: '/metamask.svg'
    },
    {
      id: 'ledger',
      name: 'Ledger',
      description: 'Connect to your Ledger Hardware Wallet',
      logo: '/ledger.svg'
    },
    {
      id: 'trezor',
      name: 'Trezor',
      description: 'Connect to your Trezor Hardware Wallet',
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
    walletOption: (isSelected: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      borderRadius: '1rem',
      border: `1px solid ${isSelected ? '#111827' : '#e5e7eb'}`,
      backgroundColor: isSelected ? '#f8f9fa' : 'white',
      cursor: 'pointer',
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
          <div style={styles.walletList}>
            {wallets.map(wallet => (
              <div
                key={wallet.id}
                style={styles.walletOption(selectedWallet === wallet.id)}
                onClick={() => handleConnect(wallet.id)}
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
                  <div style={styles.walletName}>{wallet.name}</div>
                  <div style={styles.walletDescription}>{wallet.description}</div>
                </div>
              </div>
            ))}
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