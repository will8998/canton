'use client';

import { useState } from 'react';
import Link from 'next/link';
import StepIndicator from './StepIndicator';
import { useWallet } from '@/context/WalletContext';

interface WalletConnectionProps {
  onConnect: (address: string) => void;
  onBack: () => void;
  onContinue: () => void;
  walletConnected: boolean;
  walletAddress: string;
}

export default function WalletConnection({
  onConnect,
  onBack,
  onContinue,
  walletConnected,
  walletAddress
}: WalletConnectionProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const { connect } = useWallet();
  
  const handleWalletSelect = (wallet: string) => {
    setSelectedWallet(wallet);
  };
  
  const handleConnect = async (walletId: string) => {
    try {
      // Use the context's connect method with the selected wallet type
      await connect(walletId);
      
      // Get the mock address based on wallet type from the context
      const mockAddresses: { [key: string]: string } = {
        metamask: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        ledger: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        trezor: '0x742d35Cc6634C0532925a3b844Bc454e4438f52A',
        walletconnect: '0x742d35Cc6634C0532925a3b844Bc454e4438f44f'
      };
      
      const address = mockAddresses[walletId] || mockAddresses.metamask;
      
      // Call the component's onConnect callback
      onConnect(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };
  
  const wallets = [
    { id: 'metamask', name: 'MetaMask' },
    { id: 'ledger', name: 'Ledger' },
    { id: 'trezor', name: 'Trezor' },
    { id: 'walletconnect', name: 'WalletConnect' }
  ];
  
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
    connectButton: {
      display: 'block',
      width: '100%',
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#111827',
      color: 'white',
      borderRadius: '0.375rem',
      textAlign: 'center' as 'center',
      fontWeight: 'medium',
      cursor: 'pointer',
      border: 'none',
      fontSize: '1rem'
    },
    disabledButton: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
    walletsContainer: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap' as 'wrap',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    walletOption: {
      width: '120px',
      height: '120px',
      border: '1px solid #e5e7eb',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: 'white'
    },
    selectedWallet: {
      borderColor: '#111827',
      boxShadow: '0 0 0 2px #111827'
    },
    walletName: {
      fontSize: '0.875rem',
      fontWeight: 'medium'
    },
    statusContainer: {
      width: '100%',
      textAlign: 'center' as 'center',
      marginTop: '2rem',
      color: '#6b7280'
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
      backgroundColor: walletConnected ? '#111827' : '#e5e7eb',
      color: walletConnected ? 'white' : '#9ca3af',
      border: walletConnected ? 'none' : '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: walletConnected ? 'pointer' : 'not-allowed',
      fontSize: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Connect Wallet</h1>
      
      <div style={styles.stepContainer}>
        <StepIndicator currentStep={1} totalSteps={3} title="Wallet Connection" />
      </div>
      
      <div style={styles.contentContainer}>
        <h2 style={styles.sectionTitle}>Connect your wallet to start earning</h2>
        <p style={styles.description}>
          You'll need to connect your wallet before proceeding with KYC or deposits.
          This enables secure authentication and transaction signing.
        </p>
        
        {!walletConnected ? (
          <>
            <div style={styles.walletsContainer}>
              {wallets.map((wallet) => (
                <div 
                  key={wallet.id}
                  style={{
                    ...styles.walletOption,
                    ...(selectedWallet === wallet.id ? styles.selectedWallet : {})
                  }}
                  onClick={() => handleWalletSelect(wallet.id)}
                >
                  <span style={styles.walletName}>{wallet.name}</span>
                </div>
              ))}
            </div>
            
            <button 
              style={{
                ...styles.connectButton,
                ...(selectedWallet ? {} : styles.disabledButton)
              }}
              onClick={() => selectedWallet && handleConnect(selectedWallet)}
              disabled={!selectedWallet}
            >
              Connect Wallet
            </button>
          </>
        ) : (
          <div style={styles.statusContainer}>
            <p>Wallet Status: Connected</p>
            <p>Address: {walletAddress}</p>
          </div>
        )}
      </div>
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.backButton}
          onClick={onBack}
        >
          Back to Details
        </button>
        
        <button 
          style={styles.continueButton}
          onClick={onContinue}
          disabled={!walletConnected}
        >
          Continue to KYC
        </button>
      </div>
    </div>
  );
} 