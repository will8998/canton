'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data - would be fetched based on vaultId in production
const mockVaultData = {
  name: "Atillan Bitcoin Multi-Strat Fund",
  totalShares: 10.00,
  currentValue: 10.50,
  profitLoss: 0.50,
  profitLossPercentage: 5,
  investedSince: "Feb 15, 2025",
  investmentPeriod: "3m",
  apy: 12.7,
  accruedYield: 0.50,
  btcCorrelation: -0.1,
  maxDrawdown: 1.3,
  totalValueLocked: 325.8,
  participants: 26,
  lastEpochReturn: 1.2,
  lastEpochDate: "April 2025",
  pendingDeposits: "None",
  pendingWithdrawals: "None",
  nextDistribution: "May 31, 2025"
};

export default function VaultPerformancePage() {
  const params = useParams();
  const vaultId = params.vaultId;
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // In production, we would fetch vault data based on vaultId
  const vaultData = mockVaultData;

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
      backgroundColor: '#f8f9fa'
    },
    backLink: {
      color: '#3b82f6',
      marginBottom: '1rem',
      display: 'inline-block',
      textDecoration: 'none'
    },
    backLinkHover: {
      textDecoration: 'underline'
    },
    mainCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '2rem',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    pageTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      textAlign: 'center' as 'center',
      marginBottom: '0.5rem'
    },
    pageSubtitle: {
      fontSize: '1.25rem',
      textAlign: 'center' as 'center',
      marginBottom: '1.5rem',
      color: '#374151'
    },
    statsCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1.5rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem'
    },
    statBox: {
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem'
    },
    statLabel: {
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    positiveValue: {
      color: '#10b981'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    mobileContentGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    sectionCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    metricRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    chartContainer: {
      height: '12rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem'
    },
    legendContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.25rem'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center'
    },
    legendDot: (color: string) => ({
      width: '0.75rem',
      height: '0.75rem',
      borderRadius: '50%',
      backgroundColor: color,
      display: 'inline-block',
      marginRight: '0.25rem'
    }),
    legendText: {
      fontSize: '0.875rem'
    },
    chartPlaceholder: {
      height: '8rem',
      width: '100%',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    placeholderText: {
      color: '#9ca3af'
    },
    timelineContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '0.5rem'
    },
    timelineText: {
      fontSize: '0.75rem'
    },
    buttonsContainer: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem'
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1rem'
    },
    actionButton: {
      padding: '0.75rem 1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontWeight: 'medium',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.95rem'
    },
    buttonHover: {
      backgroundColor: '#f9fafb',
      transform: 'translateY(-1px)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/dashboard" 
          style={styles.backLink}
          onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div style={styles.mainCard}>
        <h1 style={styles.pageTitle}>Your iYield-A Dashboard</h1>
        <h2 style={styles.pageSubtitle}>{vaultData.name}</h2>
        
        {/* Top stats */}
        <div style={styles.statsCard}>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <p style={styles.statLabel}>Total Shares</p>
              <p style={styles.statValue}>{vaultData.totalShares.toFixed(2)}</p>
            </div>
            
            <div style={styles.statBox}>
              <p style={styles.statLabel}>Current Value</p>
              <p style={styles.statValue}>{vaultData.currentValue.toFixed(2)} BTC</p>
            </div>
            
            <div style={styles.statBox}>
              <p style={{ ...styles.statLabel }}>Profit/Loss</p>
              <p style={{ ...styles.statValue, ...styles.positiveValue }}>
                +{vaultData.profitLoss.toFixed(2)} BTC (+{vaultData.profitLossPercentage}%)
              </p>
            </div>
            
            <div style={styles.statBox}>
              <p style={styles.statLabel}>Invested Since</p>
              <p style={styles.statValue}>{vaultData.investedSince} ({vaultData.investmentPeriod})</p>
            </div>
          </div>
        </div>
        
        {/* Middle Section */}
        <div style={isMobile ? styles.mobileContentGrid : styles.contentGrid}>
          {/* Performance Metrics */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Performance Metrics</h3>
            <div>
              <div style={styles.metricRow}>
                <span>Current APY:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.apy}%</span>
              </div>
              <div style={styles.metricRow}>
                <span>Accrued Yield:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.accruedYield} BTC</span>
              </div>
              <div style={styles.metricRow}>
                <span>BTC Correlation:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.btcCorrelation}</span>
              </div>
              <div style={styles.metricRow}>
                <span>Max Drawdown:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.maxDrawdown}%</span>
              </div>
            </div>
          </div>
          
          {/* Performance Chart */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Performance Chart</h3>
            <div style={styles.chartContainer}>
              <div style={styles.legendContainer}>
                <div style={styles.legendItem}>
                  <span style={styles.legendDot('#4CAF50')}></span>
                  <span style={styles.legendText}>iYield-A Value</span>
                </div>
                <div style={styles.legendItem}>
                  <span style={styles.legendDot('#FF9800')}></span>
                  <span style={styles.legendText}>BTC Price</span>
                </div>
              </div>
              
              {/* Placeholder for chart */}
              <div style={styles.chartPlaceholder}>
                <p style={styles.placeholderText}>Chart visualization would go here</p>
              </div>
              
              <div style={styles.timelineContainer}>
                <span style={styles.timelineText}>Feb</span>
                <span style={styles.timelineText}>Mar</span>
                <span style={styles.timelineText}>Apr</span>
                <span style={styles.timelineText}>May</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div style={isMobile ? styles.mobileContentGrid : styles.contentGrid}>
          {/* Vault Statistics */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Vault Statistics</h3>
            <div>
              <div style={styles.metricRow}>
                <span>Total Value Locked:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.totalValueLocked} BTC</span>
              </div>
              <div style={styles.metricRow}>
                <span>Participants:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.participants}</span>
              </div>
              <div style={styles.metricRow}>
                <span>Last Epoch Return:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.lastEpochReturn}% ({vaultData.lastEpochDate})</span>
              </div>
            </div>
          </div>
          
          {/* Pending Transactions */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Pending Transactions</h3>
            <div>
              <div style={styles.metricRow}>
                <span>Pending Deposits:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.pendingDeposits}</span>
              </div>
              <div style={styles.metricRow}>
                <span>Pending Withdrawals:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.pendingWithdrawals}</span>
              </div>
              <div style={styles.metricRow}>
                <span>Next Distribution:</span>
                <span style={{ fontWeight: 'medium' }}>{vaultData.nextDistribution}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={styles.buttonsContainer}>
          <div style={styles.buttonGrid}>
            <button 
              style={styles.actionButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
                e.currentTarget.style.transform = styles.buttonHover.transform;
                e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Deposit More
            </button>
            <button 
              style={styles.actionButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
                e.currentTarget.style.transform = styles.buttonHover.transform;
                e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Withdraw
            </button>
            <button 
              style={styles.actionButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
                e.currentTarget.style.transform = styles.buttonHover.transform;
                e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 