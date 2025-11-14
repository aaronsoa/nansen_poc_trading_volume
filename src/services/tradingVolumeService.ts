import { NansenClient, NansenDexTrade } from './nansenClient';
import { TradingVolume, TradingVolumeSummary, TradingVolumeFilters } from '../models/tradingVolume';
import { filterDexTrades, filterTradingVolumes } from '../utils/filters';

export class TradingVolumeService {
  private nansenClient: NansenClient;

  constructor(nansenClient?: NansenClient) {
    this.nansenClient = nansenClient || new NansenClient();
  }

  /**
   * Convert Nansen counterparty data to TradingVolume model
   */
  private convertCounterpartyToVolume(
    walletAddress: string,
    counterparty: any,
    chain?: string
  ): TradingVolume[] {
    const volumes: TradingVolume[] = [];
    
    // Extract DEX/LP information from counterparty label
    const label = counterparty.counterparty_address_label?.[0] || '';
    let dex: string | undefined;
    let lpPool: string | undefined;
    
    // Try to identify DEX from label
    if (label.toLowerCase().includes('uniswap')) {
      dex = 'uniswap';
      if (label.includes('Liquidity Pool')) {
        lpPool = counterparty.counterparty_address;
      }
    } else if (label.toLowerCase().includes('sushiswap')) {
      dex = 'sushiswap';
    } else if (label.toLowerCase().includes('quickswap')) {
      dex = 'quickswap';
    } else if (label.toLowerCase().includes('stargate')) {
      dex = 'stargate';
    } else if (label.toLowerCase().includes('opensea')) {
      dex = 'opensea';
    } else if (label.toLowerCase().includes('aerodrome')) {
      dex = 'aerodrome';
      if (label.includes('Liquidity Pool') || label.includes('Pool')) {
        lpPool = counterparty.counterparty_address;
      }
    } else if (label.toLowerCase().includes('velodrome')) {
      dex = 'velodrome';
      if (label.includes('Liquidity Pool') || label.includes('Pool')) {
        lpPool = counterparty.counterparty_address;
      }
    }
    
    // Create volume entries for each token interaction
    if (counterparty.tokens_info && counterparty.tokens_info.length > 0) {
      counterparty.tokens_info.forEach((tokenInfo: any) => {
        // Distribute volume across token interactions
        const volumePerToken = counterparty.total_volume_usd / counterparty.tokens_info.length;
        
        volumes.push({
          walletAddress,
          totalVolume: volumePerToken,
          totalTransactions: parseInt(tokenInfo.num_transfer || '1', 10),
          baseCurrency: tokenInfo.token_symbol || tokenInfo.token_address,
          quoteCurrency: 'USD',
          chain: chain || 'ethereum',
          dex,
          lpPool,
          tokenAddress: tokenInfo.token_address,
          timestamp: new Date(), // Counterparties endpoint doesn't provide per-transaction timestamps
        });
      });
    } else {
      // If no token info, create a single entry
      volumes.push({
        walletAddress,
        totalVolume: counterparty.total_volume_usd || 0,
        totalTransactions: counterparty.interaction_count || 0,
        baseCurrency: 'Unknown',
        quoteCurrency: 'USD',
        chain: chain || 'ethereum',
        dex,
        lpPool,
        timestamp: new Date(),
      });
    }
    
    return volumes;
  }

  /**
   * Convert Nansen DEX trade to TradingVolume model (legacy)
   */
  private convertDexTradeToVolume(trade: NansenDexTrade): TradingVolume {
    const volume = parseFloat(trade.amount_in) || parseFloat(trade.amount_out) || 0;

    return {
      walletAddress: trade.wallet_address,
      totalVolume: volume,
      totalTransactions: 1,
      baseCurrency: trade.token_in,
      quoteCurrency: trade.token_out,
      chain: trade.chain,
      dex: trade.dex,
      lpPool: trade.lp_pool,
      tokenAddress: trade.token_in,
      timestamp: new Date(trade.timestamp),
    };
  }

  /**
   * Get trading volume for a specific wallet address
   */
  async getWalletTradingVolume(
    walletAddress: string,
    filters?: TradingVolumeFilters
  ): Promise<TradingVolumeSummary> {
    try {
      // Build query parameters for Nansen API counterparties endpoint
      const queryParams: any = {
        address: walletAddress,
        chain: filters?.chain || 'ethereum', // Default to ethereum if not specified
      };

      if (filters?.startDate) {
        queryParams.dateFrom = filters.startDate.toISOString();
      }

      if (filters?.endDate) {
        queryParams.dateTo = filters.endDate.toISOString();
      }

      // Fetch counterparties data from Nansen API
      const response = await this.nansenClient.getWalletCounterparties(queryParams);

      // Convert counterparties data to volumes
      const counterparties = response.data.data || [];
      let volumes: TradingVolume[] = [];

      counterparties.forEach((counterparty: any) => {
        const counterpartyVolumes = this.convertCounterpartyToVolume(
          walletAddress,
          counterparty,
          filters?.chain
        );
        volumes = volumes.concat(counterpartyVolumes);
      });

      // Apply filters if provided
      if (filters) {
        volumes = filterTradingVolumes(volumes, filters);
      }

      // Aggregate volumes
      return this.aggregateVolumes(walletAddress, volumes);
    } catch (error) {
      console.error('Error fetching trading volume:', error);
      throw new Error(`Failed to get trading volume for wallet ${walletAddress}: ${error}`);
    }
  }

  /**
   * Aggregate trading volumes into a summary
   */
  private aggregateVolumes(
    walletAddress: string,
    volumes: TradingVolume[]
  ): TradingVolumeSummary {
    const summary: TradingVolumeSummary = {
      walletAddress,
      totalVolume: 0,
      totalTransactions: volumes.length,
      volumeByChain: {},
      volumeByToken: {},
      volumeByDex: {},
      volumeByLp: {},
      transactions: volumes,
    };

    volumes.forEach((volume) => {
      // Sum total volume
      summary.totalVolume += volume.totalVolume;

      // Aggregate by chain
      if (volume.chain) {
        summary.volumeByChain[volume.chain] = 
          (summary.volumeByChain[volume.chain] || 0) + volume.totalVolume;
      }

      // Aggregate by token
      if (volume.tokenAddress) {
        summary.volumeByToken[volume.tokenAddress] = 
          (summary.volumeByToken[volume.tokenAddress] || 0) + volume.totalVolume;
      }

      // Aggregate by DEX
      if (volume.dex) {
        summary.volumeByDex[volume.dex] = 
          (summary.volumeByDex[volume.dex] || 0) + volume.totalVolume;
      }

      // Aggregate by LP pool
      if (volume.lpPool) {
        summary.volumeByLp[volume.lpPool] = 
          (summary.volumeByLp[volume.lpPool] || 0) + volume.totalVolume;
      }
    });

    return summary;
  }

  /**
   * Get trading volume with filters applied
   */
  async getTradingVolumeWithFilters(
    walletAddress: string,
    filters: TradingVolumeFilters
  ): Promise<TradingVolumeSummary> {
    // First get all volumes
    const summary = await this.getWalletTradingVolume(walletAddress);

    // Apply filters to transactions
    const filteredTransactions = filterTradingVolumes(summary.transactions, filters);

    // Re-aggregate with filtered transactions
    return this.aggregateVolumes(walletAddress, filteredTransactions);
  }
}

