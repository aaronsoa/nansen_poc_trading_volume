/**
 * Demo script to demonstrate filtering functionality
 * This shows how the filtering works with mock data
 */

import { TradingVolumeService } from './services/tradingVolumeService';
import { NansenClient, NansenDexTrade } from './services/nansenClient';
import { TradingVolumeFilters } from './models/tradingVolume';

// Mock Nansen client for demo
class MockNansenClient extends NansenClient {
  async getSmartMoneyDexTrades(params: any) {
    // Return mock data
    const mockTrades: NansenDexTrade[] = [
      {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        token_in: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token_out: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        amount_in: '10000',
        amount_out: '10000',
        chain: 'ethereum',
        dex: 'uniswap',
        lp_pool: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
        timestamp: '2024-01-15T10:00:00Z',
        tx_hash: '0xtx1',
      },
      {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        token_in: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        token_out: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        amount_in: '5000',
        amount_out: '5000',
        chain: 'ethereum',
        dex: 'sushiswap',
        lp_pool: '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0',
        timestamp: '2024-01-16T11:00:00Z',
        tx_hash: '0xtx2',
      },
      {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        token_in: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token_out: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        amount_in: '20000',
        amount_out: '0.5',
        chain: 'polygon',
        dex: 'quickswap',
        lp_pool: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        timestamp: '2024-01-17T12:00:00Z',
        tx_hash: '0xtx3',
      },
    ];

    // Apply basic filtering on mock data
    let filteredTrades = mockTrades;
    
    if (params.chains && params.chains.length > 0) {
      filteredTrades = filteredTrades.filter(t => 
        params.chains!.includes(t.chain.toLowerCase())
      );
    }
    
    if (params.tokens && params.tokens.length > 0) {
      filteredTrades = filteredTrades.filter(t => 
        params.tokens!.some((token: string) => 
          t.token_in.toLowerCase() === token.toLowerCase() ||
          t.token_out.toLowerCase() === token.toLowerCase()
        )
      );
    }
    
    if (params.dex) {
      filteredTrades = filteredTrades.filter(t => 
        t.dex.toLowerCase() === params.dex.toLowerCase()
      );
    }

    return {
      data: {
        trades: filteredTrades,
        total: filteredTrades.length,
      },
      status: 200,
    };
  }
}

async function runDemo() {
  console.log('🚀 Nansen API POC - Filtering Demo\n');
  console.log('=' .repeat(60));

  const mockClient = new MockNansenClient();
  const service = new TradingVolumeService(mockClient as any);

  const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';

  try {
    // Demo 1: Get all trading volume
    console.log('\n📊 Demo 1: Get all trading volume');
    console.log('-'.repeat(60));
    const allVolume = await service.getWalletTradingVolume(walletAddress);
    console.log(`Total Volume: $${allVolume.totalVolume.toLocaleString()}`);
    console.log(`Total Transactions: ${allVolume.totalTransactions}`);
    console.log(`Chains: ${Object.keys(allVolume.volumeByChain).join(', ')}`);
    console.log(`DEXes: ${Object.keys(allVolume.volumeByDex).join(', ')}`);

    // Demo 2: Filter by chain
    console.log('\n📊 Demo 2: Filter by chain (ethereum only)');
    console.log('-'.repeat(60));
    const ethVolume = await service.getWalletTradingVolume(walletAddress, {
      chain: 'ethereum',
    });
    console.log(`Total Volume (Ethereum): $${ethVolume.totalVolume.toLocaleString()}`);
    console.log(`Transactions: ${ethVolume.totalTransactions}`);
    console.log(`DEXes: ${Object.keys(ethVolume.volumeByDex).join(', ')}`);

    // Demo 3: Filter by token
    console.log('\n📊 Demo 3: Filter by token (USDC)');
    console.log('-'.repeat(60));
    const usdcVolume = await service.getWalletTradingVolume(walletAddress, {
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    });
    console.log(`Total Volume (USDC trades): $${usdcVolume.totalVolume.toLocaleString()}`);
    console.log(`Transactions: ${usdcVolume.totalTransactions}`);

    // Demo 4: Filter by DEX
    console.log('\n📊 Demo 4: Filter by DEX (Uniswap only)');
    console.log('-'.repeat(60));
    const uniswapVolume = await service.getWalletTradingVolume(walletAddress, {
      dex: 'uniswap',
    });
    console.log(`Total Volume (Uniswap): $${uniswapVolume.totalVolume.toLocaleString()}`);
    console.log(`Transactions: ${uniswapVolume.totalTransactions}`);

    // Demo 5: Multiple filters
    console.log('\n📊 Demo 5: Multiple filters (Ethereum + Uniswap)');
    console.log('-'.repeat(60));
    const multiFilterVolume = await service.getWalletTradingVolume(walletAddress, {
      chain: 'ethereum',
      dex: 'uniswap',
    });
    console.log(`Total Volume: $${multiFilterVolume.totalVolume.toLocaleString()}`);
    console.log(`Transactions: ${multiFilterVolume.totalTransactions}`);

    console.log('\n✅ Demo completed successfully!');
    console.log('=' .repeat(60));
  } catch (error: any) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run demo if executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };

