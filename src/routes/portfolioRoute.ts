import { Router, Request, Response } from 'express';
import { PortfolioService } from '../services/portfolioService';

const router = Router();
const portfolioService = new PortfolioService();

/**
 * GET /api/portfolio/staking/:walletAddress
 * Get staking metrics for a specific wallet address
 * Returns total staking TVL, protocol breakdown, and rewards
 */
router.get('/staking/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || walletAddress.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      });
    }

    const stakingMetrics = await portfolioService.getStakingMetrics(walletAddress);

    return res.json({
      success: true,
      data: stakingMetrics,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Portfolio staking error:', errorMessage);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch staking metrics',
      message: errorMessage,
    });
  }
});

/**
 * GET /api/portfolio/lending/:walletAddress
 * Get lending metrics for a specific wallet address
 * Returns borrower health score, debt ratios, and lending positions
 */
router.get('/lending/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || walletAddress.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      });
    }

    const lendingMetrics = await portfolioService.getLendingMetrics(walletAddress);

    return res.json({
      success: true,
      data: lendingMetrics,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Portfolio lending error:', errorMessage);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch lending metrics',
      message: errorMessage,
    });
  }
});

/**
 * GET /api/portfolio/metrics/:walletAddress
 * Get combined portfolio metrics (staking + lending)
 */
router.get('/metrics/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || walletAddress.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      });
    }

    const portfolioMetrics = await portfolioService.getPortfolioMetrics(walletAddress);

    return res.json({
      success: true,
      data: portfolioMetrics,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Portfolio metrics error:', errorMessage);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio metrics',
      message: errorMessage,
    });
  }
});

/**
 * GET /api/portfolio/debug/:walletAddress
 * Get raw Nansen Portfolio API response for debugging
 */
router.get('/debug/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || walletAddress.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      });
    }

    // Access the Nansen client directly
    const { NansenClient } = require('../services/nansenClient');
    const client = new NansenClient();
    const rawResponse = await client.getPortfolioDefiHoldings(walletAddress);

    return res.json({
      success: true,
      data: rawResponse.data,
      rawProtocols: rawResponse.data.protocols,
      protocolCount: rawResponse.data.protocols?.length || 0,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Portfolio debug error:', errorMessage);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio debug data',
      message: errorMessage,
    });
  }
});

export default router;

