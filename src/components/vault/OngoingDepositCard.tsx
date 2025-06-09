'use client';

import { useState } from 'react';
import { OngoingDeposit, DepositStatus } from '@/context/DepositContext';

interface OngoingDepositCardProps {
  deposit: OngoingDeposit;
  onRemove?: (depositId: string) => void;
}

export default function OngoingDepositCard({ deposit, onRemove }: OngoingDepositCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: DepositStatus) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // amber
      case 'processing':
        return '#3b82f6'; // blue
      case 'approved':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: DepositStatus) => {
    switch (status) {
      case 'pending':
        return 'Awaiting Fund Manager Approval';
      case 'processing':
        return 'Processing by Fund Manager';
      case 'approved':
        return 'Approved & Added to Position';
      case 'rejected':
        return 'Rejected by Fund Manager';
      default:
        return 'Unknown Status';
    }
  };

  const getTimeRemaining = () => {
    if (!deposit.estimatedApprovalTime) return null;
    
    const now = Date.now();
    const timeLeft = deposit.estimatedApprovalTime - now;
    
    if (timeLeft <= 0) return 'Approval overdue';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `~${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `~${hours}h ${minutes}m remaining`;
    } else {
      return `~${minutes}m remaining`;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canRemove = deposit.status === 'approved' || deposit.status === 'rejected';

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827'
            }}>
              <img 
                src="https://app.lagoon.finance/logo_cbBTC.png" 
                alt="cbBTC" 
                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
              />
              {deposit.amount} cbBTC
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.75rem',
              backgroundColor: getStatusColor(deposit.status),
              color: 'white',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'currentColor',
                animation: deposit.status === 'processing' ? 'pulse 2s infinite' : 'none'
              }} />
              {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
            </div>
          </div>
          
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            {getStatusText(deposit.status)}
          </div>

          {deposit.status === 'pending' && getTimeRemaining() && (
            <div style={{
              fontSize: '0.75rem',
              color: '#f59e0b',
              fontWeight: '500'
            }}>
              {getTimeRemaining()}
            </div>
          )}

          {deposit.status === 'approved' && (
            <div style={{
              fontSize: '0.75rem',
              color: '#10b981',
              fontWeight: '500'
            }}>
              ✓ Deposit has been added to your position
            </div>
          )}

          {deposit.status === 'rejected' && (
            <div style={{
              fontSize: '0.75rem',
              color: '#ef4444',
              fontWeight: '500'
            }}>
              ✗ Contact support if you believe this is an error
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '0.5rem',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}
            title="Toggle details"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          
          {canRemove && onRemove && (
            <button
              onClick={() => onRemove(deposit.id)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#dc2626'
              }}
              title="Remove deposit"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {deposit.status === 'pending' || deposit.status === 'processing' ? (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            <span>Submitted</span>
            <span>Under Review</span>
            <span>Approved</span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: deposit.status === 'pending' ? '33%' : '66%',
              height: '100%',
              backgroundColor: getStatusColor(deposit.status),
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      ) : null}

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Deposit ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {deposit.id.split('_').pop()?.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Submitted:</span>
              <span>{formatTimestamp(deposit.timestamp)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Wallet:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {deposit.walletAddress.slice(0, 6)}...{deposit.walletAddress.slice(-4)}
              </span>
            </div>
            {deposit.estimatedApprovalTime && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Est. Approval:</span>
                <span>{formatTimestamp(deposit.estimatedApprovalTime)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
} 