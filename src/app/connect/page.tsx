'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import WalletConnection from '@/components/connect/WalletConnection';
import KYCVerification from '@/components/connect/KYCVerification';
import DepositStep from '@/components/connect/DepositStep';

export default function ConnectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVault, setSelectedVault] = useState('iyield-a');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [kycCompleted, setKycCompleted] = useState(false);
  
  const handleWalletConnect = (address: string) => {
    setWalletConnected(true);
    setWalletAddress(address);
    setCurrentStep(2);
  };
  
  const handleKYCComplete = () => {
    setKycCompleted(true);
    setCurrentStep(3);
  };
  
  const handleBackToDetails = () => {
    router.push(`/vault/${selectedVault}`);
  };
  
  const handleContinueToKYC = () => {
    if (walletConnected) {
      setCurrentStep(2);
    }
  };
  
  const handleBackToWallet = () => {
    setCurrentStep(1);
  };
  
  const handleContinueToDeposit = () => {
    if (kycCompleted) {
      setCurrentStep(3);
    }
  };
  
  const handleDeposit = () => {
    // Handle deposit logic
    router.push('/dashboard');
  };
  
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <WalletConnection 
            onConnect={handleWalletConnect}
            onBack={handleBackToDetails}
            onContinue={handleContinueToKYC}
            walletConnected={walletConnected}
            walletAddress={walletAddress}
          />
        );
      case 2:
        return (
          <KYCVerification 
            selectedVault={selectedVault}
            onBack={handleBackToWallet}
            onContinue={handleContinueToDeposit}
            onComplete={handleKYCComplete}
            kycCompleted={kycCompleted}
            walletAddress={walletAddress}
          />
        );
      case 3:
        return (
          <DepositStep 
            selectedVault={selectedVault}
            onDeposit={handleDeposit}
            onBack={handleBackToWallet}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {renderStep()}
      </div>
    </div>
  );
} 