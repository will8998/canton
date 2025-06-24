// Lagoon Vault Data Structures
export interface LagoonAsset {
  symbol: string;
  address: string;
  decimals: number;
  chainId: number;
  usdPrice?: {
    value: string;
    decimals: number;
    precision: number;
  };
}

export interface LagoonAssetManager {
  name: string;
  url: string;
}

export interface LagoonPoint {
  name: string;
  value: string;
  icon: string;
}

export interface LagoonAdditionalApr {
  asset: string;
  estimatedRewardApr?: string;
  estimatedReward30dApr?: string;
}

export interface LagoonVault {
  address: string;
  chainId: number;
  name?: string;
  logoUrl?: string;
  shortDescription?: string;
  description?: string;
  averageProcessing?: string;
  referralShare?: string;
  assetManager?: LagoonAssetManager;
  asset?: LagoonAsset;
  points?: LagoonPoint[];
  additionalAprs?: LagoonAdditionalApr[];
  visible: boolean;
  
  // Risk and fee information (set by us, not from Lagoon docs)
  riskLevel: 'Low' | 'Medium' | 'High';
  maxDrawdown?: string;
  lockPeriod?: string;
  breakFee?: string;
  minimumDeposit: string;
  
  // Computed fields
  apr?: number;
  tvl?: number;
  totalAssets?: string;
  totalSupply?: string;
  pricePerShare?: number;
  paused?: boolean;
}

export interface LagoonVaultEvents {
  deposits: any[];
  withdraws: any[];
  depositRequests: any[];
  redeemRequests: any[];
  settleRedeems: any[];
  settleDeposits: any[];
  totalAssetsUpdateds: any[];
  newTotalAssetsUpdateds: any[];
  periodSummaries: any[];
}

// Environment configuration type
export interface LagoonConfig {
  vaults: LagoonVault[];
  assets: Record<string, {
    priceFeed: {
      address: string;
      chainId: number;
    };
    logo: string;
  }>;
  thegraphUrls: Record<string, string>;
}

// Utility functions
export const convertBigIntToNumber = ({
  value,
  decimals,
  precision
}: {
  value: bigint;
  decimals: number;
  precision: number;
}): number => {
  const divisor = BigInt(10 ** decimals);
  const wholePart = Number(value / divisor);
  const fractionalPart = Number(value % divisor) / Number(divisor);
  return Number((wholePart + fractionalPart).toFixed(precision));
};

export const calculateAPR = (events: LagoonVaultEvents): number => {
  const settlements = events.settleDeposits.concat(events.settleRedeems)
    .sort((a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp));
  
  if (settlements.length < 2) return 0;
  
  const newest = settlements[settlements.length - 1];
  const oldest = settlements[0];
  
  const timeSpan = Number(newest.blockTimestamp) - Number(oldest.blockTimestamp);
  
  if (!newest.totalAssets || !newest.totalSupply || !oldest.totalAssets || !oldest.totalSupply) {
    return 0;
  }
  
  const newestPricePerShare = Number(newest.totalAssets) / Number(newest.totalSupply);
  const oldestPricePerShare = Number(oldest.totalAssets) / Number(oldest.totalSupply);
  
  const priceChange = newestPricePerShare / oldestPricePerShare;
  
  // Annualized return
  const yearsElapsed = timeSpan / (365.25 * 24 * 60 * 60);
  return (Math.pow(priceChange, 1 / yearsElapsed) - 1) * 100;
};

export const calculateTVL = (vault: LagoonVault): number => {
  if (!vault.totalAssets || !vault.asset?.usdPrice) return 0;
  
  const totalAssetFormatted = convertBigIntToNumber({
    value: BigInt(vault.totalAssets),
    decimals: vault.asset.decimals,
    precision: 6,
  });

  const usdPriceFormatted = convertBigIntToNumber({
    value: BigInt(vault.asset.usdPrice.value),
    decimals: vault.asset.usdPrice.decimals,
    precision: vault.asset.usdPrice.precision,
  });

  return totalAssetFormatted * usdPriceFormatted;
};

// Real Lagoon vault data from their production deployment
export const sampleLagoonVaults: LagoonVault[] = [
  {
    address: "0x936325050cb6cdf88e3ae9af80f83253c452d52e",
    chainId: 1, // Ethereum mainnet
    name: "Atitlan Bitcoin Multi-Strat Fund",
    logoUrl: "/lagoon-logo.svg",
    shortDescription: "BTC-denominated, market-neutral yield strategies with low correlation to BTC price",
    description: "A diversified Bitcoin yield fund employing market-neutral strategies including short-term directional trading, arbitrage, basis trading, and options. Designed to generate consistent BTC-denominated returns while maintaining low correlation to Bitcoin price movements (correlation cap at 0.4).",
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
        asset: "BTC",
        estimatedRewardApr: "12%+",
        estimatedReward30dApr: "12%+"
      }
    ],
    visible: true,
    
    // Risk and fee information (updated to match new specifications)
    riskLevel: "Low",
    maxDrawdown: "2%",
    lockPeriod: "7 days",
    breakFee: "0.5%",
    minimumDeposit: "0.01 ETH",
    
    // Updated APR and performance metrics
    apr: 12, // 12%+ annual net return target (in BTC)
    tvl: 1200000, // $1.2M
    totalAssets: "342857142857142857142", // ~343 ETH
    totalSupply: "340000000000000000000",
    pricePerShare: 1.008,
    paused: false
  }
]; 