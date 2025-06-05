'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');

  const menuItems = [
    'Profile',
    'KYC Information',
    'Security'
  ];

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
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as 'center'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    contentWrapper: {
      display: 'flex',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      overflow: 'hidden'
    },
    sidebar: {
      width: '250px',
      borderRight: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    sidebarItem: {
      padding: '1rem',
      cursor: 'pointer',
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s ease'
    },
    activeItem: {
      backgroundColor: '#e5e7eb',
      fontWeight: 'bold'
    },
    content: {
      flex: '1',
      padding: '2rem'
    },
    walletInfoContainer: {
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      marginLeft: 'auto',
      maxWidth: '25rem',
      marginBottom: '2rem'
    },
    walletStatusDot: {
      width: '1rem',
      height: '1rem',
      borderRadius: '50%',
      backgroundColor: '#10b981',
      marginRight: '0.75rem'
    },
    walletInfo: {
      fontSize: '0.875rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 'medium'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      backgroundColor: 'white'
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#111827',
      color: 'white',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'medium',
      marginRight: '0.75rem'
    },
    secondaryButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'white',
      color: '#111827',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      fontWeight: 'medium'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e5e7eb'
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'Profile':
        return (
          <div>
            <h2 style={styles.sectionTitle}>Profile Information</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: '#f9fafb',
                fontSize: '1rem'
              }}>
                John Doe
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: '#f9fafb',
                fontSize: '1rem'
              }}>
                john.doe@example.com
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Country of Residence</label>
              <div style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: '#f9fafb',
                fontSize: '1rem'
              }}>
                Switzerland
              </div>
            </div>
          </div>
        );
      
      case 'KYC Information':
        return (
          <div>
            <h2 style={styles.sectionTitle}>KYC & Verification</h2>
            
            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}>✓</div>
                <span style={{ fontWeight: 'bold' }}>KYC Status: Approved</span>
              </div>
              <p style={{ margin: '0 0 0 1.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                Your account is fully verified and has access to all platform features.
                Verification was completed on March 15, 2025.
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Personal Information</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={styles.label}>Full Legal Name</label>
                  <div style={{
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f9fafb'
                  }}>
                    John A. Doe
                  </div>
                </div>
                
                <div>
                  <label style={styles.label}>Date of Birth</label>
                  <div style={{
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f9fafb'
                  }}>
                    Jan 15, 1985
                  </div>
                </div>
                
                <div>
                  <label style={styles.label}>Nationality</label>
                  <div style={{
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f9fafb'
                  }}>
                    Switzerland
                  </div>
                </div>
                
                <div>
                  <label style={styles.label}>Country of Residence</label>
                  <div style={{
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f9fafb'
                  }}>
                    Switzerland
                  </div>
                </div>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Submitted Documents</h3>
              
              <div style={{
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 'medium'
                }}>
                  Verification Documents
                </div>
                
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Government ID (Passport)</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Submitted: Mar 10, 2025 • Verified: Mar 15, 2025
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    Verified
                  </div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Proof of Address</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Submitted: Mar 10, 2025 • Verified: Mar 15, 2025
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    Verified
                  </div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Non-US Declaration</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Submitted: Mar 10, 2025 • Verified: Mar 15, 2025
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    Verified
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              gap: '1rem'
            }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 'medium'
              }}>
                Download KYC Data
              </button>
              
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 'medium'
              }}>
                Request Information Update
              </button>
            </div>
          </div>
        );
      
      case 'Security':
        return (
          <div>
            <h2 style={styles.sectionTitle}>Security Settings</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Change Password</label>
              <input
                style={{ ...styles.input, marginBottom: '1rem' }}
                type="password"
                placeholder="Current Password"
              />
              <input
                style={{ ...styles.input, marginBottom: '1rem' }}
                type="password"
                placeholder="New Password"
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Confirm New Password"
              />
              <div style={{
                display: 'flex',
                marginTop: '0.5rem'
              }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#111827',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '0.75rem'
                }}>
                  Update Password
                </button>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Session Management</label>
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 'medium'
                }}>
                  Active Sessions
                </div>
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Current Browser (Chrome)</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      IP: 192.168.1.1 • Last active: Just now
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    Current
                  </div>
                </div>
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Mobile App (iOS)</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      IP: 203.0.113.1 • Last active: 2 days ago
                    </div>
                  </div>
                  <button style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    Revoke
                  </button>
                </div>
              </div>
              <div style={{
                marginTop: '1rem'
              }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'medium'
                }}>
                  Logout From All Devices
                </button>
              </div>
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeeba',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#856404'
            }}>
              <p style={{ margin: 0 }}>
                <strong>Security Reminder:</strong> Never share your password with anyone. BitSafe team will never ask for your private keys or seed phrases.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <main style={styles.main}>
        <div style={styles.walletInfoContainer}>
          <div style={styles.walletStatusDot}></div>
          <div style={styles.walletInfo}>
            <div>Wallet: 0x71C...F52A</div>
            <div>KYC Status: Approved ✓</div>
          </div>
        </div>
        
        <header style={styles.header}>
          <h1 style={styles.title}>Account Settings</h1>
        </header>
        
        <div style={styles.contentWrapper}>
          <div style={styles.sidebar}>
            {menuItems.map((item) => (
              <div
                key={item}
                style={{
                  ...styles.sidebarItem,
                  ...(activeTab === item ? styles.activeItem : {})
                }}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </div>
            ))}
          </div>
          
          <div style={styles.content}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
