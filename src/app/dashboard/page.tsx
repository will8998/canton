'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import Navbar from '@/components/Navbar';

// Mock data for portfolio
const portfolioData = {
  totalInvestment: '12.50 BTC',
  currentValue: '13.27 BTC',
  totalProfitLoss: '+0.77 BTC (+6.2%)',
  weightedAPY: '11.3%',
  investments: [
    {
      id: 'iyield-a',
      name: 'iYield-A',
      provider: 'Atitlan',
      invested: '10.00 BTC',
      currentValue: '10.50 BTC',
      profitLoss: '+0.50 BTC (+5.0%)',
      apy: '12.7%',
      lockUpStatus: '3 of 6 months'
    },
    {
      id: 'iyield-x1',
      name: 'iYield-X1',
      provider: 'XBTO',
      invested: '1.75 BTC',
      currentValue: '1.85 BTC',
      profitLoss: '+0.10 BTC (+5.7%)',
      apy: '13.1%',
      lockUpStatus: '1 of 9 months'
    },
    {
      id: 'iyield-f',
      name: 'iYield-F',
      provider: 'Forteus',
      invested: '0.75 BTC',
      currentValue: '0.92 BTC',
      profitLoss: '+0.17 BTC (+22.7%)',
      apy: '10.2%',
      lockUpStatus: 'Completed'
    }
  ]
};

// Data for pie chart
const pieData = [
  { name: 'iYield-A', value: 10.50, percent: 79 },
  { name: 'iYield-X1', value: 1.85, percent: 14 },
  { name: 'iYield-F', value: 0.92, percent: 7 }
];

// Data for line chart
const lineChartData = [
  { month: 'Dec \'24', 'iYield-A': 100, 'iYield-X1': 100, 'iYield-F': 100 },
  { month: 'Jan \'25', 'iYield-A': 102, 'iYield-X1': 103, 'iYield-F': 99 },
  { month: 'Feb \'25', 'iYield-A': 105, 'iYield-X1': 106, 'iYield-F': 97 },
  { month: 'Mar \'25', 'iYield-A': 108, 'iYield-X1': 109, 'iYield-F': 101 },
  { month: 'Apr \'25', 'iYield-A': 112, 'iYield-X1': 114, 'iYield-F': 103 }
];

const COLORS = ['#4CAF50', '#2196F3', '#FFC107'];

export default function Dashboard() {
  const router = useRouter();
  
  const navigateToManage = (vaultId: string) => {
    router.push(`/dashboard/${vaultId}`);
  };

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
      marginBottom: '1rem',
      textAlign: 'center' as 'center'
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
    portfolioOverview: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem'
    },
    overviewItem: {
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.375rem'
    },
    overviewLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    overviewValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    positiveValue: {
      color: '#10b981'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    chartContainer: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem'
    },
    chartTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    chartContent: {
      height: '300px'
    },
    pieChartLegend: {
      marginTop: '1rem',
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '0.5rem'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem'
    },
    legendColor: (color: string) => ({
      width: '1rem',
      height: '1rem',
      backgroundColor: color,
      borderRadius: '0.25rem'
    }),
    investmentsContainer: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    investmentsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    addVaultButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '0.875rem',
      fontWeight: 'medium'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as 'collapse'
    },
    tableHeader: {
      textAlign: 'left' as 'left',
      fontSize: '0.875rem',
      color: '#6b7280',
      fontWeight: 'medium',
      padding: '0.75rem 0.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    tableCell: {
      padding: '0.75rem 0.5rem',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '0.875rem'
    },
    manageButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    profitText: {
      color: '#10b981',
      fontWeight: 'medium'
    },
    annotationContainer: {
      marginTop: '2rem'
    },
    annotationTitle: {
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
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ margin: 0, color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          <h1 style={styles.title}>Your BitSafe Portfolio</h1>
        </header>
        
        {/* Portfolio Overview */}
        <div style={styles.portfolioOverview}>
          <div style={styles.overviewGrid}>
            <div style={styles.overviewItem}>
              <div style={styles.overviewLabel}>Total Investment</div>
              <div style={styles.overviewValue}>{portfolioData.totalInvestment}</div>
            </div>
            <div style={styles.overviewItem}>
              <div style={styles.overviewLabel}>Current Value</div>
              <div style={styles.overviewValue}>{portfolioData.currentValue}</div>
            </div>
            <div style={styles.overviewItem}>
              <div style={styles.overviewLabel}>Total Profit/Loss</div>
              <div style={{...styles.overviewValue, ...styles.positiveValue}}>{portfolioData.totalProfitLoss}</div>
            </div>
            <div style={styles.overviewItem}>
              <div style={styles.overviewLabel}>Weighted APY</div>
              <div style={styles.overviewValue}>{portfolioData.weightedAPY}</div>
            </div>
          </div>
        </div>
        
        {/* Portfolio Allocation & Performance History */}
        <div style={styles.gridContainer}>
          <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Portfolio Allocation</h2>
            <div style={styles.chartContent}>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.pieChartLegend}>
                {pieData.map((entry, index) => (
                  <div key={`legend-${index}`} style={styles.legendItem}>
                    <div style={styles.legendColor(COLORS[index % COLORS.length])}></div>
                    <span>{entry.name}: {entry.value} BTC ({entry.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Performance History</h2>
            <div style={styles.chartContent}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="iYield-A" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="iYield-X1" 
                    stroke="#2196F3" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="iYield-F" 
                    stroke="#FFC107" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Vault Investments */}
        <div style={styles.investmentsContainer}>
          <div style={styles.investmentsHeader}>
            <h2 style={styles.chartTitle}>Your Vault Investments</h2>
            <button 
              style={styles.addVaultButton}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Add New Vault
            </button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Vault</th>
                <th style={styles.tableHeader}>Invested</th>
                <th style={styles.tableHeader}>Current Value</th>
                <th style={styles.tableHeader}>Profit/Loss</th>
                <th style={styles.tableHeader}>APY</th>
                <th style={styles.tableHeader}>Lock-Up Status</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.investments.map((investment) => (
                <tr key={investment.id}>
                  <td style={styles.tableCell}>{investment.name} ({investment.provider})</td>
                  <td style={styles.tableCell}>{investment.invested}</td>
                  <td style={styles.tableCell}>{investment.currentValue}</td>
                  <td style={{...styles.tableCell, ...styles.profitText}}>{investment.profitLoss}</td>
                  <td style={styles.tableCell}>{investment.apy}</td>
                  <td style={styles.tableCell}>{investment.lockUpStatus}</td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.manageButton}
                      onClick={() => navigateToManage(investment.id)}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Annotations */}
        <div style={styles.annotationContainer}>
          <h3 style={styles.annotationTitle}>Annotations:</h3>
          <ol style={styles.annotationList}>
            <li style={styles.annotationItem}>"Manage" buttons navigate to the individual vault dashboard screens.</li>
            <li style={styles.annotationItem}>Portfolio Allocation chart shows visual breakdown of investments across vaults.</li>
            <li style={styles.annotationItem}>Performance History chart tracks value of each vault over time for comparison.</li>
            <li style={styles.annotationItem}>"Add New Vault" button navigates to the Vault Catalog to browse available vaults.</li>
            <li style={styles.annotationItem}>Vault table shows detailed metrics for each investment with current status.</li>
            <li style={styles.annotationItem}>Lock-Up Status shows progress toward completing the required hold period.</li>
            <li style={styles.annotationItem}>All data is aggregated from individual vault APIs via the SettleData interface.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
