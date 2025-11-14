import { NansenClient } from './nansenClient';
import {
  HyperliquidPosition,
  HyperliquidTrade,
  HyperliquidPositionSummary,
  HyperliquidTradeSummary,
  HyperliquidFilters,
} from '../models/hyperliquid';

export class HyperliquidService {
  private nansenClient: NansenClient;

  constructor(nansenClient?: NansenClient) {
    this.nansenClient = nansenClient || new NansenClient();
  }

  /**
   * Get perpetual positions for a wallet address
   */
  async getWalletPerpPositions(
    address: string,
    filters?: HyperliquidFilters
  ): Promise<HyperliquidPositionSummary> {
    try {
      const response = await this.nansenClient.getHyperliquidPositions({
        address,
      });

      // Handle different response structures
      const responseData = response.data.data || response.data;
      const positionsData = responseData.asset_positions || [];
      
      // Convert API response to HyperliquidPosition models
      let positions: HyperliquidPosition[] = positionsData.map((pos: any) => ({
        address,
        tokenSymbol: pos.token_symbol || pos.token || pos.symbol,
        side: pos.side?.toLowerCase() === 'long' ? 'long' : 'short',
        size: parseFloat(pos.size || pos.position_size || '0'),
        entryPrice: parseFloat(pos.entry_price || pos.avg_entry_price || '0'),
        markPrice: parseFloat(pos.mark_price || pos.current_price || '0'),
        leverage: parseFloat(pos.leverage || '1'),
        pnl: parseFloat(pos.unrealized_pnl || pos.pnl || '0'),
        pnlPercentage: parseFloat(pos.unrealized_pnl_percentage || pos.pnl_percentage || '0'),
        liquidationPrice: pos.liquidation_price ? parseFloat(pos.liquidation_price) : undefined,
        marginUsed: parseFloat(pos.margin_used || pos.margin || '0'),
        timestamp: new Date(pos.timestamp || pos.updated_at || Date.now()),
      }));

      // Apply filters
      if (filters) {
        positions = this.filterPositions(positions, filters);
      }

      return this.aggregatePositions(address, positions);
    } catch (error) {
      console.error('Error fetching Hyperliquid positions:', error);
      throw new Error(`Failed to get Hyperliquid positions for ${address}: ${error}`);
    }
  }

  /**
   * Get perpetual trade history for a wallet address
   */
  async getWalletPerpTrades(
    address: string,
    filters?: HyperliquidFilters
  ): Promise<HyperliquidTradeSummary> {
    try {
      const params: any = {
        address,
      };

      if (filters?.startDate) {
        params.dateFrom = filters.startDate.toISOString();
      }
      if (filters?.endDate) {
        params.dateTo = filters.endDate.toISOString();
      }

      const response = await this.nansenClient.getHyperliquidTrades(params);

      const tradesData = response.data.data || [];
      
      // Convert API response to HyperliquidTrade models
      let trades: HyperliquidTrade[] = tradesData.map((trade: any) => ({
        address,
        tokenSymbol: trade.token_symbol || trade.token || trade.symbol,
        side: (trade.side?.toLowerCase() || trade.action?.toLowerCase() || 'buy') as 'long' | 'short' | 'buy' | 'sell',
        size: parseFloat(trade.size || trade.token_amount || trade.amount || '0'),
        price: parseFloat(trade.price || trade.price_usd || '0'),
        fee: parseFloat(trade.fee || trade.fee_usd || '0'),
        pnl: trade.pnl ? parseFloat(trade.pnl) : undefined,
        timestamp: new Date(trade.timestamp || trade.time || Date.now()),
        txHash: trade.tx_hash || trade.transaction_hash,
      }));

      // Apply filters
      if (filters) {
        trades = this.filterTrades(trades, filters);
      }

      return this.aggregateTrades(address, trades);
    } catch (error) {
      console.error('Error fetching Hyperliquid trades:', error);
      throw new Error(`Failed to get Hyperliquid trades for ${address}: ${error}`);
    }
  }

  /**
   * Filter positions based on criteria
   */
  private filterPositions(
    positions: HyperliquidPosition[],
    filters: HyperliquidFilters
  ): HyperliquidPosition[] {
    return positions.filter((pos) => {
      if (filters.tokenSymbol && pos.tokenSymbol.toLowerCase() !== filters.tokenSymbol.toLowerCase()) {
        return false;
      }
      if (filters.side && pos.side !== filters.side) {
        return false;
      }
      if (filters.minPnl !== undefined && pos.pnl < filters.minPnl) {
        return false;
      }
      if (filters.maxPnl !== undefined && pos.pnl > filters.maxPnl) {
        return false;
      }
      return true;
    });
  }

  /**
   * Filter trades based on criteria
   */
  private filterTrades(
    trades: HyperliquidTrade[],
    filters: HyperliquidFilters
  ): HyperliquidTrade[] {
    return trades.filter((trade) => {
      if (filters.tokenSymbol && trade.tokenSymbol.toLowerCase() !== filters.tokenSymbol.toLowerCase()) {
        return false;
      }
      if (filters.side && trade.side !== filters.side) {
        return false;
      }
      if (filters.startDate && trade.timestamp < filters.startDate) {
        return false;
      }
      if (filters.endDate && trade.timestamp > filters.endDate) {
        return false;
      }
      return true;
    });
  }

  /**
   * Aggregate positions into summary
   */
  private aggregatePositions(
    address: string,
    positions: HyperliquidPosition[]
  ): HyperliquidPositionSummary {
    const summary: HyperliquidPositionSummary = {
      address,
      totalPositions: positions.length,
      totalPnl: 0,
      totalPnlPercentage: 0,
      totalMarginUsed: 0,
      positions,
      positionsByToken: {},
      longPositions: 0,
      shortPositions: 0,
    };

    positions.forEach((pos) => {
      summary.totalPnl += pos.pnl;
      summary.totalMarginUsed += pos.marginUsed;

      if (pos.side === 'long') {
        summary.longPositions++;
      } else {
        summary.shortPositions++;
      }

      // Group by token
      if (!summary.positionsByToken[pos.tokenSymbol]) {
        summary.positionsByToken[pos.tokenSymbol] = [];
      }
      summary.positionsByToken[pos.tokenSymbol].push(pos);
    });

    // Calculate average PnL percentage
    if (positions.length > 0) {
      summary.totalPnlPercentage = positions.reduce((sum, pos) => sum + pos.pnlPercentage, 0) / positions.length;
    }

    return summary;
  }

  /**
   * Aggregate trades into summary
   */
  private aggregateTrades(
    address: string,
    trades: HyperliquidTrade[]
  ): HyperliquidTradeSummary {
    const summary: HyperliquidTradeSummary = {
      address,
      totalTrades: trades.length,
      totalVolume: 0,
      totalFees: 0,
      totalPnl: 0,
      trades,
      tradesByToken: {},
    };

    let winningTrades = 0;

    trades.forEach((trade) => {
      summary.totalVolume += trade.size * trade.price;
      summary.totalFees += trade.fee;
      
      if (trade.pnl !== undefined) {
        summary.totalPnl += trade.pnl;
        if (trade.pnl > 0) winningTrades++;
      }

      // Group by token
      if (!summary.tradesByToken[trade.tokenSymbol]) {
        summary.tradesByToken[trade.tokenSymbol] = [];
      }
      summary.tradesByToken[trade.tokenSymbol].push(trade);
    });

    // Calculate win rate
    const tradesWithPnl = trades.filter(t => t.pnl !== undefined).length;
    if (tradesWithPnl > 0) {
      summary.winRate = (winningTrades / tradesWithPnl) * 100;
    }

    return summary;
  }
}

