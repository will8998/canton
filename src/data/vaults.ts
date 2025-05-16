export interface Vault {
  id: string;
  name: string;
  provider: string;
  targetAPY: string;
  riskLevel: 'Low' | 'Medium-Low' | 'Medium' | 'Medium-High' | 'High';
  lockPeriod: string;
  breakFee: string;
  minimumBTC: string;
}

export const vaults: Vault[] = [
  {
    id: 'iyield-x2',
    name: 'iYield-X2: XBTO Bitcoin Options Strategy',
    provider: 'XBTO',
    targetAPY: '16%',
    riskLevel: 'Medium-High',
    lockPeriod: '12 months',
    breakFee: '5%',
    minimumBTC: '20 BTC',
  },
  {
    id: 'iyield-x1',
    name: 'iYield-X1: XBTO Bitcoin Arbitrage Fund',
    provider: 'XBTO',
    targetAPY: '14%',
    riskLevel: 'Medium',
    lockPeriod: '9 months',
    breakFee: '4%',
    minimumBTC: '15 BTC',
  },
  {
    id: 'iyield-a',
    name: 'iYield-A: Atitlan Bitcoin Multi-Strat Fund',
    provider: 'Atitlan',
    targetAPY: '12%',
    riskLevel: 'Low',
    lockPeriod: '6 months',
    breakFee: '3%',
    minimumBTC: '10 BTC',
  },
  {
    id: 'iyield-f',
    name: 'iYield-F: Forteus Bitcoin Yield Fund',
    provider: 'Forteus',
    targetAPY: '10%',
    riskLevel: 'Medium-Low',
    lockPeriod: '3 months',
    breakFee: '2%',
    minimumBTC: '5 BTC',
  },
]; 