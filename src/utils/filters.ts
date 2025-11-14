import { TradingVolume, TradingVolumeFilters } from '../models/tradingVolume';
import { NansenDexTrade } from '../services/nansenClient';

/**
 * Filter trading volumes based on provided criteria
 */
export function filterTradingVolumes(
  volumes: TradingVolume[],
  filters: TradingVolumeFilters
): TradingVolume[] {
  return volumes.filter((volume) => {
    // Filter by token address
    if (filters.tokenAddress && volume.tokenAddress) {
      if (volume.tokenAddress.toLowerCase() !== filters.tokenAddress.toLowerCase()) {
        return false;
      }
    }

    // Filter by chain
    if (filters.chain && volume.chain) {
      if (volume.chain.toLowerCase() !== filters.chain.toLowerCase()) {
        return false;
      }
    }

    // Filter by DEX
    if (filters.dex && volume.dex) {
      if (volume.dex.toLowerCase() !== filters.dex.toLowerCase()) {
        return false;
      }
    }

    // Filter by LP pool
    if (filters.lpPool && volume.lpPool) {
      if (volume.lpPool.toLowerCase() !== filters.lpPool.toLowerCase()) {
        return false;
      }
    }

    // Filter by date range
    if (filters.startDate && volume.timestamp < filters.startDate) {
      return false;
    }

    if (filters.endDate && volume.timestamp > filters.endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Filter Nansen DEX trades based on provided criteria
 */
export function filterDexTrades(
  trades: NansenDexTrade[],
  filters: TradingVolumeFilters
): NansenDexTrade[] {
  return trades.filter((trade) => {
    // Filter by token address (check both token_in and token_out)
    if (filters.tokenAddress) {
      const tokenLower = filters.tokenAddress.toLowerCase();
      const matchesTokenIn = trade.token_in.toLowerCase() === tokenLower;
      const matchesTokenOut = trade.token_out.toLowerCase() === tokenLower;
      if (!matchesTokenIn && !matchesTokenOut) {
        return false;
      }
    }

    // Filter by chain
    if (filters.chain && trade.chain) {
      if (trade.chain.toLowerCase() !== filters.chain.toLowerCase()) {
        return false;
      }
    }

    // Filter by DEX
    if (filters.dex && trade.dex) {
      if (trade.dex.toLowerCase() !== filters.dex.toLowerCase()) {
        return false;
      }
    }

    // Filter by LP pool
    if (filters.lpPool && trade.lp_pool) {
      if (trade.lp_pool.toLowerCase() !== filters.lpPool.toLowerCase()) {
        return false;
      }
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      const tradeDate = new Date(trade.timestamp);
      if (filters.startDate && tradeDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && tradeDate > filters.endDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Check if a filter is active (has a value)
 */
export function hasActiveFilters(filters: TradingVolumeFilters): boolean {
  return !!(
    filters.tokenAddress ||
    filters.chain ||
    filters.dex ||
    filters.lpPool ||
    filters.startDate ||
    filters.endDate
  );
}

