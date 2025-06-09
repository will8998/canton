'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useTransaction } from '@/context/DepositContext';

export default function DebugPanel() {
  const { isConnected, walletAddress, kycStatus, updateKYCStatus } = useWallet();
  const { ongoingTransactions, updateTransactionStatus } = useTransaction();
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentAppMode, setCurrentAppMode] = useState('test');
  const panelRef = useRef<HTMLDivElement>(null);
  
  const appMode = process.env.NEXT_PUBLIC_APP_MODE;
  const isTestMode = currentAppMode === 'test';

  // Initialize app mode from environment
  useEffect(() => {
    setCurrentAppMode(appMode || 'test');
  }, [appMode]);

  // Only show when environment is set to test
  if (appMode !== 'test') {
    return null;
  }

  const toggleAppMode = () => {
    const newMode = currentAppMode === 'test' ? 'production' : 'test';
    setCurrentAppMode(newMode);
    
    // Store in localStorage for persistence
    localStorage.setItem('debugAppMode', newMode);
    
    // Dispatch custom event to sync across components in same tab
    window.dispatchEvent(new CustomEvent('debugAppModeChange', { detail: newMode }));
    
    // Show notification
    console.log(`App mode switched to: ${newMode}`);
    
    // If switching to production mode and KYC is approved, reset to pending
    if (newMode === 'production' && kycStatus === 'approved') {
      updateKYCStatus('pending');
    }
    
    // If switching to test mode and connected, auto-approve KYC
    if (newMode === 'test' && isConnected) {
      updateKYCStatus('approved');
    }
  };

  // Load saved app mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('debugAppMode');
    if (savedMode) {
      setCurrentAppMode(savedMode);
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === panelRef.current || (e.target as Element).closest('.debug-panel-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Keep panel within screen boundaries
    const maxX = window.innerWidth - 220; // panel width + some margin
    const maxY = window.innerHeight - 200; // panel height + some margin

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={panelRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '200px',
        border: '1px solid #374151',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'
      }}>
      <div 
        className="debug-panel-header"
        style={{ 
          fontWeight: 'bold', 
          marginBottom: '0.5rem', 
          color: '#10b981',
          cursor: 'grab',
          padding: '0.25rem',
          margin: '-0.25rem',
          borderRadius: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>🔧 Debug Panel</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>⋮⋮</span>
      </div>
      
      <div style={{ marginBottom: '0.25rem' }}>
        <strong>App Mode:</strong> {currentAppMode}
      </div>
      
      <div style={{ marginBottom: '0.25rem' }}>
        <strong>Test Mode:</strong> {isTestMode ? '✅ Enabled' : '❌ Disabled'}
      </div>

      {/* App Mode Toggle */}
      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: 'bold', 
          marginBottom: '0.25rem',
          color: '#e5e7eb' 
        }}>
          Mode Control:
        </div>
        <button
          onClick={toggleAppMode}
          style={{
            fontSize: '0.625rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: isTestMode ? '#10b981' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            fontWeight: '600'
          }}
        >
          Switch to {isTestMode ? 'Production' : 'Test'} Mode
        </button>
      </div>
      
      <div style={{ marginBottom: '0.25rem' }}>
        <strong>Wallet:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      {isConnected && (
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Address:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      )}
      
      <div style={{ marginBottom: '0.25rem' }}>
        <strong>KYC Status:</strong> 
        <span style={{ 
          color: kycStatus === 'approved' ? '#10b981' : 
                kycStatus === 'in-progress' ? '#f59e0b' : 
                kycStatus === 'rejected' ? '#ef4444' : '#6b7280',
          marginLeft: '0.25rem'
        }}>
          {kycStatus}
        </span>
      </div>

      {/* KYC Controls - Only enabled in test mode */}
      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: 'bold', 
          marginBottom: '0.25rem',
          color: isTestMode ? '#e5e7eb' : '#6b7280'
        }}>
          KYC Controls:
          {!isTestMode && (
            <span style={{ fontWeight: 'normal', fontSize: '0.625rem', marginLeft: '0.5rem' }}>
              (Test mode only)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          <button
            onClick={() => isTestMode && updateKYCStatus('pending')}
            disabled={!isTestMode}
            style={{
              fontSize: '0.625rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: kycStatus === 'pending' ? '#6b7280' : 'transparent',
              color: kycStatus === 'pending' ? 'white' : '#6b7280',
              border: '1px solid #6b7280',
              borderRadius: '0.25rem',
              cursor: isTestMode ? 'pointer' : 'not-allowed',
              opacity: isTestMode ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            Pending
          </button>
          <button
            onClick={() => isTestMode && updateKYCStatus('in-progress')}
            disabled={!isTestMode}
            style={{
              fontSize: '0.625rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: kycStatus === 'in-progress' ? '#f59e0b' : 'transparent',
              color: kycStatus === 'in-progress' ? 'white' : '#f59e0b',
              border: '1px solid #f59e0b',
              borderRadius: '0.25rem',
              cursor: isTestMode ? 'pointer' : 'not-allowed',
              opacity: isTestMode ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            In Progress
          </button>
          <button
            onClick={() => isTestMode && updateKYCStatus('approved')}
            disabled={!isTestMode}
            style={{
              fontSize: '0.625rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: kycStatus === 'approved' ? '#10b981' : 'transparent',
              color: kycStatus === 'approved' ? 'white' : '#10b981',
              border: '1px solid #10b981',
              borderRadius: '0.25rem',
              cursor: isTestMode ? 'pointer' : 'not-allowed',
              opacity: isTestMode ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            Approved
          </button>
          <button
            onClick={() => isTestMode && updateKYCStatus('rejected')}
            disabled={!isTestMode}
            style={{
              fontSize: '0.625rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: kycStatus === 'rejected' ? '#ef4444' : 'transparent',
              color: kycStatus === 'rejected' ? 'white' : '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '0.25rem',
              cursor: isTestMode ? 'pointer' : 'not-allowed',
              opacity: isTestMode ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Transaction Controls - Only enabled in test mode */}
      {ongoingTransactions.length > 0 && (
        <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            marginBottom: '0.25rem',
            color: isTestMode ? '#e5e7eb' : '#6b7280'
          }}>
            Transaction Controls:
            {!isTestMode && (
              <span style={{ fontWeight: 'normal', fontSize: '0.625rem', marginLeft: '0.5rem' }}>
                (Test mode only)
              </span>
            )}
          </div>
          <div style={{ 
            maxHeight: '150px', 
            overflowY: 'auto',
            fontSize: '0.625rem',
            border: '1px solid #374151',
            borderRadius: '0.25rem',
            padding: '0.5rem'
          }}>
            {ongoingTransactions
              .filter(transaction => transaction.status === 'pending' || transaction.status === 'processing')
              .map(transaction => (
                <div key={transaction.id} style={{ 
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#374151',
                  borderRadius: '0.25rem'
                }}>
                  <div style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    {transaction.type === 'withdrawal' ? '↗️' : '↘️'} {transaction.amount} cbBTC - {transaction.status}
                  </div>
                  <div style={{ 
                    marginBottom: '0.25rem', 
                    color: '#9ca3af',
                    fontFamily: 'monospace'
                  }}>
                    {transaction.type.toUpperCase()} ID: {transaction.id.split('_').pop()?.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => isTestMode && updateTransactionStatus(transaction.id, 'processing')}
                      disabled={!isTestMode}
                      style={{
                        fontSize: '0.5rem',
                        padding: '0.25rem 0.4rem',
                        backgroundColor: transaction.status === 'processing' ? '#3b82f6' : 'transparent',
                        color: transaction.status === 'processing' ? 'white' : '#3b82f6',
                        border: '1px solid #3b82f6',
                        borderRadius: '0.25rem',
                        cursor: isTestMode ? 'pointer' : 'not-allowed',
                        opacity: isTestMode ? 1 : 0.5,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Process
                    </button>
                    <button
                      onClick={() => isTestMode && updateTransactionStatus(transaction.id, 'approved')}
                      disabled={!isTestMode}
                      style={{
                        fontSize: '0.5rem',
                        padding: '0.25rem 0.4rem',
                        backgroundColor: transaction.status === 'approved' ? '#10b981' : 'transparent',
                        color: transaction.status === 'approved' ? 'white' : '#10b981',
                        border: '1px solid #10b981',
                        borderRadius: '0.25rem',
                        cursor: isTestMode ? 'pointer' : 'not-allowed',
                        opacity: isTestMode ? 1 : 0.5,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => isTestMode && updateTransactionStatus(transaction.id, 'rejected')}
                      disabled={!isTestMode}
                      style={{
                        fontSize: '0.5rem',
                        padding: '0.25rem 0.4rem',
                        backgroundColor: transaction.status === 'rejected' ? '#ef4444' : 'transparent',
                        color: transaction.status === 'rejected' ? 'white' : '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '0.25rem',
                        cursor: isTestMode ? 'pointer' : 'not-allowed',
                        opacity: isTestMode ? 1 : 0.5,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            }
            {ongoingTransactions.filter(transaction => transaction.status === 'pending' || transaction.status === 'processing').length === 0 && (
              <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                No pending transactions
              </div>
            )}
          </div>
        </div>
      )}
      
      {isTestMode && (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.5rem', 
          backgroundColor: '#065f46', 
          borderRadius: '0.25rem',
          fontSize: '0.625rem'
        }}>
          🧪 Test mode active: KYC auto-approved on wallet connection
        </div>
      )}

      {!isTestMode && (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.5rem', 
          backgroundColor: '#92400e', 
          borderRadius: '0.25rem',
          fontSize: '0.625rem'
        }}>
          🏭 Production mode: Normal KYC flow with Persona integration
        </div>
      )}
    </div>
  );
} 