import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';

export default function WalletDropdown() {
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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn border-success bg-success bg-opacity-10 flex items-center gap-sm"
      >
        <div className="w-2 h-2 rounded-full bg-success"></div>
        <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
        <svg 
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-border z-50">
          {/* Wallet Info Section */}
          <div className="p-md border-b border-border">
            <div className="text-sm text-text-light mb-sm">Connected Wallet</div>
            <div className="font-medium break-all">{walletAddress}</div>
          </div>

          {/* Balance Section */}
          <div className="p-md border-b border-border">
            <div className="text-sm text-text-light mb-sm">Balance</div>
            <div className="font-medium">2.5 BTC</div>
          </div>

          {/* Actions */}
          <div className="p-sm">
            <button 
              onClick={handleProfileClick}
              className="w-full text-left p-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Settings
            </button>
            
            <button 
              onClick={handleDisconnect}
              className="w-full text-left p-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-sm text-error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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