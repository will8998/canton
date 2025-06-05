'use client';

import { useRouter } from 'next/navigation';

type RiskLevel = 'Low' | 'Medium-Low' | 'Medium' | 'Medium-High' | 'High';

interface VaultCardProps {
  id: string;
  name: string;
  provider: string;
  targetAPY: string;
  lockPeriod: string;
  breakFee: string;
  minimumBTC: string;
}

export default function VaultCard({
  id,
  name,
  provider,
  targetAPY,
  lockPeriod,
  breakFee,
  minimumBTC,
}: VaultCardProps) {
  const router = useRouter();
  
  const navigateToVaultDetail = () => {
    router.push(`/vault/${id}`);
  };

  return (
    <div style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '0.5rem', 
      padding: '1.5rem',
      transition: 'box-shadow 0.3s ease',
      marginBottom: '1rem',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
    onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
    onClick={navigateToVaultDetail}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{name}</h3>
        <div style={{ 
          display: 'inline-block', 
          backgroundColor: '#f3f4f6', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '9999px', 
          fontSize: '0.875rem', 
          marginBottom: '1rem' 
        }}>
          {provider}
        </div>
        <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{targetAPY}+</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Target APY</div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Lock: {lockPeriod}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>({breakFee} break-fee)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Min: {minimumBTC} BTC</div>
          </div>
        </div>

        <button 
          style={{ 
            width: '100%', 
            marginTop: '0.5rem', 
            padding: '0.5rem 0',
            border: '1px solid #d1d5db', 
            borderRadius: '0.5rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/vault/${id}`);
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          View Details
        </button>
      </div>
    </div>
  );
} 