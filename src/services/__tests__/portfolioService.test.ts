import { PortfolioService } from '../portfolioService';
import { NansenClient, NansenPortfolioDefiHoldings } from '../nansenClient';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let mockNansenClient: jest.Mocked<NansenClient>;

  beforeEach(() => {
    mockNansenClient = {
      getPortfolioDefiHoldings: jest.fn(),
      getPortfolioDefiHoldingsHistory: jest.fn(),
      getWalletCounterparties: jest.fn(),
      post: jest.fn(),
      get: jest.fn(),
    } as any;

    service = new PortfolioService(mockNansenClient);
  });

  describe('getStakingMetrics', () => {
    it('should extract staking metrics correctly', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 10000,
          total_assets_usd: 12000,
          total_debts_usd: 2000,
          total_rewards_usd: 500,
          token_count: 5,
          protocol_count: 2,
        },
        protocols: [
          {
            protocol_name: 'Lido',
            chain: 'ethereum',
            total_value_usd: 5000,
            total_assets_usd: 5000,
            total_debts_usd: 0,
            total_rewards_usd: 250,
            tokens: [
              {
                address: '0xStETH',
                symbol: 'stETH',
                amount: '2.5',
                value_usd: 5000,
                position_type: 'staking',
              },
            ],
          },
          {
            protocol_name: 'Aave',
            chain: 'ethereum',
            total_value_usd: 5000,
            total_assets_usd: 7000,
            total_debts_usd: 2000,
            total_rewards_usd: 250,
            tokens: [
              {
                address: '0xDAI',
                symbol: 'DAI',
                amount: '5000',
                value_usd: 5000,
                position_type: 'lending',
              },
            ],
          },
        ],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const stakingMetrics = await service.getStakingMetrics('0x1234');

      expect(stakingMetrics.totalStakingTvlUsd).toBe(5000);
      expect(stakingMetrics.totalRewardsUsd).toBe(250);
      expect(stakingMetrics.stakingProtocols.length).toBe(1);
      expect(stakingMetrics.stakingProtocols[0].protocolName).toBe('Lido');
      expect(mockNansenClient.getPortfolioDefiHoldings).toHaveBeenCalledWith('0x1234');
    });

    it('should include all protocols if no explicit staking position_type', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 5000,
          total_assets_usd: 5000,
          total_debts_usd: 0,
          total_rewards_usd: 250,
          token_count: 1,
          protocol_count: 1,
        },
        protocols: [
          {
            protocol_name: 'Ethereum Staking',
            chain: 'ethereum',
            total_value_usd: 5000,
            total_assets_usd: 5000,
            total_debts_usd: 0,
            total_rewards_usd: 250,
            tokens: [
              {
                address: '0xETH',
                symbol: 'ETH',
                amount: '2.5',
                value_usd: 5000,
              },
            ],
          },
        ],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const stakingMetrics = await service.getStakingMetrics('0x1234');

      expect(stakingMetrics.totalStakingTvlUsd).toBe(5000);
      expect(stakingMetrics.stakingProtocols.length).toBe(1);
      expect(stakingMetrics.message).toContain('Sustained staking days');
    });

    it('should handle empty protocols array', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 0,
          total_assets_usd: 0,
          total_debts_usd: 0,
          token_count: 0,
          protocol_count: 0,
        },
        protocols: [],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const stakingMetrics = await service.getStakingMetrics('0x1234');

      expect(stakingMetrics.totalStakingTvlUsd).toBe(0);
      expect(stakingMetrics.stakingProtocols.length).toBe(0);
    });
  });

  describe('getLendingMetrics', () => {
    it('should calculate borrower health score correctly', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 10000,
          total_assets_usd: 12000,
          total_debts_usd: 6000,
          token_count: 2,
          protocol_count: 1,
        },
        protocols: [
          {
            protocol_name: 'Aave',
            chain: 'ethereum',
            total_value_usd: 6000,
            total_assets_usd: 12000,
            total_debts_usd: 6000,
            tokens: [
              {
                address: '0xDAI',
                symbol: 'DAI',
                amount: '12000',
                value_usd: 12000,
              },
              {
                address: '0xUSDC',
                symbol: 'USDC',
                amount: '6000',
                value_usd: 6000,
              },
            ],
          },
        ],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const lendingMetrics = await service.getLendingMetrics('0x1234');

      // assets / debts = 12000 / 6000 = 2
      // normalized score = (2 / 2) * 100 = 100
      expect(lendingMetrics.borrowerHealthScore).toBe(100);
      expect(lendingMetrics.totalAssetsUsd).toBe(12000);
      expect(lendingMetrics.totalDebtsUsd).toBe(6000);
      expect(lendingMetrics.lendingProtocols.length).toBe(1);
    });

    it('should return perfect health score when debt is zero', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 5000,
          total_assets_usd: 5000,
          total_debts_usd: 0,
          token_count: 1,
          protocol_count: 1,
        },
        protocols: [
          {
            protocol_name: 'Aave',
            chain: 'ethereum',
            total_value_usd: 5000,
            total_assets_usd: 5000,
            total_debts_usd: 0,
            tokens: [
              {
                address: '0xDAI',
                symbol: 'DAI',
                amount: '5000',
                value_usd: 5000,
              },
            ],
          },
        ],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const lendingMetrics = await service.getLendingMetrics('0x1234');

      expect(lendingMetrics.borrowerHealthScore).toBe(100);
    });

    it('should return critical health score when assets are zero but debt exists', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 0,
          total_assets_usd: 0,
          total_debts_usd: 5000,
          token_count: 0,
          protocol_count: 0,
        },
        protocols: [],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const lendingMetrics = await service.getLendingMetrics('0x1234');

      expect(lendingMetrics.borrowerHealthScore).toBe(0);
    });

    it('should filter protocols with debt correctly', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 6000,
          total_assets_usd: 10000,
          total_debts_usd: 4000,
          token_count: 2,
          protocol_count: 2,
        },
        protocols: [
          {
            protocol_name: 'Aave',
            chain: 'ethereum',
            total_value_usd: 6000,
            total_assets_usd: 10000,
            total_debts_usd: 4000,
            tokens: [],
          },
          {
            protocol_name: 'Compound',
            chain: 'ethereum',
            total_value_usd: 0,
            total_assets_usd: 0,
            total_debts_usd: 0,
            tokens: [],
          },
        ],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const lendingMetrics = await service.getLendingMetrics('0x1234');

      expect(lendingMetrics.lendingProtocols.length).toBe(1);
      expect(lendingMetrics.lendingProtocols[0].protocolName).toBe('Aave');
    });
  });

  describe('getPortfolioMetrics', () => {
    it('should combine staking and lending metrics', async () => {
      const mockPortfolio: NansenPortfolioDefiHoldings = {
        summary: {
          total_value_usd: 10000,
          total_assets_usd: 12000,
          total_debts_usd: 2000,
          total_rewards_usd: 500,
          token_count: 5,
          protocol_count: 2,
        },
        protocols: [
          {
            protocol_name: 'Lido',
            chain: 'ethereum',
            total_value_usd: 5000,
            total_assets_usd: 5000,
            total_debts_usd: 0,
            total_rewards_usd: 250,
            tokens: [
              {
                address: '0xStETH',
                symbol: 'stETH',
                amount: '2.5',
                value_usd: 5000,
                position_type: 'staking',
              },
            ],
          },
          {
            protocol_name: 'Aave',
            chain: 'ethereum',
            total_value_usd: 5000,
            total_assets_usd: 7000,
            total_debts_usd: 2000,
            total_rewards_usd: 250,
            tokens: [
              {
                address: '0xDAI',
                symbol: 'DAI',
                amount: '7000',
                value_usd: 7000,
              },
            ],
          },
        ],
      };

      mockNansenClient.getPortfolioDefiHoldings.mockResolvedValue({
        data: mockPortfolio,
        status: 200,
      });

      const portfolioMetrics = await service.getPortfolioMetrics('0x1234');

      expect(portfolioMetrics.walletAddress).toBe('0x1234');
      expect(portfolioMetrics.staking).toBeDefined();
      expect(portfolioMetrics.lending).toBeDefined();
      expect(portfolioMetrics.timestamp).toBeDefined();
      expect(portfolioMetrics.staking.totalStakingTvlUsd).toBe(5000);
      expect(portfolioMetrics.lending.totalAssetsUsd).toBe(12000);
    });
  });

  describe('error handling', () => {
    it('should handle API errors in getStakingMetrics', async () => {
      mockNansenClient.getPortfolioDefiHoldings.mockRejectedValue(
        new Error('API Error: 401 Unauthorized')
      );

      await expect(service.getStakingMetrics('0x1234')).rejects.toThrow(
        'Failed to fetch staking metrics'
      );
    });

    it('should handle API errors in getLendingMetrics', async () => {
      mockNansenClient.getPortfolioDefiHoldings.mockRejectedValue(
        new Error('API Error: 500')
      );

      await expect(service.getLendingMetrics('0x1234')).rejects.toThrow(
        'Failed to fetch lending metrics'
      );
    });

    it('should handle API errors in getPortfolioMetrics', async () => {
      mockNansenClient.getPortfolioDefiHoldings.mockRejectedValue(
        new Error('API Error: Network error')
      );

      await expect(service.getPortfolioMetrics('0x1234')).rejects.toThrow(
        'Failed to fetch portfolio metrics'
      );
    });
  });
});

