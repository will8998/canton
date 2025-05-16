'use client';

import { useState } from 'react';
import StepIndicator from './StepIndicator';

interface DepositStepProps {
  selectedVault: string;
  onDeposit: () => void;
  onBack: () => void;
}

export default function DepositStep({
  selectedVault,
  onDeposit,
  onBack
}: DepositStepProps) {
  const [amount, setAmount] = useState('');
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };
  
  const handleDeposit = () => {
    if (amount && parseFloat(amount) > 0) {
      onDeposit();
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
  
  const getMinimumAmount = () => {
    switch(selectedVault) {
      case 'iyield-a':
        return '10 BTC';
      case 'iyield-x1':
        return '15 BTC';
      case 'iyield-x2':
        return '20 BTC';
      case 'iyield-f':
        return '5 BTC';
      default:
        return '10 BTC';
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
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '1rem',
      fontWeight: 'medium',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem'
    },
    infoText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    },
    depositButton: {
      display: 'block',
      width: '100%',
      maxWidth: '400px',
      margin: '2rem auto 0',
      padding: '0.75rem 1.5rem',
      backgroundColor: amount && parseFloat(amount) > 0 ? '#111827' : '#e5e7eb',
      color: amount && parseFloat(amount) > 0 ? 'white' : '#9ca3af',
      border: amount && parseFloat(amount) > 0 ? 'none' : '1px solid #d1d5db',
      borderRadius: '0.375rem',
      textAlign: 'center' as 'center',
      fontWeight: 'medium',
      cursor: amount && parseFloat(amount) > 0 ? 'pointer' : 'not-allowed',
      fontSize: '1rem'
    },
    backButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '1rem',
      marginTop: '2rem'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Deposit to {getVaultName()}</h1>
      
      <div style={styles.stepContainer}>
        <StepIndicator currentStep={3} totalSteps={3} title="Make Deposit" />
      </div>
      
      <div style={styles.contentContainer}>
        <h2 style={styles.sectionTitle}>Complete Your Deposit</h2>
        <p style={styles.description}>
          Your wallet is connected and KYC is approved. You can now make a deposit to the {getVaultName()} vault.
        </p>
        
        <div style={styles.formGroup}>
          <label htmlFor="deposit-amount" style={styles.label}>
            Deposit Amount (BTC)
          </label>
          <input
            type="number"
            id="deposit-amount"
            style={styles.input}
            value={amount}
            onChange={handleAmountChange}
            placeholder={`Minimum ${getMinimumAmount()}`}
            min="0"
            step="0.01"
          />
          <p style={styles.infoText}>
            Minimum deposit: {getMinimumAmount()}
          </p>
        </div>
        
        <button 
          style={styles.depositButton}
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Complete Deposit
        </button>
      </div>
      
      <button 
        style={styles.backButton}
        onClick={onBack}
      >
        Back to Previous Step
      </button>
    </div>
  );
} 