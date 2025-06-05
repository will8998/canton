'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('vaults');
  const { isConnected, walletAddress, disconnect } = useWallet();

  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('vaults');
    } else if (pathname.includes('/settings')) {
      setActiveTab('settings');
    }
  }, [pathname]);

  const handleConnectWallet = () => {
    if (isConnected) {
      // If already connected, show profile/disconnect options
      router.push('/settings');
    } else {
      // If not connected, navigate to connect page
      router.push('/connect');
    }
  };

  const navStyles = {
    nav: {
      width: '100%',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white'
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem'
    },
    linkContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem'
    },
    activeLink: {
      fontWeight: 'bold',
      fontSize: '1.125rem',
      color: 'black'
    },
    inactiveLink: {
      fontWeight: 'medium',
      color: '#6b7280'
    },
    connectButton: {
      border: isConnected ? '1px solid #10b981' : '1px dashed #1f2937',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'white',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    walletStatusDot: {
      width: '0.5rem',
      height: '0.5rem',
      borderRadius: '50%',
      backgroundColor: '#10b981'
    }
  };

  return (
    <nav style={navStyles.nav}>
      <div style={navStyles.container}>
        <div style={navStyles.linkContainer}>
          <Link 
            href="/" 
            style={activeTab === 'vaults' ? navStyles.activeLink : navStyles.inactiveLink}
            onClick={() => setActiveTab('vaults')}
          >
            Vault Catalog
          </Link>
          <Link 
            href="/settings" 
            style={activeTab === 'settings' ? navStyles.activeLink : navStyles.inactiveLink}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Link>
        </div>
        <div>
          <button 
            style={navStyles.connectButton}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = isConnected ? 'rgba(16, 185, 129, 0.15)' : '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = isConnected ? 'rgba(16, 185, 129, 0.1)' : 'white'}
            onClick={handleConnectWallet}
          >
            {isConnected ? (
              <>
                <div style={navStyles.walletStatusDot}></div>
                <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      </div>
    </nav>
  );
} 