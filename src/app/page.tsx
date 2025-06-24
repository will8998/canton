'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import VaultCard from '@/components/VaultCard';
import { sampleLagoonVaults, LagoonVault } from '@/data/lagoonVaults';

export default function Home() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);

      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const pageStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    main: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0.5rem'
    },
    heading: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    description: {
      color: '#4b5563',
      marginBottom: '2rem'
    },
    vaultGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '1.5rem',
      marginBottom: '1rem'
    },
    footer: {
      marginTop: '2rem',
      borderTop: '1px solid #e5e7eb',
      paddingTop: '1rem'
    },
    footerText: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    annotationContainer: {
      marginTop: '1.5rem'
    },
    annotationHeading: {
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    annotationList: {
      listStyleType: 'decimal',
      listStylePosition: 'inside' as 'inside',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    annotationItem: {
      marginBottom: '0.5rem'
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1>Bitcoin Yield Vaults</h1>
            <p>Select a vault to view details or deposit. All vaults require KYC and non-US residency.</p>
          </div>
          <Image
            src="/hero.png"
            alt="Bitcoin Yield Vaults Hero"
            fill
            priority
            className="hero-image"
          />
        </div>
        
        {/* Vaults Grid */}
        <div className="vault-grid">
          {sampleLagoonVaults.map(vault => (
            <VaultCard
              key={vault.address}
              {...vault}
            />
          ))}
          
          {/* Coming Soon Card */}
          <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '2px dashed #d1d5db',
            textAlign: 'center' as const,
            opacity: 0.7,
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              marginTop: '0.5rem',
              color: '#6b7280'
            }}>
              More Vaults Coming Soon
            </h3>
            
            <p style={{
              color: '#6b7280',
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              BitSafe will support diverse strategies: low-risk lending, moderate basis trading, high-yield HFT, and structured principal-protected vaults—all with regulated partners.
            </p>
            
            <p style={{
              color: '#6b7280',
              marginBottom: '1rem',
              lineHeight: '1.6',
              fontWeight: '600'
            }}>
              <strong>Trading firms can create custom vaults by contacting us.</strong>
            </p>
            
            <button 
              style={{
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ea580c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f97316';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => {
                window.open('https://tally.so/r/n9PJ85', '_blank');
              }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
