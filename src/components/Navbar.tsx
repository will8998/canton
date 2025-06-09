'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import ConnectWalletModal from './ConnectWalletModal';
import KYCStatus from './KYCStatus';
import AnnouncementTicker from './AnnouncementTicker';

export default function Navbar() {
  const { isConnected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

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