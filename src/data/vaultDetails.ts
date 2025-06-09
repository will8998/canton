import { LagoonVault } from './lagoonVaults';

export interface LagoonVaultDetail extends LagoonVault {
  strategy: string;
  prospectusUrl?: string;
  maxDrawdown?: string;
  performanceChart: PerformanceData[];
  managementFee?: string;
  performanceFee?: string;
  custodySolution?: string;
  insurance?: string;
  tvlLimit?: string;
  availableCapacity?: string;
  additionalInfo?: {
    minDeposit?: string;
    maxDeposit?: string;
    withdrawalNotice?: string;
    settlementCycle?: string;
    custodyDetails?: string;
    lockupPeriod?: string;
  };
  contractAddresses?: {
    administrator?: string;
    safe?: string;
    priceOracle?: string;
    whitelistManager?: string;
  };
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

export const lagoonVaultDetails: Record<string, LagoonVaultDetail> = {
  '0x936325050cb6cdf88e3ae9af80f83253c452d52e': {
    address: "0x936325050cb6cdf88e3ae9af80f83253c452d52e",
    chainId: 1,
    name: "Atitlan Bitcoin Multi-Strat Fund",
    logoUrl: "/lagoon-logo.svg",
    shortDescription: "Advanced DeFi yield strategies with institutional-grade risk management",
    description: "A sophisticated vault implementing multi-layered yield generation strategies across DeFi protocols. The vault employs dynamic allocation algorithms, automated rebalancing, and comprehensive risk management to optimize returns while maintaining capital preservation focus.",
    averageProcessing: "7 days",
    referralShare: "10%",
    assetManager: {
      name: "Lagoon Finance",
      url: "https://lagoon.finance"
    },
    asset: {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000", // Native ETH
      decimals: 18,
      chainId: 1,
      usdPrice: {
        value: "350000000000", // $3500 with 8 decimals
        decimals: 8,
        precision: 2
      }
    },
    points: [
      {
        name: "Lagoon Points",
        value: "1x",
        icon: "/lagoon-points.png"
      }
    ],
    additionalAprs: [
      {
        asset: "ETH",
        estimatedRewardApr: "5.2%",
        estimatedReward30dApr: "4.8%"
      }
    ],
    visible: true,
    
    // Risk and fee information (set by us)
    riskLevel: "Low",
    lockPeriod: "7 days",
    breakFee: "0.5%",
    minimumDeposit: "0.001 cbBTC",
    
    apr: 8.7,
    tvl: 1200000, // $1.2M
    totalAssets: "342857142857142857142", // ~343 ETH
    totalSupply: "340000000000000000000",
    pricePerShare: 1.008,
    paused: false,
    
    // Detailed information
    strategy: "Advanced multi-protocol yield optimization strategy utilizing automated market making, liquidity mining, lending protocols, and yield aggregation. The vault implements sophisticated risk management through diversified exposure across blue-chip DeFi protocols, dynamic rebalancing based on market conditions, and automated slippage protection. Smart contract risk is mitigated through protocol selection criteria and insurance coverage.",
    prospectusUrl: "https://docs.lagoon.finance",
    maxDrawdown: "2.8%",
    performanceChart: generatePerformanceData(100, 2.5), // Conservative volatility for DeFi
    managementFee: "2%",
    performanceFee: "25%",
    custodySolution: "Copper.co",
    insurance: "Insured up to $500M through Ledger Enterprise",
    tvlLimit: "2,500 BTC",
    availableCapacity: "892 BTC",
    additionalInfo: {
      minDeposit: "0.001 cbBTC",
      maxDeposit: "No limit",
      withdrawalNotice: "60 days",
      settlementCycle: "Daily rebalancing with weekly performance settlements",
      custodyDetails: "Multi-Party Computation (MPC)",
      lockupPeriod: "12-month lock-up period with 5% early withdrawal penalty"
    },
    contractAddresses: {
      administrator: "0x7052E9a96a1076022AaB55E2453BAa8463992FB2",
      safe: "0xd48549745e9a0E9dA6ABeA3a774ffc5EfBE49c2",
      priceOracle: "0xBbc705ba91da39B2250084ACD1F1F31795FfC7735",
      whitelistManager: "0x968D0Be20ec1fF7Ddf3D018553A75B885875C9b2"
    }
  }
}; 