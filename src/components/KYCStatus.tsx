'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';

export default function KYCStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const { walletAddress, kycStatus, disconnect, startKYCProcess, isConnected } = useWallet();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safeguard: if wallet address is invalid, auto-disconnect
  useEffect(() => {
    if (isConnected && (!walletAddress || walletAddress === 'undefined' || walletAddress.length < 10)) {
      console.warn('Invalid wallet address in KYCStatus, disconnecting...', walletAddress);
      disconnect();
    }
  }, [isConnected, walletAddress, disconnect]);

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



  const handleKYCClick = () => {
    if (kycStatus === 'pending') {
      startKYCProcess();
      router.push('/kyc');
      setIsOpen(false);
    } else if (kycStatus === 'in-progress') {
      router.push('/kyc');
      setIsOpen(false);
    } else if (kycStatus === 'approved') {
      // Allow viewing KYC details even when approved
      router.push('/kyc');
      setIsOpen(false);
    } else if (kycStatus === 'rejected') {
      // Navigate to KYC page to show rejection details and retry option
      router.push('/kyc');
      setIsOpen(false);
    }
  };

  const getKYCStatusDisplay = () => {
    switch (kycStatus) {
      case 'pending':
        return { text: 'Pending', color: '#f59e0b', icon: '⏳' };
      case 'in-progress':
        return { text: 'In Progress', color: '#3b82f6', icon: '🔄' };
      case 'approved':
        return { text: 'Approved', color: '#10b981', icon: '✓' };
      case 'rejected':
        return { text: 'Rejected', color: '#ef4444', icon: '✗' };
      default:
        return { text: 'Pending', color: '#f59e0b', icon: '⏳' };
    }
  };

  const kycDisplay = getKYCStatusDisplay();

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
            <div 
              className="dropdown-value" 
              style={{ 
                color: kycDisplay.color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onClick={handleKYCClick}
            >
              <span>{kycDisplay.icon}</span>
              {kycDisplay.text}
              {kycStatus === 'pending' && (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  (Click to start)
                </span>
              )}
              {kycStatus === 'in-progress' && (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  (Click to check status)
                </span>
              )}
              {kycStatus === 'approved' && (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  (Click to view details)
                </span>
              )}
              {kycStatus === 'rejected' && (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  (Click to retry)
                </span>
              )}
            </div>
          </div>



          <div className="wallet-dropdown-actions">
            <button onClick={handleDisconnect} className="dropdown-button text-error">
              <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 