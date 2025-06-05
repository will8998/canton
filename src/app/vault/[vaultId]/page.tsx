'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Navbar from '@/components/Navbar';
import CompareVaultsModal from '@/components/CompareVaultsModal';
import { vaultDetails, VaultDetail } from '@/data/vaultDetails';

export default function VaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;
  const [vaultDetail, setVaultDetail] = useState<VaultDetail | null>(null);
  const [timeRange, setTimeRange] = useState('6mo');
  const [showStrategyInfo, setShowStrategyInfo] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    if (vaultId && vaultDetails[vaultId]) {
      setVaultDetail(vaultDetails[vaultId]);
    } else {
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
    heroSection: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    heroTop: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      marginBottom: '2rem'
    },
    heroLeft: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between'
    },
    prospectusLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#3b82f6',
      fontSize: '0.875rem',
      textDecoration: 'none',
      marginBottom: '1.5rem'
    },
    heroRight: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    heroChart: {
      flex: 1,
      minHeight: '300px',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem'
    },
    heroStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem'
    },
    heroStatCard: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    heroStatLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    heroStatValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    heroHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '2rem'
    },
    heroTitle: {
      flex: 1
    },
    vaultName: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    vaultSummary: {
      fontSize: '1.1rem',
      color: '#4b5563',
      maxWidth: '600px'
    },
    compareButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    kycBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '1rem'
    },
    keyMetrics: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem'
    },
    metricCard: {
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    metricLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    metricValue: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    },
    twoColumnLayout: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    strategySection: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const
    },
    prospectusIcon: {
      width: '16px',
      height: '16px'
    },
    prospectusTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#111827'
    },
    prospectusDescription: {
      fontSize: '0.9rem',
      color: '#6b7280',
      marginBottom: '1.5rem',
      maxWidth: '400px',
      lineHeight: '1.5'
    },
    prospectusButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#111827',
      color: 'white',
      borderRadius: '0.5rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    strategyList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    strategyItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb'
    },
    strategyIcon: {
      width: '24px',
      height: '24px',
      color: '#6b7280'
    },
    strategyText: {
      flex: 1,
      fontSize: '0.9rem'
    },
    infoButton: {
      padding: '0.5rem',
      backgroundColor: '#f3f4f6',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    timeRangeSelector: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    timeRangeButton: (active: boolean) => ({
      padding: '0.5rem 1rem',
      backgroundColor: active ? '#111827' : 'white',
      color: active ? 'white' : '#111827',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem'
    }),
    performanceStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    growthCallout: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginTop: '1rem'
    },
    feeSection: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    feeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    feeItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem'
    },
    feeLabel: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    feeValue: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#111827'
    },
    divider: {
      height: '1px',
      backgroundColor: '#e5e7eb',
      margin: '1.5rem 0'
    },
    insuranceBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginTop: '1.5rem',
      gap: '0.5rem'
    },
    stepFlow: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    step: (active: boolean, completed: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: completed ? 'rgba(16, 185, 129, 0.1)' : active ? 'white' : '#f3f4f6',
      border: `1px solid ${completed ? '#10b981' : '#e5e7eb'}`,
      borderRadius: '0.75rem',
      cursor: active ? 'pointer' : 'default',
      opacity: active || completed ? 1 : 0.6
    }),
    stepNumber: (completed: boolean) => ({
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
      backgroundColor: completed ? '#10b981' : '#111827',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      fontSize: '0.875rem',
      fontWeight: 'bold'
    }),
    stepContent: {
      flex: 1
    },
    stepTitle: {
      fontWeight: '500',
      marginBottom: '0.25rem'
    },
    stepDescription: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    warningBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginTop: '1rem',
      gap: '0.5rem'
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
          padding: '0.75rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            Vault: {payload[0].value}
          </p>
          <p style={{ margin: 0, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></span>
            BTC: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          {/* Two Column Layout */}
          <div style={styles.heroTop}>
            {/* Left Column */}
            <div style={styles.heroLeft}>
              <div>
                <div style={styles.kycBadge}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span style={{ marginLeft: '0.5rem' }}>KYC Approved</span>
                </div>
                <h1 style={styles.vaultName}>{vaultDetail.name}</h1>
                <Link href="#" style={styles.prospectusLink}>
                  <svg style={styles.prospectusIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Prospectus
                </Link>
                <p style={styles.vaultSummary}>
                  A sophisticated Bitcoin options strategy combining covered calls, put protection, and volatility harvesting for optimal yield generation.
                </p>
              </div>
              <button 
                style={styles.compareButton}
                onClick={() => setIsCompareModalOpen(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare Vaults
              </button>
            </div>

            {/* Right Column */}
            <div style={styles.heroRight}>
              <div style={styles.heroChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={vaultDetail.performanceChart}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      fontSize="12px"
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize="12px"
                    />
                    <Tooltip content={customTooltip} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="vaultValue"
                      name="Past Performance"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="btcPrice"
                      name="BTC Price"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.growthCallout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+4.3% Month-over-Month Growth</span>
              </div>
            </div>
          </div>

          {/* Single Row of Stats */}
          <div style={styles.heroStats}>
            <div style={styles.heroStatCard}>
              <div style={styles.heroStatLabel}>Target APY</div>
              <div style={styles.heroStatValue}>16.4%</div>
            </div>
            <div style={styles.heroStatCard}>
              <div style={styles.heroStatLabel}>Minimum Investment</div>
              <div style={styles.heroStatValue}>20 BTC</div>
            </div>
            <div style={styles.heroStatCard}>
              <div style={styles.heroStatLabel}>Total Value Locked</div>
              <div style={styles.heroStatValue}>486 BTC</div>
            </div>
          </div>
        </section>

        {/* Two Column Layout Starts */}
        <div style={styles.twoColumnLayout}>
          {/* Left Column */}
          <div>
            {/* Fee Structure & Additional Information */}
            <section style={styles.feeSection}>
              <div style={styles.feeGrid}>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Management Fee</div>
                  <div style={styles.feeValue}>2%</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Performance Fee</div>
                  <div style={styles.feeValue}>25%</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Early Redemption</div>
                  <div style={styles.feeValue}>5%</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Notice Period</div>
                  <div style={styles.feeValue}>60 days</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Custody</div>
                  <div style={styles.feeValue}>Copper.co</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Multi-Party Computation (MPC)</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>TVL Limit</div>
                  <div style={styles.feeValue}>2,500 BTC</div>
                </div>
                <div style={styles.feeItem}>
                  <div style={styles.feeLabel}>Available Capacity</div>
                  <div style={styles.feeValue}>892 BTC</div>
                </div>
              </div>

              <div style={styles.divider} />

              <div style={styles.insuranceBadge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Insured up to $500M through Ledger Enterprise</span>
              </div>

              <div style={styles.warningBadge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>12-month lock-up period with 5% early withdrawal penalty</span>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div>
            {/* Action Flow Section */}
            <section style={styles.section}>
              <div style={styles.sectionTitle}>Get Started</div>
              <div style={styles.stepFlow}>
                <div style={styles.step(false, true)}>
                  <div style={styles.stepNumber(true)}>✓</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>Connect Wallet</div>
                    <div style={styles.stepDescription}>Your wallet is connected and ready</div>
                  </div>
                </div>
                
                <div style={styles.step(false, true)}>
                  <div style={styles.stepNumber(true)}>✓</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>Complete KYC</div>
                    <div style={styles.stepDescription}>Your identity has been verified</div>
                  </div>
                </div>
                
                <div style={styles.step(true, false)}>
                  <div style={styles.stepNumber(false)}>3</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>Make Deposit</div>
                    <div style={styles.stepDescription}>Minimum 20 BTC required</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      {vaultDetail && (
        <CompareVaultsModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          currentVault={vaultDetail}
        />
      )}
    </div>
  );
} 