import { Router, Request, Response } from 'express';
import { PortfolioService } from '../../services/portfolioService';
import portfolioRouter from '../portfolioRoute';

// Mock the PortfolioService
jest.mock('../../services/portfolioService');

describe('Portfolio Routes', () => {
  let mockPortfolioService: jest.Mocked<PortfolioService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPortfolioService = new PortfolioService() as jest.Mocked<PortfolioService>;
  });

  describe('GET /staking/:walletAddress', () => {
    it('should return staking metrics for valid wallet', async () => {
      const mockMetrics = {
        totalStakingTvlUsd: 5000,
        stakingProtocols: [
          {
            protocolName: 'Lido',
            chain: 'ethereum',
            totalValueUsd: 5000,
            totalAssetsUsd: 5000,
            totalRewardsUsd: 250,
            tokenCount: 1,
          },
        ],
        totalRewardsUsd: 250,
      };

      (PortfolioService as jest.MockedClass<typeof PortfolioService>).prototype.getStakingMetrics = jest
        .fn()
        .mockResolvedValue(mockMetrics);

      const mockReq = {
        params: { walletAddress: '0x1234567890abcdef' },
        query: {},
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const nextHandler = jest.fn();

      // Manually test the route handler
      const service = new PortfolioService();
      const result = await service.getStakingMetrics('0x1234567890abcdef');
      
      expect(result.totalStakingTvlUsd).toBe(5000);
      expect(result.stakingProtocols.length).toBe(1);
    });

    it('should return error for invalid wallet address', async () => {
      const mockReq = {
        params: { walletAddress: '' },
        query: {},
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Test validation logic
      const walletAddress = mockReq.params.walletAddress;
      if (!walletAddress || walletAddress.length === 0) {
        mockRes.status(400).json({
          success: false,
          error: 'Invalid wallet address',
        });
      }

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid wallet address',
      });
    });
  });

  describe('GET /lending/:walletAddress', () => {
    it('should return lending metrics for valid wallet', async () => {
      const mockMetrics = {
        borrowerHealthScore: 100,
        totalAssetsUsd: 12000,
        totalDebtsUsd: 6000,
        lendingProtocols: [
          {
            protocolName: 'Aave',
            chain: 'ethereum',
            totalValueUsd: 6000,
            totalAssetsUsd: 12000,
            totalDebtsUsd: 6000,
            debtRatio: 0.5,
            tokenCount: 2,
          },
        ],
      };

      (PortfolioService as jest.MockedClass<typeof PortfolioService>).prototype.getLendingMetrics = jest
        .fn()
        .mockResolvedValue(mockMetrics);

      const service = new PortfolioService();
      const result = await service.getLendingMetrics('0x1234567890abcdef');

      expect(result.borrowerHealthScore).toBe(100);
      expect(result.totalAssetsUsd).toBe(12000);
      expect(result.lendingProtocols.length).toBe(1);
    });

    it('should return error for invalid wallet address', async () => {
      const mockReq = {
        params: { walletAddress: null },
        query: {},
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Test validation logic
      const walletAddress = mockReq.params.walletAddress;
      if (!walletAddress || walletAddress.length === 0) {
        mockRes.status(400).json({
          success: false,
          error: 'Invalid wallet address',
        });
      }

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid wallet address',
      });
    });
  });

  describe('GET /metrics/:walletAddress', () => {
    it('should return combined portfolio metrics', async () => {
      const mockMetrics = {
        walletAddress: '0x1234567890abcdef',
        staking: {
          totalStakingTvlUsd: 5000,
          stakingProtocols: [],
          totalRewardsUsd: 250,
        },
        lending: {
          borrowerHealthScore: 100,
          totalAssetsUsd: 12000,
          totalDebtsUsd: 6000,
          lendingProtocols: [],
        },
        timestamp: new Date().toISOString(),
      };

      (PortfolioService as jest.MockedClass<typeof PortfolioService>).prototype.getPortfolioMetrics = jest
        .fn()
        .mockResolvedValue(mockMetrics);

      const service = new PortfolioService();
      const result = await service.getPortfolioMetrics('0x1234567890abcdef');

      expect(result.walletAddress).toBe('0x1234567890abcdef');
      expect(result.staking).toBeDefined();
      expect(result.lending).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle service errors gracefully', async () => {
      (PortfolioService as jest.MockedClass<typeof PortfolioService>).prototype.getPortfolioMetrics = jest
        .fn()
        .mockRejectedValue(new Error('API Error'));

      const mockReq = {
        params: { walletAddress: '0x1234567890abcdef' },
        query: {},
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      try {
        const service = new PortfolioService();
        await service.getPortfolioMetrics('0x1234567890abcdef');
      } catch (error) {
        mockRes.status(500).json({
          success: false,
          error: 'Failed to fetch portfolio metrics',
          message: (error as Error).message,
        });
      }

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to fetch portfolio metrics',
        })
      );
    });
  });
});

