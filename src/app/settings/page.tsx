'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');

  const menuItems = [
    'Profile',
    'Wallet Connection',
    'KYC Information',
    'Notifications',
    'Security',
    'Tax Documents',
    'API Access'
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

  // Render different content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'Profile':
        return (
          <div>
            <h2 style={styles.sectionTitle}>Profile Information</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                defaultValue="John Doe"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                defaultValue="john.doe@example.com"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Country of Residence</label>
              <select style={styles.select}>
                <option>Switzerland</option>
                <option>Singapore</option>
                <option>United Kingdom</option>
                <option>Japan</option>
                <option>Germany</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Timezone</label>
              <select style={styles.select}>
                <option>UTC+00:00 (GMT)</option>
                <option>UTC+01:00 (CET)</option>
                <option>UTC+08:00 (SGT)</option>
                <option>UTC+09:00 (JST)</option>
                <option>UTC-05:00 (EST)</option>
              </select>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <button style={styles.button}>
                Save Changes
              </button>
              <button style={styles.secondaryButton}>
                Cancel
              </button>
            </div>
          </div>
        );
      
      case 'Wallet Connection':
        return (
          <div>
            <h2 style={styles.sectionTitle}>Connected Wallets</h2>
            
            <div style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Metamask</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>0x71C...F52A</div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    marginRight: '0.5rem'
                  }}></div>
                  <span style={{ fontSize: '0.875rem' }}>Connected</span>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1rem'
              }}>
                <button style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  marginRight: '0.5rem',
                  cursor: 'pointer'
                }}>
                  Disconnect
                </button>
              </div>
            </div>
            
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Connect Another Wallet</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {['Ledger', 'Trezor', 'Coinbase Wallet', 'WalletConnect'].map(wallet => (
                <div key={wallet} style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  textAlign: 'center' as 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: 'white'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: 'medium', marginBottom: '0.5rem' }}>{wallet}</div>
                  <button style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    Connect
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>
                <strong>Note:</strong> Connecting a new wallet will require KYC verification if you haven't completed it already.
                Multiple wallets can be connected to your account for flexibility, but each transaction will require explicit wallet selection.
              </p>
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
      
      case 'Notifications':
        return (
          <div>
            <h2 style={styles.sectionTitle}>Notification Preferences</h2>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Email Notifications</h3>
              
              <div style={{
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Investment Confirmations</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Receive email notifications when you deposit or withdraw from vaults
                    </div>
                  </div>
                  <label style={{
                    position: 'relative' as 'relative',
                    display: 'inline-block',
                    width: '3rem',
                    height: '1.5rem'
                  }}>
                    <input type="checkbox" defaultChecked style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }} />
                    <span style={{
                      position: 'absolute' as 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#10b981',
                      borderRadius: '9999px',
                      transition: '0.4s'
                    }}>
                      <span style={{
                        position: 'absolute' as 'absolute',
                        content: '',
                        height: '1.125rem',
                        width: '1.125rem',
                        left: '0.25rem',
                        bottom: '0.1875rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.4s',
                        transform: 'translateX(1.5rem)'
                      }}></span>
                    </span>
                  </label>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Performance Updates</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Receive monthly performance updates for vaults you've invested in
                    </div>
                  </div>
                  <label style={{
                    position: 'relative' as 'relative',
                    display: 'inline-block',
                    width: '3rem',
                    height: '1.5rem'
                  }}>
                    <input type="checkbox" defaultChecked style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }} />
                    <span style={{
                      position: 'absolute' as 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#10b981',
                      borderRadius: '9999px',
                      transition: '0.4s'
                    }}>
                      <span style={{
                        position: 'absolute' as 'absolute',
                        content: '',
                        height: '1.125rem',
                        width: '1.125rem',
                        left: '0.25rem',
                        bottom: '0.1875rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.4s',
                        transform: 'translateX(1.5rem)'
                      }}></span>
                    </span>
                  </label>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Security Alerts</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Receive notifications about security events like login attempts and password changes
                    </div>
                  </div>
                  <label style={{
                    position: 'relative' as 'relative',
                    display: 'inline-block',
                    width: '3rem',
                    height: '1.5rem'
                  }}>
                    <input type="checkbox" defaultChecked style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }} />
                    <span style={{
                      position: 'absolute' as 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#10b981',
                      borderRadius: '9999px',
                      transition: '0.4s'
                    }}>
                      <span style={{
                        position: 'absolute' as 'absolute',
                        content: '',
                        height: '1.125rem',
                        width: '1.125rem',
                        left: '0.25rem',
                        bottom: '0.1875rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.4s',
                        transform: 'translateX(1.5rem)'
                      }}></span>
                    </span>
                  </label>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Marketing & Announcements</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Receive updates about new vaults, features, and other BitSafe news
                    </div>
                  </div>
                  <label style={{
                    position: 'relative' as 'relative',
                    display: 'inline-block',
                    width: '3rem',
                    height: '1.5rem'
                  }}>
                    <input type="checkbox" style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }} />
                    <span style={{
                      position: 'absolute' as 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#d1d5db',
                      borderRadius: '9999px',
                      transition: '0.4s'
                    }}>
                      <span style={{
                        position: 'absolute' as 'absolute',
                        content: '',
                        height: '1.125rem',
                        width: '1.125rem',
                        left: '0.25rem',
                        bottom: '0.1875rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.4s',
                        transform: 'translateX(0)'
                      }}></span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Notification Delivery</h3>
              
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Primary Email Address</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <input 
                      style={{ ...styles.input, margin: 0 }}
                      type="email"
                      defaultValue="john.doe@example.com"
                    />
                    <button style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap' as 'nowrap'
                    }}>
                      Update Email
                    </button>
                  </div>
                </div>
                
                <div style={{
                  padding: '1rem'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Notification Frequency</div>
                  <select style={styles.select}>
                    <option>Immediate (send each notification as it happens)</option>
                    <option>Daily Digest (group notifications into a single daily email)</option>
                    <option>Weekly Summary (send only a weekly summary)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{
              marginTop: '1.5rem'
            }}>
              <button style={styles.button}>
                Save Preferences
              </button>
              <button style={styles.secondaryButton}>
                Reset to Default
              </button>
            </div>
          </div>
        );
      
      case 'Security':
        return (
          <div>
            <h2 style={styles.sectionTitle}>Security Settings</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Two-Factor Authentication (2FA)</label>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Status: Active</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Last verified: 3 days ago
                  </div>
                </div>
                <button style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}>
                  Disable 2FA
                </button>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1.5rem'
              }}>
                Two-factor authentication adds an extra layer of security to your account.
              </div>
            </div>
            
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
                <strong>Security Reminder:</strong> Never share your password or 2FA codes with anyone. BitSafe team will never ask for your private keys or seed phrases.
              </p>
            </div>
          </div>
        );
      
      case 'Tax Documents':
        return (
          <div>
            <h2 style={styles.sectionTitle}>Tax Documents</h2>
            
            <div style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              backgroundColor: '#f9fafb',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                BitSafe provides tax documents for all your vault investments at the end of each tax year. 
                Documents are typically available by January 31st for the previous year.
              </p>
            </div>
            
            <div style={{
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Available Documents</h3>
              
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 'medium',
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 150px 100px',
                  gap: '1rem'
                }}>
                  <div>Document</div>
                  <div>Tax Year</div>
                  <div>Date Available</div>
                  <div>Actions</div>
                </div>
                
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 150px 100px',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Annual Investment Summary</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Statement of all vault activities</div>
                  </div>
                  <div>2024</div>
                  <div>Jan 15, 2025</div>
                  <div>
                    <button style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      Download
                    </button>
                  </div>
                </div>
                
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 150px 100px',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Transaction History</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Detailed record of all transactions</div>
                  </div>
                  <div>2024</div>
                  <div>Jan 15, 2025</div>
                  <div>
                    <button style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      Download
                    </button>
                  </div>
                </div>
                
                <div style={{
                  padding: '0.75rem 1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 150px 100px',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Tax Gain/Loss Report</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Summary of realized gains and losses</div>
                  </div>
                  <div>2024</div>
                  <div>Jan 15, 2025</div>
                  <div>
                    <button style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Tax Jurisdiction Settings</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={styles.label}>Tax Jurisdiction</label>
                  <select style={styles.select}>
                    <option>Switzerland</option>
                    <option>Singapore</option>
                    <option>United Kingdom</option>
                    <option>Germany</option>
                    <option>Japan</option>
                  </select>
                </div>
                
                <div>
                  <label style={styles.label}>Tax Identification Number</label>
                  <input
                    style={styles.input}
                    type="text"
                    defaultValue="CH-123456789"
                  />
                </div>
              </div>
              
              <div>
                <button style={styles.button}>
                  Save Tax Settings
                </button>
              </div>
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>
                <strong>Disclaimer:</strong> BitSafe provides these documents for informational purposes only. 
                Please consult with a tax professional for advice on your specific tax situation.
              </p>
            </div>
          </div>
        );
      
      case 'API Access':
        return (
          <div>
            <h2 style={styles.sectionTitle}>API Keys & Integrations</h2>
            
            <div style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              backgroundColor: '#f9fafb',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                BitSafe offers API access for read-only data retrieval from your portfolio.
                API keys are restricted to your specific account and can be revoked at any time.
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Your API Keys</h3>
              
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 'medium'
                }}>
                  Active API Keys
                </div>
                
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Portfolio Data (Read-Only)</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Created: Jan 10, 2025 • Last used: 2 days ago
                      </div>
                      <div style={{
                        backgroundColor: '#f3f4f6',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-all' as 'break-all'
                      }}>
                        bs_pk_7aB9cDeFg1H2iJkLmN0pQrStUvWxYz3A4B5C6D7E8F9G0H1I2J3K
                      </div>
                    </div>
                    <button style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}>
                      Revoke
                    </button>
                  </div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#111827',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>Generate New API Key</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>API Permission Scope</h3>
              
              <div style={{
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <input
                    type="checkbox"
                    id="scope-balance"
                    defaultChecked
                    style={{ marginRight: '0.5rem', marginTop: '0.25rem' }}
                  />
                  <div>
                    <label htmlFor="scope-balance" style={{ fontWeight: 'bold', display: 'block' }}>
                      Portfolio Balance
                    </label>
                    <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                      Allow access to current portfolio value, profit/loss data, and allocation metrics
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <input
                    type="checkbox"
                    id="scope-history"
                    defaultChecked
                    style={{ marginRight: '0.5rem', marginTop: '0.25rem' }}
                  />
                  <div>
                    <label htmlFor="scope-history" style={{ fontWeight: 'bold', display: 'block' }}>
                      Transaction History
                    </label>
                    <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                      Allow access to deposit and withdrawal history, including timestamps and amounts
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <input
                    type="checkbox"
                    id="scope-performance"
                    defaultChecked
                    style={{ marginRight: '0.5rem', marginTop: '0.25rem' }}
                  />
                  <div>
                    <label htmlFor="scope-performance" style={{ fontWeight: 'bold', display: 'block' }}>
                      Performance Metrics
                    </label>
                    <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                      Allow access to historical performance data for each vault investment
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>IP Restrictions</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Allowed IP Addresses (Optional)</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g., 192.168.1.1, 203.0.113.1"
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  For enhanced security, you can restrict API access to specific IP addresses. 
                  Leave empty to allow access from any IP.
                </p>
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
              <p style={{ margin: '0', fontWeight: 'bold' }}>Important Security Notice:</p>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                <li>API keys provide access to your portfolio data - keep them secure</li>
                <li>Never share API keys with anyone or commit them to code repositories</li>
                <li>Regularly rotate your API keys, especially after team member changes</li>
                <li>If you suspect a key has been compromised, revoke it immediately</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab</div>;
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
          {/* Sidebar Navigation */}
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
          
          {/* Content Area */}
          <div style={styles.content}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
} 