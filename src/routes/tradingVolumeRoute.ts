import { Router, Request, Response } from 'express';
import { TradingVolumeService } from '../services/tradingVolumeService';
import { TradingVolumeFilters } from '../models/tradingVolume';

const router = Router();
const tradingVolumeService = new TradingVolumeService();

/**
 * GET /api/trading-volume/:walletAddress
 * Get trading volume for a specific wallet address
 * Query parameters:
 * - tokenAddress: Filter by token address
 * - chain: Filter by chain (e.g., ethereum, polygon)
 * - dex: Filter by DEX name
 * - lpPool: Filter by liquidity pool address
 * - startDate: Start date (ISO 8601 format)
 * - endDate: End date (ISO 8601 format)
 */
router.get('/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const {
      tokenAddress,
      chain,
      dex,
      lpPool,
      startDate,
      endDate,
    } = req.query;

    // Build filters from query parameters
    const filters: TradingVolumeFilters = {};

    if (tokenAddress && typeof tokenAddress === 'string') {
      filters.tokenAddress = tokenAddress;
    }

    if (chain && typeof chain === 'string') {
      filters.chain = chain;
    }

    if (dex && typeof dex === 'string') {
      filters.dex = dex;
    }

    if (lpPool && typeof lpPool === 'string') {
      filters.lpPool = lpPool;
    }

    if (startDate && typeof startDate === 'string') {
      filters.startDate = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filters.endDate = new Date(endDate);
    }

    // Get trading volume
    const summary = await tradingVolumeService.getWalletTradingVolume(
      walletAddress,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error in trading volume route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trading volume',
    });
  }
});

/**
 * POST /api/trading-volume/:walletAddress
 * Get trading volume with advanced filters (POST for complex filter objects)
 */
router.post('/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const filters: TradingVolumeFilters = req.body.filters || {};

    // Convert date strings to Date objects if present
    if (filters.startDate && typeof filters.startDate === 'string') {
      filters.startDate = new Date(filters.startDate);
    }
    if (filters.endDate && typeof filters.endDate === 'string') {
      filters.endDate = new Date(filters.endDate);
    }

    const summary = await tradingVolumeService.getWalletTradingVolume(
      walletAddress,
      filters
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error in trading volume route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trading volume',
    });
  }
});

export default router;

