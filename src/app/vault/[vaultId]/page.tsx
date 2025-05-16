'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Navbar from '@/components/Navbar';
import { vaultDetails, VaultDetail } from '@/data/vaultDetails';

export default function VaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;
  const [vaultDetail, setVaultDetail] = useState<VaultDetail | null>(null);

  useEffect(() => {
    if (vaultId && vaultDetails[vaultId]) {
      setVaultDetail(vaultDetails[vaultId]);
    } else {
      // Vault not found, redirect to the catalog
      router.push('/');
    }
  }, [vaultId, router]);

  if (!vaultDetail) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading vault details...</p>
      </div>
    );
  }

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
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    sectionContainer: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem'
    },
    overviewItem: {
      padding: '0.5rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.375rem',
      backgroundColor: 'white'
    },
    overviewLabel: {
      fontWeight: 'bold',
      marginRight: '0.5rem'
    },
    strategyDescription: {
      marginBottom: '1rem'
    },
    prospectusLink: {
      color: '#3b82f6',
      textDecoration: 'underline'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem'
    },
    metricRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem'
    },
    metricLabel: {
      fontWeight: 'bold'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      padding: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    stepButton: {
      position: 'relative' as 'relative',
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      paddingLeft: '3rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontWeight: 'medium',
      transition: 'background-color 0.3s ease'
    },
    stepNumber: {
      position: 'absolute' as 'absolute',
      left: '1rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.5rem',
      height: '1.5rem',
      borderRadius: '50%',
      backgroundColor: '#111827',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: 'bold'
    },
    backButton: {
      marginLeft: 'auto',
      padding: '0.75rem 1.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    chartContainer: {
      height: '250px',
      width: '100%',
      marginTop: '1rem'
    }
  };

  const renderLabelContent = (props: any) => {
    const { x, y, value } = props;
    return (
      <text x={x} y={y} dy={-10} fill="#111827" fontSize={12} textAnchor="middle">
        {value}
      </text>
    );
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e5e7eb',
          padding: '0.5rem',
          borderRadius: '0.25rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          <p style={{ margin: 0, color: '#10b981' }}>{`Vault: ${payload[0].value}`}</p>
          <p style={{ margin: 0, color: '#f59e0b' }}>{`BTC: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.title}>{vaultDetail.name}</h1>
        </header>
        
        {/* Overview Section */}
        <section style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>Overview</h2>
          <div style={styles.overviewGrid}>
            <div style={styles.overviewItem}>
              <span style={styles.overviewLabel}>Target APY:</span> {vaultDetail.targetAPY}
            </div>
            <div style={styles.overviewItem}>
              <span style={styles.overviewLabel}>Risk Level:</span> {vaultDetail.riskLevel}
            </div>
            <div style={styles.overviewItem}>
              <span style={styles.overviewLabel}>Lock-Up:</span> {vaultDetail.lockPeriod} ({vaultDetail.breakFee} break-fee)
            </div>
            <div style={styles.overviewItem}>
              <span style={styles.overviewLabel}>Min Investment:</span> {vaultDetail.minimumBTC}
            </div>
          </div>
        </section>
        
        {/* Strategy Section */}
        <section style={styles.sectionContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={styles.sectionTitle}>Strategy</h2>
            <div>
              <span style={{ marginRight: '0.5rem' }}>Prospectus:</span>
              <Link href="#" style={styles.prospectusLink}>View Prospectus</Link>
            </div>
          </div>
          <p style={styles.strategyDescription}>{vaultDetail.strategy}</p>
        </section>
        
        {/* Performance & Fee Structure */}
        <div style={styles.gridContainer}>
          <section style={styles.sectionContainer}>
            <h2 style={styles.sectionTitle}>Performance</h2>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Target APY:</div>
              <div>{vaultDetail.targetAPY}</div>
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Max Drawdown:</div>
              <div>{vaultDetail.maxDrawdown}</div>
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>BTC Correlation:</div>
              <div>{vaultDetail.btcCorrelation}</div>
            </div>
            
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={vaultDetail.performanceChart}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="vaultValue"
                    name="iYield-A Value"
                    stroke="#10b981"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="btcPrice"
                    name="BTC Price"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          
          <section style={styles.sectionContainer}>
            <h2 style={styles.sectionTitle}>Fee Structure</h2>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Management Fee:</div>
              <div>{vaultDetail.managementFee}</div>
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Performance Fee:</div>
              <div>{vaultDetail.performanceFee}</div>
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Early Redemption Fee:</div>
              <div>{vaultDetail.earlyRedemptionFee}</div>
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Custody Solution:</div>
              <div>{vaultDetail.custodySolution}</div>
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Insurance:</div>
              <div>{vaultDetail.insurance}</div>
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metricLabel}>Notice Period:</div>
              <div>{vaultDetail.noticePeriod}</div>
            </div>
          </section>
        </div>
        
        {/* Additional Information */}
        <section style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>Additional Information</h2>
          <div style={styles.metricRow}>
            <div style={styles.metricLabel}>TVL Limit:</div>
            <div>{vaultDetail.tvlLimit}</div>
          </div>
          <div style={styles.metricRow}>
            <div style={styles.metricLabel}>Lock-Up Detail:</div>
            <div>{vaultDetail.lockUpDetail}</div>
          </div>
        </section>
        
        {/* Action Buttons */}
        <section style={{ ...styles.sectionContainer, padding: 0 }}>
          <div style={styles.buttonContainer}>
            <Link href="/connect" style={{ textDecoration: 'none' }}>
              <button style={styles.stepButton}>
                <span style={styles.stepNumber}>1</span>
                Connect Wallet
              </button>
            </Link>
            <button style={styles.stepButton} onClick={() => router.push('/connect')}>
              <span style={styles.stepNumber}>2</span>
              Start KYC
            </button>
            <button style={{ 
              ...styles.stepButton, 
              backgroundColor: '#f3f4f6',
              cursor: 'not-allowed',
              color: '#9ca3af'
            }}>
              <span style={{ ...styles.stepNumber, backgroundColor: '#9ca3af' }}>3</span>
              Deposit
            </button>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button style={styles.backButton}>
                Back to Catalog
              </button>
            </Link>
          </div>
        </section>
        
        {/* Annotations */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Annotations:</h3>
          <ol style={{ listStyleType: 'decimal', listStylePosition: 'inside' as 'inside', fontSize: '0.875rem', color: '#6b7280' }}>
            <li style={{ marginBottom: '0.5rem' }}>"Connect Wallet" button (Step 1) navigates to Wallet Connection Screen if user is unauthenticated.</li>
            <li style={{ marginBottom: '0.5rem' }}>"Start KYC" button (Step 2) navigates to KYC Screen if KYC incomplete.</li>
            <li style={{ marginBottom: '0.5rem' }}>"Deposit" button (Step 3) navigates to Deposit Screen; disabled until wallet connected and KYC approved.</li>
            <li style={{ marginBottom: '0.5rem' }}>"View Prospectus" link in Strategy section opens the Atitlan prospectus in a new tab.</li>
            <li style={{ marginBottom: '0.5rem' }}>"Back to Catalog" button returns to the Vault Catalog screen.</li>
            <li style={{ marginBottom: '0.5rem' }}>Performance chart and metrics are populated from SettleData API.</li>
            <li style={{ marginBottom: '0.5rem' }}>Numbered circles (1-2-3) indicate the sequential steps required for fund participation.</li>
          </ol>
        </div>
      </main>
    </div>
  );
} 