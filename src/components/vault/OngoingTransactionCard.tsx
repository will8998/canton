'use client';

import { useState } from 'react';
import { OngoingTransaction, TransactionStatus } from '@/context/DepositContext';

interface OngoingTransactionCardProps {
  transaction: OngoingTransaction;
  onRemove?: (transactionId: string) => void;
}

export default function OngoingTransactionCard({ transaction, onRemove }: OngoingTransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: TransactionStatus) => {
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

  const getStatusText = (status: TransactionStatus, type: 'deposit' | 'withdrawal') => {
    const action = type === 'deposit' ? 'Deposit' : 'Withdrawal';
    switch (status) {
      case 'pending':
        return `Awaiting Fund Manager Approval for ${action}`;
      case 'processing':
        return `${action} Processing by Fund Manager`;
      case 'approved':
        return type === 'deposit' 
          ? 'Approved & Added to Position' 
          : 'Approved & Removed from Position';
      case 'rejected':
        return `${action} Rejected by Fund Manager`;
      default:
        return 'Unknown Status';
    }
  };

  const getTimeRemaining = () => {
    if (!transaction.estimatedApprovalTime) return null;
    
    const now = Date.now();
    const timeLeft = transaction.estimatedApprovalTime - now;
    
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

  const canRemove = transaction.status === 'approved' || transaction.status === 'rejected';
  const isWithdrawal = transaction.type === 'withdrawal';

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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {isWithdrawal ? '↗️' : '↘️'}
                <img 
                  src="https://app.lagoon.finance/logo_cbBTC.png" 
                  alt="cbBTC" 
                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
                {transaction.amount} cbBTC
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.75rem',
              backgroundColor: getStatusColor(transaction.status),
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
                animation: transaction.status === 'processing' ? 'pulse 2s infinite' : 'none'
              }} />
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </div>
          </div>
          
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            {getStatusText(transaction.status, transaction.type)}
          </div>

          {transaction.status === 'pending' && getTimeRemaining() && (
            <div style={{
              fontSize: '0.75rem',
              color: '#f59e0b',
              fontWeight: '500'
            }}>
              {getTimeRemaining()}
            </div>
          )}

          {transaction.status === 'approved' && (
            <div style={{
              fontSize: '0.75rem',
              color: '#10b981',
              fontWeight: '500'
            }}>
              ✓ {isWithdrawal ? 'Funds have been sent to your wallet' : 'Amount has been added to your position'}
            </div>
          )}

          {transaction.status === 'rejected' && (
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
              onClick={() => onRemove(transaction.id)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#dc2626'
              }}
              title="Remove transaction"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {transaction.status === 'pending' || transaction.status === 'processing' ? (
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
            <span>{isWithdrawal ? 'Processed' : 'Approved'}</span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: transaction.status === 'pending' ? '33%' : '66%',
              height: '100%',
              backgroundColor: getStatusColor(transaction.status),
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
              <span style={{ color: '#6b7280' }}>Transaction ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {transaction.id.split('_').pop()?.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Type:</span>
              <span style={{ 
                textTransform: 'capitalize',
                color: isWithdrawal ? '#ef4444' : '#10b981',
                fontWeight: '500'
              }}>
                {transaction.type}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Submitted:</span>
              <span>{formatTimestamp(transaction.timestamp)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Wallet:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {transaction.walletAddress.slice(0, 6)}...{transaction.walletAddress.slice(-4)}
              </span>
            </div>
            {transaction.estimatedApprovalTime && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Est. Approval:</span>
                <span>{formatTimestamp(transaction.estimatedApprovalTime)}</span>
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