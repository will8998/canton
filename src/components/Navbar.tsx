'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import ConnectWalletModal from './ConnectWalletModal';
import KYCStatus from './KYCStatus';
import AnnouncementTicker from './AnnouncementTicker';

export default function Navbar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('vaults');
  const { isConnected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('vaults');
    }
  }, [pathname]);

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
            <div className="nav-links">
              <Link 
                href="/" 
                className={`nav-link ${activeTab === 'vaults' ? 'nav-link-active' : ''}`}
                onClick={() => setActiveTab('vaults')}
              >
                Vault Catalog
              </Link>
            </div>
          </div>
          
          <div className="nav-right">
            {isConnected ? (
              <KYCStatus />
            ) : (
              <button 
                className="connect-button"
                onClick={() => setIsModalOpen(true)}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>
      <AnnouncementTicker />

      <ConnectWalletModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}