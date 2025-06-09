'use client';

import { useRouter } from 'next/navigation';
import { LagoonVault } from '@/data/lagoonVaults';

interface VaultCardProps extends LagoonVault {}

export default function VaultCard(vault: VaultCardProps) {
  const router = useRouter();
  
  const navigateToVaultDetail = () => {
    router.push(`/vault/${vault.address}`);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return '#10b981'; // Green
      case 'medium': return '#f59e0b'; // Yellow
      case 'high': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <div 
      onClick={navigateToVaultDetail}
      style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.75rem', 
        padding: '1.5rem',
        backgroundColor: 'white',
        marginBottom: '1rem',
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

      {/* Risk Level */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <span style={{ fontSize: '1rem', color: '#111827' }}>Risk Level:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '60px',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: vault.riskLevel === 'Low' ? '33%' : vault.riskLevel === 'Medium' ? '66%' : '100%',
              height: '100%',
              backgroundColor: getRiskColor(vault.riskLevel),
              borderRadius: '4px'
            }} />
          </div>
          <span style={{ 
            fontSize: '1rem', 
            color: '#111827',
            fontWeight: '500'
          }}>
            {vault.riskLevel}
          </span>
        </div>
      </div>

      {/* Lock Period and Minimum */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <span style={{ fontSize: '1rem', color: '#6b7280' }}>
            Lock: {vault.lockPeriod}
            {vault.breakFee && (
              <span style={{ fontSize: '0.875rem' }}>
                {' '}({vault.breakFee} break-fee)
              </span>
            )}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1rem', color: '#6b7280' }}>
            Min: {vault.minimumDeposit}
          </span>
        </div>
      </div>


    </div>
  );
} 