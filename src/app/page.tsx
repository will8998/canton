'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import VaultCard from '@/components/VaultCard';
import VaultFilters from '@/components/VaultFilters';
import { sampleLagoonVaults, LagoonVault } from '@/data/lagoonVaults';

export default function Home() {
  const [filteredVaults, setFilteredVaults] = useState<LagoonVault[]>(sampleLagoonVaults);
  const [totalAssets, setTotalAssets] = useState('343'); // Total ETH from Lagoon vaults
  const [isMobile, setIsMobile] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('All Providers');
  const [currentSort, setCurrentSort] = useState('Target APY');

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
    setCurrentFilter(filterBy);
    applyFilters(filterBy, currentSort);
  };

  const handleSortChange = (sortBy: string) => {
    setCurrentSort(sortBy);
    applyFilters(currentFilter, sortBy);
  };

  const applyFilters = (filterBy: string, sortBy: string) => {
    let filtered = [...sampleLagoonVaults];

    // Apply provider filter
    if (filterBy !== 'All Providers') {
      filtered = filtered.filter(vault => vault.assetManager?.name === filterBy);
    }

    // Apply sorting
    if (sortBy === 'Target APY') {
      filtered.sort((a, b) => 
        (b.apr || 0) - (a.apr || 0)
      );
    } else if (sortBy === 'TVL') {
      filtered.sort((a, b) => 
        (b.tvl || 0) - (a.tvl || 0)
      );
    }

    setFilteredVaults(filtered);
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
        
        {/* Filters */}
        <div className="filter-section">
          <VaultFilters 
            onFilterChange={handleFilterChange} 
            onSortChange={handleSortChange}
          />
        </div>
        
        {/* Vaults Grid */}
        <div className="vault-grid">
          {filteredVaults.map(vault => (
            <VaultCard
              key={vault.address}
              {...vault}
            />
          ))}
        </div>
        
        {/* Footer Stats */}
        <div className="footer-stats">
          <p>
            Active Vaults: {filteredVaults.filter(v => v.visible && !v.paused).length} | 
            Total TVL: ${(filteredVaults.reduce((sum, vault) => sum + (vault.tvl || 0), 0) / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>
    </div>
  );
}
