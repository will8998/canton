'use client';

import { useRouter } from 'next/navigation';
import { LagoonVault } from '@/data/lagoonVaults';

interface VaultCardProps extends LagoonVault {}

export default function VaultCard(vault: VaultCardProps) {
  const router = useRouter();
  
  const navigateToVaultDetail = () => {
    router.push(`/vault/${vault.address}`);
  };



  return (
    <div 
      onClick={navigateToVaultDetail}
      style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.75rem', 
        padding: '1.5rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#f97316';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
    >
      {/* Title */}
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        margin: '0 0 0.5rem 0',
        color: '#111827'
      }}>
        {vault.name}
      </h2>

      {/* Provider */}
      <div style={{ 
        fontSize: '1rem', 
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        {vault.assetManager?.name}
      </div>

      {/* APR */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '0.25rem'
        }}>
          {vault.apr ? `${vault.apr.toFixed(1)}%+` : 'N/A'}
        </div>
        <div style={{ 
          fontSize: '1rem', 
          color: '#6b7280'
        }}>
          Target APY
        </div>
      </div>

      {/* Max Drawdown */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <span style={{ fontSize: '1rem', color: '#111827' }}>Max Drawdown:</span>
        </div>
        <div>
          <span style={{ 
            fontSize: '1rem', 
            color: '#ef4444',
            fontWeight: '600',
            backgroundColor: '#fef2f2',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #fecaca'
          }}>
            {vault.maxDrawdown || 'N/A'}
          </span>
        </div>
      </div>

    </div>
  );
} 