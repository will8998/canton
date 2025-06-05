'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';

export default function KYCStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const { walletAddress, disconnect } = useWallet();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/settings');
    setIsOpen(false);
  };

  return (
    <div className="wallet-status-container" ref={dropdownRef}>
      <div className="wallet-status-outer" onClick={() => setIsOpen(!isOpen)}>
        <div className="wallet-status-content">
          <div className="wallet-status-row">
            <div className="wallet-status-dot"></div>
            <span className="wallet-address">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="wallet-dropdown">
          <div className="wallet-dropdown-section">
            <div className="dropdown-label">Connected Wallet</div>
            <div className="dropdown-value">{walletAddress}</div>
          </div>

          <div className="wallet-dropdown-section">
            <div className="dropdown-label">KYC Status</div>
            <div className="dropdown-value" style={{ color: '#10b981' }}>Approved ✓</div>
          </div>

          <div className="wallet-dropdown-section">
            <div className="dropdown-label">Balance</div>
            <div className="dropdown-value">2.5 BTC</div>
          </div>

          <div className="wallet-dropdown-actions">
            <button onClick={handleProfileClick} className="dropdown-button">
              <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Settings
            </button>
            
            <button onClick={handleDisconnect} className="dropdown-button text-error">
              <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 