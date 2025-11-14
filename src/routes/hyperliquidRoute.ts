import { Router, Request, Response } from 'express';
import { HyperliquidService } from '../services/hyperliquidService';
import { HyperliquidFilters } from '../models/hyperliquid';

const router = Router();
const hyperliquidService = new HyperliquidService();

/**
 * GET /api/hyperliquid/positions/:address
 * Get Hyperliquid perpetual positions for a wallet
 * Query parameters:
 * - tokenSymbol: Filter by token symbol (e.g., BTC, ETH)
 * - side: Filter by position side (long/short)
 * - minPnl: Minimum PnL filter
 * - maxPnl: Maximum PnL filter
 */
router.get('/positions/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { tokenSymbol, side, minPnl, maxPnl } = req.query;

    const filters: HyperliquidFilters = {};

    if (tokenSymbol && typeof tokenSymbol === 'string') {
      filters.tokenSymbol = tokenSymbol;
    }

    if (side && (side === 'long' || side === 'short')) {
      filters.side = side;
    }

    if (minPnl && typeof minPnl === 'string') {
      filters.minPnl = parseFloat(minPnl);
    }

    if (maxPnl && typeof maxPnl === 'string') {
      filters.maxPnl = parseFloat(maxPnl);
    }

    const summary = await hyperliquidService.getWalletPerpPositions(
      address,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error in Hyperliquid positions route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Hyperliquid positions',
    });
  }
});

/**
 * GET /api/hyperliquid/trades/:address
 * Get Hyperliquid perpetual trade history for a wallet
 * Query parameters:
 * - tokenSymbol: Filter by token symbol
 * - side: Filter by trade side
 * - startDate: Start date (ISO 8601)
 * - endDate: End date (ISO 8601)
 */
router.get('/trades/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { tokenSymbol, side, startDate, endDate } = req.query;

    const filters: HyperliquidFilters = {};

    if (tokenSymbol && typeof tokenSymbol === 'string') {
      filters.tokenSymbol = tokenSymbol;
    }

    if (side && (side === 'long' || side === 'short')) {
      filters.side = side;
    }

    if (startDate && typeof startDate === 'string') {
      filters.startDate = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filters.endDate = new Date(endDate);
    }

    const summary = await hyperliquidService.getWalletPerpTrades(
      address,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error in Hyperliquid trades route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Hyperliquid trades',
    });
  }
});

/**
 * POST /api/hyperliquid/positions/:address
 * Get positions with advanced filters
 */
router.post('/positions/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const filters: HyperliquidFilters = req.body.filters || {};

    const summary = await hyperliquidService.getWalletPerpPositions(address, filters);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error in Hyperliquid positions route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Hyperliquid positions',
    });
  }
});

/**
 * POST /api/hyperliquid/trades/:address
 * Get trades with advanced filters
 */
router.post('/trades/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const filters: HyperliquidFilters = req.body.filters || {};

    // Convert date strings
    if (filters.startDate && typeof filters.startDate === 'string') {
      filters.startDate = new Date(filters.startDate);
    }
    if (filters.endDate && typeof filters.endDate === 'string') {
      filters.endDate = new Date(filters.endDate);
    }

    const summary = await hyperliquidService.getWalletPerpTrades(address, filters);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error in Hyperliquid trades route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Hyperliquid trades',
    });
  }
});

export default router;

