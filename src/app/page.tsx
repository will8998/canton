'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import VaultCard from '@/components/VaultCard';
import VaultFilters from '@/components/VaultFilters';
import { vaults } from '@/data/vaults';

export default function Home() {
  const [filteredVaults, setFilteredVaults] = useState(vaults);
  const [totalAssets, setTotalAssets] = useState('125.5'); // Mock data
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
      padding: '2rem 1rem'
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
      marginBottom: '2rem'
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

  const handleFilterChange = (filterBy: string) => {
    if (filterBy === 'All Providers') {
      setFilteredVaults(vaults);
    } else {
      setFilteredVaults(vaults.filter(vault => vault.provider === filterBy));
    }
  };

  const handleSortChange = (sortBy: string) => {
    let sortedVaults = [...filteredVaults];
    
    if (sortBy === 'Target APY') {
      sortedVaults.sort((a, b) => 
        parseInt(a.targetAPY) > parseInt(b.targetAPY) ? -1 : 1
      );
    } else if (sortBy === 'Risk Level') {
      const riskOrder = {
        'Low': 1,
        'Medium-Low': 2,
        'Medium': 3,
        'Medium-High': 4,
        'High': 5
      };
      sortedVaults.sort((a, b) => 
        riskOrder[a.riskLevel] > riskOrder[b.riskLevel] ? 1 : -1
      );
    }
    
    setFilteredVaults(sortedVaults);
  };

  return (
    <div style={pageStyles.container}>
      <Navbar />
      
      <main style={pageStyles.main}>
        <h1 style={pageStyles.heading}>Bitcoin Yield Vaults</h1>
        <p style={pageStyles.description}>
          Select a vault to view details or deposit. All vaults require KYC and non-US residency.
        </p>
        
        <VaultFilters 
          onFilterChange={handleFilterChange} 
          onSortChange={handleSortChange} 
        />
        
        <div style={pageStyles.vaultGrid}>
          {filteredVaults.map(vault => (
            <VaultCard
              key={vault.id}
              id={vault.id}
              name={vault.name}
              provider={vault.provider}
              targetAPY={vault.targetAPY}
              riskLevel={vault.riskLevel}
              lockPeriod={vault.lockPeriod}
              breakFee={vault.breakFee}
              minimumBTC={vault.minimumBTC}
            />
          ))}
        </div>
        
        <div style={pageStyles.footer}>
          <p style={pageStyles.footerText}>
            Total Vaults: {filteredVaults.length} | Total TVL: {totalAssets} BTC
          </p>
          
          <div style={pageStyles.annotationContainer}>
            <h3 style={pageStyles.annotationHeading}>Annotations:</h3>
            <ol style={pageStyles.annotationList}>
              <li style={pageStyles.annotationItem}>Each "View Details" button navigates to the respective Vault Details Screen.</li>
              <li style={pageStyles.annotationItem}>"Connect Wallet" button in top-right navigates to Wallet Connection Screen.</li>
              <li style={pageStyles.annotationItem}>Filter and sort controls allow users to customize the vault listing view.</li>
              <li style={pageStyles.annotationItem}>Risk level indicators provide visual representation of relative risk.</li>
              <li style={pageStyles.annotationItem}>Vault data fetched from backend via SettleData.totalAssets for each vault.</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
