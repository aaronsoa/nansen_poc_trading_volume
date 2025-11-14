export interface HyperliquidPosition {
  address: string;
  tokenSymbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  pnl: number;
  pnlPercentage: number;
  liquidationPrice?: number;
  marginUsed: number;
  timestamp: Date;
}

export interface HyperliquidTrade {
  address: string;
  tokenSymbol: string;
  side: 'long' | 'short' | 'buy' | 'sell';
  size: number;
  price: number;
  fee: number;
  pnl?: number;
  timestamp: Date;
  txHash?: string;
}

export interface HyperliquidPositionSummary {
  address: string;
  totalPositions: number;
  totalPnl: number;
  totalPnlPercentage: number;
  totalMarginUsed: number;
  positions: HyperliquidPosition[];
  positionsByToken: Record<string, HyperliquidPosition[]>;
  longPositions: number;
  shortPositions: number;
}

export interface HyperliquidTradeSummary {
  address: string;
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
  totalPnl: number;
  trades: HyperliquidTrade[];
  tradesByToken: Record<string, HyperliquidTrade[]>;
  winRate?: number;
}

export interface HyperliquidFilters {
  tokenSymbol?: string;
  side?: 'long' | 'short';
  minPnl?: number;
  maxPnl?: number;
  startDate?: Date;
  endDate?: Date;
}

