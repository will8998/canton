export interface Vault {
  id: string;
  name: string;
  provider: string;
  targetAPY: string;
  lockPeriod: string;
  breakFee: string;
  minimumBTC: string;
  geography: 'US' | 'Non-US';
  riskLevel: 'Low' | 'Medium-Low' | 'Medium' | 'Medium-High' | 'High';
}

export const vaults: Vault[] = [
  {
    id: 'iyield-x2',
    name: 'iYield-X2: XBTO Bitcoin Options Strategy',
    provider: 'XBTO',
    targetAPY: '16%',
    lockPeriod: '12 months',
    breakFee: '5%',
    minimumBTC: '20 BTC',
    geography: 'Non-US',
    riskLevel: 'Medium-High'
  },
  {
    id: 'iyield-x1',
    name: 'iYield-X1: XBTO Bitcoin Arbitrage Fund',
    provider: 'XBTO',
    targetAPY: '14%',
    lockPeriod: '9 months',
    breakFee: '4%',
    minimumBTC: '15 BTC',
    geography: 'Non-US',
    riskLevel: 'Medium'
  },
  {
    id: 'iyield-a',
    name: 'iYield-A: Atitlan Bitcoin Multi-Strat Fund',
    provider: 'Atitlan',
    targetAPY: '12%',
    lockPeriod: '6 months',
    breakFee: '3%',
    minimumBTC: '10 BTC',
    geography: 'US',
    riskLevel: 'Low'
  },
  {
    id: 'iyield-f',
    name: 'iYield-F: Forteus Bitcoin Yield Fund',
    provider: 'Forteus',
    targetAPY: '10%',
    lockPeriod: '3 months',
    breakFee: '2%',
    minimumBTC: '5 BTC',
    geography: 'US',
    riskLevel: 'Medium-Low'
  }
]; 