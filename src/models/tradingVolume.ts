export interface TradingVolume {
  walletAddress: string;
  totalVolume: number;
  totalTransactions: number;
  baseCurrency: string;
  quoteCurrency: string;
  chain?: string;
  dex?: string;
  lpPool?: string;
  tokenAddress?: string;
  timestamp: Date;
}

export interface TradingVolumeSummary {
  walletAddress: string;
  totalVolume: number;
  totalTransactions: number;
  volumeByChain: Record<string, number>;
  volumeByToken: Record<string, number>;
  volumeByDex: Record<string, number>;
  volumeByLp: Record<string, number>;
  transactions: TradingVolume[];
}

export interface TradingVolumeFilters {
  tokenAddress?: string;
  chain?: string;
  lpPool?: string;
  dex?: string;
  startDate?: Date;
  endDate?: Date;
}

