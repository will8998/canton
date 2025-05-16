import { Vault } from './vaults';

export interface VaultDetail extends Vault {
  strategy: string;
  prospectusUrl: string;
  targetAPY: string;
  maxDrawdown: string;
  btcCorrelation: string;
  performanceChart: PerformanceData[];
  managementFee: string;
  performanceFee: string;
  earlyRedemptionFee: string;
  custodySolution: string;
  insurance: string;
  noticePeriod: string;
  tvlLimit: string;
  lockUpDetail: string;
}

export interface PerformanceData {
  month: string;
  vaultValue: number;
  btcPrice: number;
}

// Mock performance data for charts
const generatePerformanceData = (baseValue: number, volatility: number, months: number = 6): PerformanceData[] => {
  const data: PerformanceData[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  let vaultValue = baseValue;
  let btcPrice = 50000;
  
  for (let i = 0; i < months; i++) {
    const monthIndex = (currentDate.getMonth() - months + i + 12) % 12;
    
    // Add some randomness but ensure growth trend for vault
    vaultValue = vaultValue * (1 + (Math.random() * volatility - volatility/3) / 100);
    
    // BTC price fluctuates more
    btcPrice = btcPrice * (1 + (Math.random() * volatility*1.5 - volatility*0.75) / 100);
    
    data.push({
      month: monthNames[monthIndex],
      vaultValue: parseFloat(vaultValue.toFixed(2)),
      btcPrice: parseFloat((btcPrice / 1000).toFixed(2)) // Scaled for visualization
    });
  }
  
  return data;
};

export const vaultDetails: Record<string, VaultDetail> = {
  'iyield-a': {
    id: 'iyield-a',
    name: 'iYield-A: Atitlan Bitcoin Multi-Strat Fund',
    provider: 'Atitlan',
    targetAPY: '12%+',
    riskLevel: 'Low',
    lockPeriod: '6 months',
    breakFee: '3%',
    minimumBTC: '10 BTC',
    strategy: 'Diversified market-neutral strategies: arbitrage, HFT, options, long/short, momentum',
    prospectusUrl: '/prospectus/atitlan.pdf',
    maxDrawdown: '2%',
    btcCorrelation: '0.1',
    performanceChart: generatePerformanceData(100, 2), // Low volatility
    managementFee: '1.5% (Early Bird)',
    performanceFee: '15%',
    earlyRedemptionFee: '3%',
    custodySolution: 'Komainu and Zodia Custody',
    insurance: 'FCA-registered, insured cold storage',
    noticePeriod: '30 days',
    tvlLimit: '10-20%',
    lockUpDetail: '6-month soft lock-up with 3% penalty'
  },
  'iyield-x1': {
    id: 'iyield-x1',
    name: 'iYield-X1: XBTO Bitcoin Arbitrage Fund',
    provider: 'XBTO',
    targetAPY: '14%+',
    riskLevel: 'Medium',
    lockPeriod: '9 months',
    breakFee: '4%',
    minimumBTC: '15 BTC',
    strategy: 'Bitcoin arbitrage focused on exchange inefficiencies, cash & carry trades, funding rate capture',
    prospectusUrl: '/prospectus/xbto-arbitrage.pdf',
    maxDrawdown: '3.5%',
    btcCorrelation: '0.25',
    performanceChart: generatePerformanceData(100, 3.5), // Medium volatility
    managementFee: '2%',
    performanceFee: '20%',
    earlyRedemptionFee: '4%',
    custodySolution: 'Fireblocks Multi-Sig',
    insurance: 'Crime insurance up to $100M',
    noticePeriod: '45 days',
    tvlLimit: '15-25%',
    lockUpDetail: '9-month soft lock-up with 4% penalty'
  },
  'iyield-x2': {
    id: 'iyield-x2',
    name: 'iYield-X2: XBTO Bitcoin Options Strategy',
    provider: 'XBTO',
    targetAPY: '16%+',
    riskLevel: 'Medium-High',
    lockPeriod: '12 months',
    breakFee: '5%',
    minimumBTC: '20 BTC',
    strategy: 'Options-based yield generation utilizing covered calls, puts, straddles and advanced volatility strategies',
    prospectusUrl: '/prospectus/xbto-options.pdf',
    maxDrawdown: '5%',
    btcCorrelation: '0.4',
    performanceChart: generatePerformanceData(100, 5), // Higher volatility
    managementFee: '2%',
    performanceFee: '25%',
    earlyRedemptionFee: '5%',
    custodySolution: 'Copper.co with MPC technology',
    insurance: 'Insured up to $500M per incident',
    noticePeriod: '60 days',
    tvlLimit: '20-30%',
    lockUpDetail: '12-month soft lock-up with 5% penalty'
  },
  'iyield-f': {
    id: 'iyield-f',
    name: 'iYield-F: Forteus Bitcoin Yield Fund',
    provider: 'Forteus',
    targetAPY: '10%+',
    riskLevel: 'Medium-Low',
    lockPeriod: '3 months',
    breakFee: '2%',
    minimumBTC: '5 BTC',
    strategy: 'Conservative yield strategies: lending, staking, basis trading with focus on capital preservation',
    prospectusUrl: '/prospectus/forteus.pdf',
    maxDrawdown: '1%',
    btcCorrelation: '0.15',
    performanceChart: generatePerformanceData(100, 1.5), // Lower volatility
    managementFee: '1%',
    performanceFee: '10%',
    earlyRedemptionFee: '2%',
    custodySolution: 'BitGo Multi-Sig',
    insurance: "Lloyd's of London policy up to $100M",
    noticePeriod: '15 days',
    tvlLimit: '5-15%',
    lockUpDetail: '3-month soft lock-up with 2% penalty'
  }
}; 