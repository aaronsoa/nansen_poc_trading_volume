import { NansenClient } from '../nansenClient';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.create to return a mock instance
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

describe('NansenClient', () => {
  let client: NansenClient;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    client = new NansenClient();
  });

  describe('getSmartMoneyDexTrades', () => {
    it('should fetch DEX trades successfully', async () => {
      const mockResponse = {
        data: {
          trades: [
            {
              wallet_address: '0x123',
              token_in: '0xTokenA',
              token_out: '0xTokenB',
              amount_in: '1000',
              amount_out: '950',
              chain: 'ethereum',
              dex: 'uniswap',
              timestamp: '2024-01-01T00:00:00Z',
              tx_hash: '0xtx123',
            },
          ],
          total: 1,
        },
        status: 200,
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.getSmartMoneyDexTrades({
        chains: ['ethereum'],
        tokens: ['0xTokenA'],
      });

      expect(result.data.trades).toHaveLength(1);
      expect(result.data.trades[0].wallet_address).toBe('0x123');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/smart-money/dex-trades',
        expect.objectContaining({
          parameters: expect.objectContaining({
            chains: ['ethereum'],
            tokens: ['0xTokenA'],
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(
        client.getSmartMoneyDexTrades({})
      ).rejects.toThrow('Failed to fetch Smart Money DEX trades');
    });
  });
});

