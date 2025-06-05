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
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'Profile':
        return (
          <div>
            <h2>Profile Information</h2>
            <div>
              <label>Full Name</label>
              <div>John Doe</div>
            </div>
            <div>
              <label>Email Address</label>
              <div>john.doe@example.com</div>
            </div>
            <div>
              <label>Country of Residence</label>
              <div>Switzerland</div>
            </div>
          </div>
        );
      
      case 'KYC Information':
        return (
          <div>
            <h2>KYC & Verification</h2>
            <div>
              <h3>Personal Information</h3>
              <div>
                <label>Full Legal Name</label>
                <div>John A. Doe</div>
              </div>
              <div>
                <label>Date of Birth</label>
                <div>Jan 15, 1985</div>
              </div>
              <div>
                <label>Nationality</label>
                <div>Switzerland</div>
              </div>
            </div>
            <div>
              <h3>Verification Status</h3>
              <div>
                <div>Government ID (Passport)</div>
                <div>Verified</div>
              </div>
              <div>
                <div>Proof of Address</div>
                <div>Verified</div>
              </div>
            </div>
          </div>
        );
      
      case 'Security':
        return (
          <div>
            <h2>Security Settings</h2>
            <div>
              <label>Change Password</label>
              <input type="password" placeholder="Current Password" />
              <input type="password" placeholder="New Password" />
              <input type="password" placeholder="Confirm New Password" />
              <button>Update Password</button>
            </div>
            <div>
              <label>Session Management</label>
              <div>
                <div>Current Browser (Chrome)</div>
                <div>IP: 192.168.1.1 • Last active: Just now</div>
              </div>
              <button>Logout From All Devices</button>
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
