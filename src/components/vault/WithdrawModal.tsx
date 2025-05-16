'use client';

import { useState, useEffect } from 'react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (shares: number) => void;
  vaultId: string;
  vaultName: string;
  currentShares: number;
  estimatedValue: string;
  investedSince: string;
  earlyRedemptionFee: string;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  onWithdraw,
  vaultId,
  vaultName,
  currentShares,
  estimatedValue,
  investedSince,
  earlyRedemptionFee
}: WithdrawModalProps) {
  const [shares, setShares] = useState('');
  const [isEarlyRedemption, setIsEarlyRedemption] = useState(true);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setShares('');
    }
  }, [isOpen]);
  
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) <= currentShares)) {
      setShares(value);
    }
  };
  
  const handleWithdraw = () => {
    if (shares && Number(shares) > 0 && Number(shares) <= currentShares) {
      onWithdraw(Number(shares));
      onClose();
    }
  };
  
  const platformFee = '0.05 BTC';
  const earlyFeeAmount = shares ? (Number(shares) / currentShares * 0.16).toFixed(2) + ' BTC' : '0.00 BTC';
  
  if (!isOpen) return null;
  
  const styles = {
    overlay: {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '2rem'
    },
    header: {
      textAlign: 'center' as 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#4b5563',
      fontWeight: 'normal'
    },
    section: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    summaryItem: {
      marginBottom: '1rem'
    },
    summaryLabel: {
      fontSize: '1rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    summaryValue: {
      fontSize: '1rem'
    },
    inputContainer: {
      display: 'flex',
      marginBottom: '0.5rem'
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      fontSize: '1.25rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem 0 0 0.375rem',
      outline: 'none'
    },
    inputLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0 0.375rem 0.375rem 0',
      border: '1px solid #d1d5db',
      borderLeft: 'none',
      fontSize: '1rem',
      fontWeight: 'medium'
    },
    helperText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '1.5rem'
    },
    feeItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem'
    },
    feeLabel: {
      fontSize: '1rem',
      fontWeight: 'bold'
    },
    feeValue: {
      fontSize: '1rem'
    },
    earlyFeeContainer: {
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeeba',
      borderRadius: '0.375rem',
      padding: '1rem',
      marginBottom: '1.5rem'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '1.5rem'
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      cursor: 'pointer'
    },
    confirmButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: shares && Number(shares) > 0 ? '#111827' : '#e5e7eb',
      color: shares && Number(shares) > 0 ? 'white' : '#9ca3af',
      border: shares && Number(shares) > 0 ? 'none' : '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      cursor: shares && Number(shares) > 0 ? 'pointer' : 'not-allowed'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Withdraw from {vaultId.toUpperCase()}</h2>
          <p style={styles.subtitle}>{vaultName}</p>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Your Investment Summary</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Current Shares:</div>
              <div style={styles.summaryValue}>{currentShares.toFixed(2)}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Estimated Value:</div>
              <div style={styles.summaryValue}>{estimatedValue}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Claimable Shares:</div>
              <div style={styles.summaryValue}>{currentShares.toFixed(2)}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Invested Since:</div>
              <div style={styles.summaryValue}>{investedSince}</div>
            </div>
          </div>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Withdrawal Request</h3>
          <div style={styles.inputContainer}>
            <input
              type="number"
              value={shares}
              onChange={handleSharesChange}
              placeholder="0.0"
              style={styles.input}
              min="0"
              max={currentShares}
              step="0.01"
            />
            <span style={styles.inputLabel}>Shares</span>
          </div>
          <p style={styles.helperText}>Enter number of shares to redeem (Max: {currentShares.toFixed(2)})</p>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Fee Breakdown</h3>
          <div style={styles.feeItem}>
            <div style={styles.feeLabel}>Platform Fee:</div>
            <div style={styles.feeValue}>{platformFee}</div>
          </div>
          
          {isEarlyRedemption && (
            <div style={styles.earlyFeeContainer}>
              <div style={styles.feeItem}>
                <div style={styles.feeLabel}>Early Redemption Fee ({earlyRedemptionFee}):</div>
                <div style={styles.feeValue}>{earlyFeeAmount} (investment &lt; 6 months)</div>
              </div>
            </div>
          )}
        </div>
        
        <div style={styles.buttonContainer}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={styles.confirmButton}
            onClick={handleWithdraw}
            disabled={!shares || Number(shares) <= 0}
          >
            Confirm Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
} 