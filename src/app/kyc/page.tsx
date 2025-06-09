'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useWallet } from '@/context/WalletContext';

declare global {
  interface Window {
    PersonaClient?: any;
  }
}

export default function KYCPage() {
  const router = useRouter();
  const { walletAddress, kycStatus, updateKYCStatus, isConnected } = useWallet();
  const [nonUSConfirmed, setNonUSConfirmed] = useState(false);
  const [personaLoaded, setPersonaLoaded] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  // Redirect if wallet not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
  }, [isConnected, router]);

  // Load Persona SDK
  useEffect(() => {
    const loadPersona = () => {
      if (typeof window !== 'undefined' && !window.PersonaClient) {
        const script = document.createElement('script');
        script.src = 'https://cdn.withpersona.com/dist/persona-v4.7.0.js';
        script.async = true;
        script.onload = () => {
          setPersonaLoaded(true);
        };
        document.head.appendChild(script);
      } else if (window.PersonaClient) {
        setPersonaLoaded(true);
      }
    };

    loadPersona();
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNonUSConfirmed(e.target.checked);
  };

  const handleStartKYC = () => {
    if (!personaLoaded || !window.PersonaClient || !nonUSConfirmed) {
      return;
    }

    setIsPersonaOpen(true);

    const client = new window.PersonaClient({
      // Replace with your actual Persona template ID
      templateId: 'tmpl_XXXXXXXXXXXXXXXXXX',
      environmentId: 'env_XXXXXXXXXXXXXXXXXX', // Replace with your environment ID
      referenceId: walletAddress, // Use wallet address as reference
      onReady: () => {
        client.open();
      },
      onComplete: ({ inquiryId, status, fields }: any) => {
        console.log('KYC completed:', { inquiryId, status, fields });
        updateKYCStatus('approved');
        setIsPersonaOpen(false);
        router.push('/dashboard');
      },
      onCancel: ({ inquiryId, sessionToken }: any) => {
        console.log('KYC cancelled:', { inquiryId, sessionToken });
        setIsPersonaOpen(false);
      },
      onError: (error: any) => {
        console.error('KYC error:', error);
        updateKYCStatus('rejected');
        setIsPersonaOpen(false);
      }
    });
  };

  const handleRetryKYC = () => {
    // Reset status to pending and restart the process
    updateKYCStatus('pending');
    setNonUSConfirmed(false); // Reset checkbox to ensure user confirms again
  };

  const getStepIcon = (step: number, current: number) => {
    if (step < current) {
      return '✓';
    } else if (step === current) {
      return step.toString();
    } else {
      return step.toString();
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    main: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      textAlign: 'center' as 'center'
    },
    stepContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem'
    },
    stepIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    step: (active: boolean, completed: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: completed ? '#10b981' : active ? '#3b82f6' : '#e5e7eb',
      color: completed || active ? 'white' : '#6b7280',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    }),
    stepNumber: {
      width: '1.5rem',
      height: '1.5rem',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    },
    contentContainer: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
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
      color: '#6b7280',
      lineHeight: '1.6'
    },
    walletInfo: {
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    },
    walletLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    walletAddress: {
      fontSize: '0.875rem',
      fontFamily: 'monospace',
      wordBreak: 'break-all' as 'break-all'
    },
    personaContainer: {
      border: '2px dashed #d1d5db',
      borderRadius: '0.75rem',
      padding: '3rem 2rem',
      marginBottom: '2rem',
      textAlign: 'center' as 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem'
    },
    personaTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    personaDescription: {
      color: '#6b7280',
      maxWidth: '400px'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: '#fef3c7',
      borderRadius: '0.5rem',
      border: '1px solid #f59e0b'
    },
    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      cursor: 'pointer',
      marginTop: '0.125rem'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      cursor: 'pointer',
      lineHeight: '1.4'
    },
    statusContainer: {
      textAlign: 'center' as 'center',
      color: '#6b7280',
      marginBottom: '2rem'
    },
    startButton: {
      display: 'block',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '1rem 2rem',
      backgroundColor: (personaLoaded && nonUSConfirmed) ? '#111827' : '#e5e7eb',
      color: (personaLoaded && nonUSConfirmed) ? 'white' : '#9ca3af',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: (personaLoaded && nonUSConfirmed) ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s ease'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      textDecoration: 'none',
      color: '#374151',
      marginTop: '2rem'
    }
  };

  if (!isConnected) {
    return null; // Prevent flash before redirect
  }

  return (
    <div style={styles.container}>
      <Navbar />
      
      <main style={styles.main}>
        <h1 style={styles.title}>
          {kycStatus === 'approved' ? 'KYC Verification Details' : 
           kycStatus === 'rejected' ? 'KYC Verification Required' : 
           'Complete KYC Verification'}
        </h1>
        
        <div style={styles.stepContainer}>
          <div style={styles.stepIndicator}>
            <div style={styles.step(false, true)}>
              <div style={styles.stepNumber}>✓</div>
              <span>Wallet Connected</span>
            </div>
            <div style={{
              ...styles.step(kycStatus !== 'approved', kycStatus === 'approved'),
              ...(kycStatus === 'rejected' ? {
                backgroundColor: '#ef4444',
                color: 'white'
              } : {})
            }}>
              <div style={styles.stepNumber}>
                {kycStatus === 'approved' ? '✓' : kycStatus === 'rejected' ? '✗' : '2'}
              </div>
              <span>Identity Verification</span>
            </div>
            <div style={styles.step(false, kycStatus === 'approved')}>
              <div style={styles.stepNumber}>{kycStatus === 'approved' ? '✓' : '3'}</div>
              <span>Complete</span>
            </div>
          </div>
        </div>
        
        <div style={styles.contentContainer}>
          {kycStatus === 'approved' ? (
            // Show verification details for approved users
            <>
              <h2 style={styles.sectionTitle}>✅ Identity Verification Complete</h2>
              <p style={styles.description}>
                Your identity has been successfully verified. You can now access all vault features.
              </p>
              
              <div style={styles.walletInfo}>
                <div style={styles.walletLabel}>Connected Wallet</div>
                <div style={styles.walletAddress}>{walletAddress}</div>
              </div>

              {/* Verification Details */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📋</span>
                  Verification Details
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Verification Status
                    </div>
                    <div style={{ fontWeight: '500', color: '#15803d' }}>
                      ✅ Approved
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Verification Date
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Identity Provider
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      Persona Security
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Document Type
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      Government ID
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Non-US Resident
                    </div>
                    <div style={{ fontWeight: '500', color: '#15803d' }}>
                      ✅ Confirmed
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Risk Level
                    </div>
                    <div style={{ fontWeight: '500', color: '#15803d' }}>
                      Low Risk
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information (Placeholder) */}
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>👤</span>
                  Verified Information
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Full Name
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      John D*** (Masked)
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Date of Birth
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      **/**/1990 (Masked)
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Country of Residence
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      United Kingdom
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Document Number
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      ****1234 (Masked)
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#fef9c3',
                border: '1px solid #facc15',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '2rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#a16207' }}>
                  📋 Important Notice
                </div>
                <div style={{ color: '#a16207' }}>
                  Your personal information is securely stored and encrypted. Only verification status and risk assessment data is accessible to our platform. You can contact support to update or delete your information at any time.
                </div>
              </div>
            </>
          ) : kycStatus === 'rejected' ? (
            // Show rejection message and retry option
            <>
              <h2 style={styles.sectionTitle}>❌ Identity Verification Failed</h2>
              <p style={styles.description}>
                Your identity verification was not successful. This could be due to document quality, 
                information mismatch, or other verification requirements not being met.
              </p>
              
              <div style={styles.walletInfo}>
                <div style={styles.walletLabel}>Connected Wallet</div>
                <div style={styles.walletAddress}>{walletAddress}</div>
              </div>

              {/* Rejection Details */}
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #f87171',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  Verification Failed
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Common reasons for rejection:
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.25rem', 
                    color: '#374151',
                    fontSize: '0.875rem',
                    lineHeight: '1.6'
                  }}>
                    <li>Document image quality too poor or blurry</li>
                    <li>Information on document doesn't match submitted data</li>
                    <li>Document type not supported or expired</li>
                    <li>Address verification requirements not met</li>
                    <li>Additional documentation may be required</li>
                  </ul>
                </div>

                <div style={{
                  backgroundColor: '#fef9c3',
                  border: '1px solid #facc15',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#a16207' }}>
                    💡 What to do next:
                  </div>
                  <div style={{ color: '#a16207' }}>
                    Please ensure you have clear, high-quality images of your government-issued ID and 
                    that all information matches exactly. You can try again immediately with corrected documents.
                  </div>
                </div>
              </div>

              <div style={{
                textAlign: 'center' as 'center',
                marginBottom: '2rem'
              }}>
                <button 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handleRetryKYC}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6m16-6v6h-6M2 14.5c.4-4.1 3.7-7.4 7.5-8.5m11 5c-.4 4.1-3.7 7.4-7.5 8.5" />
                  </svg>
                  Try Verification Again
                </button>
              </div>

              <div style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.875rem',
                textAlign: 'center' as 'center'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Need Help?
                </div>
                <div style={{ color: '#6b7280' }}>
                  If you continue to experience issues, please contact our support team at{' '}
                  <a href="mailto:support@bitsafe.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    support@bitsafe.com
                  </a>{' '}
                  for assistance with the verification process.
                </div>
              </div>
            </>
          ) : (
            // Show KYC form for pending/in-progress users
            <>
              <h2 style={styles.sectionTitle}>KYC and Non-US Resident Confirmation</h2>
              <p style={styles.description}>
                Identity verification and non-US resident confirmation are required before depositing.
                Your wallet is connected. Please complete KYC through our secure verification provider.
              </p>
              
              <div style={styles.walletInfo}>
                <div style={styles.walletLabel}>Connected Wallet</div>
                <div style={styles.walletAddress}>{walletAddress}</div>
              </div>
              
              <div style={styles.personaContainer}>
                <div>
                  <div style={styles.personaTitle}>
                    {personaLoaded ? '🔒 Secure Identity Verification' : '⏳ Loading Verification System...'}
                  </div>
                  <div style={styles.personaDescription}>
                    {personaLoaded 
                      ? 'Powered by Persona - Your data is encrypted and secure'
                      : 'Please wait while we load the verification system'
                    }
                  </div>
                </div>
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
                  <strong>I confirm I am not a US resident</strong><br />
                  This confirmation is required as our vaults are not available to US residents due to regulatory restrictions.
                </label>
              </div>
              
              <div style={styles.statusContainer}>
                <p>KYC Status: {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}</p>
                {kycStatus === 'in-progress' && (
                  <p style={{ color: '#3b82f6', marginTop: '0.5rem' }}>
                    Your verification is already in progress. You can continue or restart the process below.
                  </p>
                )}
              </div>
              
              <button 
                style={styles.startButton}
                onClick={handleStartKYC}
                disabled={!personaLoaded || !nonUSConfirmed || isPersonaOpen}
              >
                {isPersonaOpen 
                  ? 'Verification in Progress...' 
                  : kycStatus === 'in-progress' 
                    ? 'Continue/Restart Identity Verification'
                    : 'Start Identity Verification'
                }
              </button>
            </>
          )}
        </div>
        
        <button 
          style={styles.backButton}
          onClick={() => router.push('/')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Vaults
        </button>
      </main>
    </div>
  );
} 