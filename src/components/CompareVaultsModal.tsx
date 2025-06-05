'use client';

import { useState } from 'react';
import { VaultDetail } from '@/data/vaultDetails';

interface CompareVaultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVault: VaultDetail;
}

export default function CompareVaultsModal({ isOpen, onClose, currentVault }: CompareVaultsModalProps) {
  const [selectedVaults, setSelectedVaults] = useState<string[]>([]);

  if (!isOpen) return null;

  const styles = {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      width: '90%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative' as const
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem'
    },
    compareTable: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    tableHeader: {
      padding: '1rem',
      textAlign: 'left' as const,
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb'
    },
    metric: {
      color: '#6b7280',
      fontSize: '0.875rem'
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Compare Vaults</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <table style={styles.compareTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Metrics</th>
              <th style={styles.tableHeader}>{currentVault.name}</th>
              <th style={styles.tableHeader}>iYield-A</th>
              <th style={styles.tableHeader}>iYield-F</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.tableCell, ...styles.metric}}>Target APY</td>
              <td style={styles.tableCell}>{currentVault.targetAPY}</td>
              <td style={styles.tableCell}>14.2%</td>
              <td style={styles.tableCell}>12.8%</td>
            </tr>
            <tr>
              <td style={{...styles.tableCell, ...styles.metric}}>Minimum Investment</td>
              <td style={styles.tableCell}>20 BTC</td>
              <td style={styles.tableCell}>10 BTC</td>
              <td style={styles.tableCell}>15 BTC</td>
            </tr>
            <tr>
              <td style={{...styles.tableCell, ...styles.metric}}>Total Value Locked</td>
              <td style={styles.tableCell}>486 BTC</td>
              <td style={styles.tableCell}>892 BTC</td>
              <td style={styles.tableCell}>345 BTC</td>
            </tr>
            <tr>
              <td style={{...styles.tableCell, ...styles.metric}}>Management Fee</td>
              <td style={styles.tableCell}>2%</td>
              <td style={styles.tableCell}>1.5%</td>
              <td style={styles.tableCell}>2%</td>
            </tr>
            <tr>
              <td style={{...styles.tableCell, ...styles.metric}}>Performance Fee</td>
              <td style={styles.tableCell}>25%</td>
              <td style={styles.tableCell}>20%</td>
              <td style={styles.tableCell}>25%</td>
            </tr>
            <tr>
              <td style={{...styles.tableCell, ...styles.metric}}>Lock-up Period</td>
              <td style={styles.tableCell}>12 months</td>
              <td style={styles.tableCell}>6 months</td>
              <td style={styles.tableCell}>9 months</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 