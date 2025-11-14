import { NansenClient, NansenPortfolioDefiHoldings, NansenPortfolioProtocol } from './nansenClient';

export interface StakingMetrics {
  totalStakingTvlUsd: number;
  stakingProtocols: StakingProtocol[];
  totalRewardsUsd: number;
  message?: string;
}

export interface StakingProtocol {
  protocolName: string;
  chain: string;
  totalValueUsd: number;
  totalAssetsUsd: number;
  totalRewardsUsd?: number;
  tokenCount: number;
}

export interface LendingMetrics {
  borrowerHealthScore: number;
  totalAssetsUsd: number;
  totalDebtsUsd: number;
  lendingProtocols: LendingProtocol[];
  message?: string;
}

export interface LendingProtocol {
  protocolName: string;
  chain: string;
  totalValueUsd: number;
  totalAssetsUsd: number;
  totalDebtsUsd: number;
  debtRatio: number;
  healthFactor?: number;
  tokenCount: number;
}

export class PortfolioService {
  private nansenClient: NansenClient;

  constructor(nansenClient?: NansenClient) {
    this.nansenClient = nansenClient || new NansenClient();
  }

  /**
   * Extract staking metrics from portfolio DeFi holdings
   * Identifies staking positions and calculates total TVL and rewards
   */
  async getStakingMetrics(walletAddress: string): Promise<StakingMetrics> {
    try {
      const response = await this.nansenClient.getPortfolioDefiHoldings(walletAddress);
      const portfolio = response.data;

      const stakingProtocols: StakingProtocol[] = [];
      let totalStakingTvlUsd = 0;
      let totalRewardsUsd = 0;

      // Filter protocols for staking positions
      if (portfolio.protocols && Array.isArray(portfolio.protocols)) {
        for (const protocol of portfolio.protocols) {
          // Check if protocol has staking tokens (position_type === 'staking')
          const stakingTokens = protocol.tokens?.filter(token => token.position_type === 'staking') || [];
          
          if (stakingTokens.length > 0) {
            const protocolTvl = stakingTokens.reduce((sum, token) => sum + token.value_usd, 0);
            const rewards = protocol.total_rewards_usd || 0;

            stakingProtocols.push({
              protocolName: protocol.protocol_name,
              chain: protocol.chain,
              totalValueUsd: protocolTvl,
              totalAssetsUsd: protocol.total_assets_usd,
              totalRewardsUsd: rewards,
              tokenCount: stakingTokens.length,
            });

            totalStakingTvlUsd += protocolTvl;
            totalRewardsUsd += rewards;
          }
        }
      }

      // If no explicit staking positions found, include all protocols as potential staking
      // This is a fallback since the API may not always tag positions explicitly
      if (stakingProtocols.length === 0 && portfolio.protocols) {
        for (const protocol of portfolio.protocols) {
          stakingProtocols.push({
            protocolName: protocol.protocol_name,
            chain: protocol.chain,
            totalValueUsd: protocol.total_value_usd,
            totalAssetsUsd: protocol.total_assets_usd,
            totalRewardsUsd: protocol.total_rewards_usd || 0,
            tokenCount: protocol.tokens?.length || 0,
          });

          totalStakingTvlUsd += protocol.total_value_usd;
          totalRewardsUsd += protocol.total_rewards_usd || 0;
        }

        return {
          totalStakingTvlUsd,
          stakingProtocols,
          totalRewardsUsd,
          message: 'Note: Sustained staking days calculation requires historical tracking. Consider polling this endpoint periodically and storing snapshots to determine how many consecutive days staking has exceeded a threshold.',
        };
      }

      return {
        totalStakingTvlUsd,
        stakingProtocols,
        totalRewardsUsd,
        message: 'Note: Sustained staking days calculation requires historical tracking. Consider polling this endpoint periodically and storing snapshots to determine how many consecutive days staking has exceeded a threshold.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch staking metrics: ${errorMessage}`);
    }
  }

  /**
   * Extract lending metrics from portfolio DeFi holdings
   * Calculates borrower health score and identifies lending positions
   */
  async getLendingMetrics(walletAddress: string): Promise<LendingMetrics> {
    try {
      const response = await this.nansenClient.getPortfolioDefiHoldings(walletAddress);
      const portfolio = response.data;

      const lendingProtocols: LendingProtocol[] = [];
      let totalAssetsUsd = portfolio.summary?.total_assets_usd || 0;
      let totalDebtsUsd = portfolio.summary?.total_debts_usd || 0;

      // Filter protocols for lending positions
      if (portfolio.protocols && Array.isArray(portfolio.protocols)) {
        for (const protocol of portfolio.protocols) {
          if (protocol.total_debts_usd > 0 || protocol.total_assets_usd > 0) {
            const debtRatio = protocol.total_assets_usd > 0 
              ? protocol.total_debts_usd / protocol.total_assets_usd 
              : 0;

            lendingProtocols.push({
              protocolName: protocol.protocol_name,
              chain: protocol.chain,
              totalValueUsd: protocol.total_value_usd,
              totalAssetsUsd: protocol.total_assets_usd,
              totalDebtsUsd: protocol.total_debts_usd,
              debtRatio,
              tokenCount: protocol.tokens?.length || 0,
            });
          }
        }
      }

      // Calculate borrower health score
      // Health score = assets / debts (where health > 1.0 is good, < 1.0 is dangerous)
      // Normalized to 0-100 scale for easier interpretation
      const borrowerHealthScore = this.calculateHealthScore(totalAssetsUsd, totalDebtsUsd);

      return {
        borrowerHealthScore,
        totalAssetsUsd,
        totalDebtsUsd,
        lendingProtocols,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch lending metrics: ${errorMessage}`);
    }
  }

  /**
   * Calculate normalized borrower health score (0-100)
   * Score = min((assets / debts) * 50, 100) for visual interpretation
   * If debts are 0, score is 100 (perfect health)
   */
  private calculateHealthScore(totalAssetsUsd: number, totalDebtsUsd: number): number {
    if (totalDebtsUsd === 0) {
      return 100; // No debt = perfect health
    }

    if (totalAssetsUsd === 0) {
      return 0; // No assets but has debt = critical
    }

    const ratio = totalAssetsUsd / totalDebtsUsd;
    
    // Normalize: ratio >= 2 is excellent (score 100), ratio of 1 is borderline (score 50)
    // ratio < 1 is critical (score approaches 0)
    const normalizedScore = Math.min((ratio / 2) * 100, 100);
    
    return Math.max(Math.round(normalizedScore * 100) / 100, 0);
  }

  /**
   * Get combined portfolio metrics (staking + lending)
   */
  async getPortfolioMetrics(walletAddress: string) {
    try {
      const [stakingMetrics, lendingMetrics] = await Promise.all([
        this.getStakingMetrics(walletAddress),
        this.getLendingMetrics(walletAddress),
      ]);

      return {
        walletAddress,
        staking: stakingMetrics,
        lending: lendingMetrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch portfolio metrics: ${errorMessage}`);
    }
  }
}

