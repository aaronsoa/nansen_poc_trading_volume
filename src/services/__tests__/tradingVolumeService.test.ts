import { TradingVolumeService } from '../tradingVolumeService';
import { NansenClient, NansenDexTrade } from '../nansenClient';
import { TradingVolumeFilters } from '../../models/tradingVolume';

describe('TradingVolumeService', () => {
  let service: TradingVolumeService;
  let mockNansenClient: jest.Mocked<NansenClient>;

  beforeEach(() => {
    mockNansenClient = {
      getSmartMoneyDexTrades: jest.fn(),
      getWalletProfiler: jest.fn(),
      getTokenGodMode: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
    } as any;

    service = new TradingVolumeService(mockNansenClient);
  });

  describe('getWalletTradingVolume', () => {
    it('should aggregate trading volumes correctly', async () => {
      const mockTrades: NansenDexTrade[] = [
        {
          wallet_address: '0x123',
          token_in: '0xTokenA',
          token_out: '0xTokenB',
          amount_in: '1000',
          amount_out: '950',
          chain: 'ethereum',
          dex: 'uniswap',
          timestamp: '2024-01-01T00:00:00Z',
          tx_hash: '0xtx1',
        },
        {
          wallet_address: '0x123',
          token_in: '0xTokenC',
          token_out: '0xTokenD',
          amount_in: '2000',
          amount_out: '1900',
          chain: 'polygon',
          dex: 'sushiswap',
          timestamp: '2024-01-02T00:00:00Z',
          tx_hash: '0xtx2',
        },
      ];

      mockNansenClient.getSmartMoneyDexTrades.mockResolvedValue({
        data: {
          trades: mockTrades,
          total: 2,
        },
        status: 200,
      });

      const result = await service.getWalletTradingVolume('0x123');

      expect(result.walletAddress).toBe('0x123');
      expect(result.totalTransactions).toBe(2);
      expect(result.totalVolume).toBeGreaterThan(0);
      expect(result.volumeByChain.ethereum).toBeDefined();
      expect(result.volumeByChain.polygon).toBeDefined();
      expect(result.volumeByDex.uniswap).toBeDefined();
      expect(result.volumeByDex.sushiswap).toBeDefined();
    });

    it('should filter by token address', async () => {
      const mockTrades: NansenDexTrade[] = [
        {
          wallet_address: '0x123',
          token_in: '0xTokenA',
          token_out: '0xTokenB',
          amount_in: '1000',
          amount_out: '950',
          chain: 'ethereum',
          dex: 'uniswap',
          timestamp: '2024-01-01T00:00:00Z',
          tx_hash: '0xtx1',
        },
      ];

      mockNansenClient.getSmartMoneyDexTrades.mockResolvedValue({
        data: {
          trades: mockTrades,
          total: 1,
        },
        status: 200,
      });

      const filters: TradingVolumeFilters = {
        tokenAddress: '0xTokenA',
      };

      const result = await service.getWalletTradingVolume('0x123', filters);

      expect(result.totalTransactions).toBe(1);
    });

    it('should handle empty results', async () => {
      mockNansenClient.getSmartMoneyDexTrades.mockResolvedValue({
        data: {
          trades: [],
          total: 0,
        },
        status: 200,
      });

      const result = await service.getWalletTradingVolume('0x456');

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe(0);
    });
  });
});

