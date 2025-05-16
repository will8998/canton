'use client';

import { useState } from 'react';
import StepIndicator from './StepIndicator';

interface KYCVerificationProps {
  selectedVault: string;
  onBack: () => void;
  onContinue: () => void;
  onComplete: () => void;
  kycCompleted: boolean;
  walletAddress: string;
}

export default function KYCVerification({
  selectedVault,
  onBack,
  onContinue,
  onComplete,
  kycCompleted,
  walletAddress
}: KYCVerificationProps) {
  const [nonUSConfirmed, setNonUSConfirmed] = useState(false);
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNonUSConfirmed(e.target.checked);
  };
  
  const handleCompleteKYC = () => {
    if (nonUSConfirmed) {
      // In a real app, this would verify the KYC process is complete
      onComplete();
    }
  };
  
  const getVaultName = () => {
    switch(selectedVault) {
      case 'iyield-a':
        return 'iYield-A';
      case 'iyield-x1':
        return 'iYield-X1';
      case 'iyield-x2':
        return 'iYield-X2';
      case 'iyield-f':
        return 'iYield-F';
      default:
        return selectedVault;
    }
  };
  
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      textAlign: 'center' as 'center'
    },
    stepContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem'
    },
    contentContainer: {
      width: '100%',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '2rem',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      textAlign: 'center' as 'center'
    },
    description: {
      textAlign: 'center' as 'center',
      marginBottom: '2rem',
      maxWidth: '600px',
      margin: '0 auto 2rem'
    },
    kycProviderContainer: {
      border: '2px dashed #d1d5db',
      borderRadius: '0.5rem',
      padding: '2rem',
      marginBottom: '1.5rem',
      textAlign: 'center' as 'center',
      minHeight: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    kycProviderText: {
      fontSize: '1.25rem',
      color: '#6b7280'
    },
    checkboxContainer: {
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '1rem'
    },
    statusContainer: {
      width: '100%',
      textAlign: 'center' as 'center',
      color: '#6b7280',
      marginBottom: '1.5rem'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '2rem'
    },
    backButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    continueButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: kycCompleted ? '#111827' : '#e5e7eb',
      color: kycCompleted ? 'white' : '#9ca3af',
      border: kycCompleted ? 'none' : '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: kycCompleted ? 'pointer' : 'not-allowed',
      fontSize: '1rem'
    },
    completeButton: {
      display: 'block',
      width: '100%',
      maxWidth: '400px',
      margin: '2rem auto 0',
      padding: '0.75rem 1.5rem',
      backgroundColor: nonUSConfirmed ? '#111827' : '#e5e7eb',
      color: nonUSConfirmed ? 'white' : '#9ca3af',
      border: nonUSConfirmed ? 'none' : '1px solid #d1d5db',
      borderRadius: '0.375rem',
      textAlign: 'center' as 'center',
      fontWeight: 'medium',
      cursor: nonUSConfirmed ? 'pointer' : 'not-allowed',
      fontSize: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Complete KYC for {getVaultName()}</h1>
      
      <div style={styles.stepContainer}>
        <StepIndicator currentStep={2} totalSteps={3} title="Identity Verification" />
      </div>
      
      <div style={styles.contentContainer}>
        <h2 style={styles.sectionTitle}>KYC and Non-US Resident Confirmation</h2>
        <p style={styles.description}>
          Identity verification and non-US resident confirmation are required before depositing.
          Your wallet is connected. Please complete KYC through our provider below.
        </p>
        
        <div style={styles.kycProviderContainer}>
          <span style={styles.kycProviderText}>KYC Provider Module</span>
        </div>
        
        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="non-us-checkbox"
            style={styles.checkbox}
            checked={nonUSConfirmed}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="non-us-checkbox" style={styles.checkboxLabel}>
            I confirm I am not a US resident
          </label>
        </div>
        
        <div style={styles.statusContainer}>
          <p>KYC Status: {kycCompleted ? 'Approved' : 'Pending'}</p>
        </div>
        
        {!kycCompleted && (
          <button 
            style={styles.completeButton}
            onClick={handleCompleteKYC}
            disabled={!nonUSConfirmed}
          >
            Complete KYC Verification
          </button>
        )}
      </div>
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.backButton}
          onClick={onBack}
        >
          Back to Wallet
        </button>
        
        <button 
          style={styles.continueButton}
          onClick={onContinue}
          disabled={!kycCompleted}
        >
          Continue to Deposit
        </button>
      </div>
    </div>
  );
} 