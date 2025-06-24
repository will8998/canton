'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();

  // Mock data for demonstration
  const mockWalletAddress = "0x1234...5678";
  const mockKycStatus = "verified";

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    main: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    hero: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '3rem 2rem',
      textAlign: 'center' as 'center',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    },
    successIcon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#111827'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#6b7280',
      marginBottom: '2rem',
      maxWidth: '600px',
      margin: '0 auto 2rem'
    },
    statusCard: {
      backgroundColor: '#f3f4f6',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    },
    statusTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#111827'
    },
    statusItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid #e5e7eb'
    },
    statusLabel: {
      color: '#6b7280'
    },
    statusValue: {
      fontWeight: '500',
      color: '#111827'
    },
    approvedStatus: {
      color: '#10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap' as 'wrap'
    },
    primaryButton: {
      padding: '1rem 2rem',
      backgroundColor: '#f97316',
      color: 'white',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer',
      border: 'none'
    },
    secondaryButton: {
      padding: '1rem 2rem',
      backgroundColor: 'white',
      color: '#111827',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <main style={styles.main}>
        <div style={styles.hero}>
          <div style={styles.successIcon}>🎉</div>
          <h1 style={styles.title}>Welcome to BitSafe!</h1>
          <p style={styles.subtitle}>
            Your identity has been verified and you're ready to start earning with our Bitcoin yield vaults.
          </p>
        </div>

        <div style={styles.statusCard}>
          <h2 style={styles.statusTitle}>Account Status</h2>
          
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Wallet Address</span>
            <span style={styles.statusValue}>
              {mockWalletAddress}
            </span>
          </div>
          
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>KYC Status</span>
            <span style={styles.approvedStatus}>
              <span>✓</span>
              Verified
            </span>
          </div>
          
          <div style={{ ...styles.statusItem, borderBottom: 'none' }}>
            <span style={styles.statusLabel}>Available Actions</span>
            <span style={styles.statusValue}>Browse & Contact</span>
          </div>
        </div>

        <div style={styles.actionButtons}>
          <button 
            style={styles.primaryButton}
            onClick={() => router.push('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ea580c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f97316';
            }}
          >
            Browse Vaults
          </button>
          <button 
            style={styles.secondaryButton}
            onClick={() => router.push('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            Contact Us
          </button>
        </div>
      </main>
    </div>
  );
}
