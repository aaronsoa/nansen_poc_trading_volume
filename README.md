# Nansen API POC - Trading Volume, Hyperliquid & Portfolio Analysis

A proof-of-concept application for retrieving and analyzing on-chain trading data and DeFi portfolio metrics using the Nansen API. This POC demonstrates:

- **Spot/DEX Trading Volume**: Fetch trading volume data for specific wallet addresses across chains and DEXes
- **Hyperliquid Perpetual Trading**: Track perp positions and trades on Hyperliquid DEX
- **Portfolio Staking Metrics**: Monitor staking positions, TVL, and rewards across protocols
- **Portfolio Lending Metrics**: Track lending positions and calculate borrower health scores
- **Advanced Filtering**: Filter by token, chain, DEX, LP, date range, side (long/short), and PnL
- **Data Aggregation**: Automatically aggregate and summarize trading activity and portfolio positions

## Features

### Spot Trading Volume
- Get comprehensive trading volume data for any wallet address
- Filter by token address, chain, DEX, LP, and date range
- Automatically aggregate volumes by chain, token, DEX, and LP
- RESTful API with GET and POST endpoints

### Hyperliquid Perpetual Trading
- **Track Positions**: Monitor open perp positions with leverage, PnL, and liquidation prices
- **Analyze Trades**: View trade history with entry/exit prices, fees, and PnL
- **Calculate Metrics**: Automatic win rate calculation and volume aggregation
- **Filter by Token**: Use token symbols (BTC, ETH) instead of addresses

### Portfolio DeFi Metrics
- **Staking Analysis**: Total TVL locked, rewards tracking, and protocol breakdown
- **Lending Analysis**: Borrower health scores (normalized 0-100), debt ratios, and protocol positions
- **Multi-Protocol Support**: Track positions across Lido, Aave, Compound, and other protocols
- **Combined Metrics**: View staking and lending data together for complete portfolio analysis

## Prerequisites

- Node.js 18+ and npm
- Nansen API key (get one from [Nansen Dashboard](https://www.nansen.ai/api))

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Nansen API key
```

## Configuration

Create a `.env` file in the root directory:

```env
NANSEN_API_KEY=your_api_key_here
NANSEN_API_BASE_URL=https://api.nansen.ai
PORT=3000
```

## Usage

### Start the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

### API Endpoints

#### Get Trading Volume for a Wallet

**GET** `/api/trading-volume/:walletAddress`

Query parameters:
- `tokenAddress` - Filter by token contract address
- `chain` - Filter by chain (e.g., `ethereum`, `polygon`)
- `dex` - Filter by DEX name
- `lpPool` - Filter by liquidity pool address
- `startDate` - Start date (ISO 8601 format)
- `endDate` - End date (ISO 8601 format)

Example:
```bash
# Get all trading volume for a wallet
curl http://localhost:3000/api/trading-volume/0x1234567890abcdef

# Filter by chain and token
curl "http://localhost:3000/api/trading-volume/0x1234567890abcdef?chain=ethereum&tokenAddress=0xTokenAddress"
```

#### Get Trading Volume with Advanced Filters (POST)

**POST** `/api/trading-volume/:walletAddress`

Request body:
```json
{
  "filters": {
    "tokenAddress": "0xTokenAddress",
    "chain": "ethereum",
    "dex": "uniswap",
    "lpPool": "0xLPPoolAddress",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }
}
```

#### Get Staking Metrics for a Wallet

**GET** `/api/portfolio/staking/:walletAddress`

Returns total staking TVL, protocol breakdown, and rewards information.

Example:
```bash
curl http://localhost:3000/api/portfolio/staking/0x1234567890abcdef
```

Response:
```json
{
  "success": true,
  "data": {
    "totalStakingTvlUsd": 5000,
    "totalRewardsUsd": 250,
    "stakingProtocols": [
      {
        "protocolName": "Lido",
        "chain": "ethereum",
        "totalValueUsd": 5000,
        "totalAssetsUsd": 5000,
        "totalRewardsUsd": 250,
        "tokenCount": 1
      }
    ],
    "message": "Note: Sustained staking days calculation requires historical tracking..."
  }
}
```

#### Get Lending Metrics for a Wallet

**GET** `/api/portfolio/lending/:walletAddress`

Returns borrower health score and lending positions.

- **Borrower Health Score** (0-100): Normalized score where 100 = perfect health (no debt), 0 = critical (no assets but has debt)
  - Health Score = min((total_assets_usd / total_debts_usd) / 2 * 100, 100)
  - If no debt: score = 100
  - If no assets but debt exists: score = 0

Example:
```bash
curl http://localhost:3000/api/portfolio/lending/0x1234567890abcdef
```

Response:
```json
{
  "success": true,
  "data": {
    "borrowerHealthScore": 100,
    "totalAssetsUsd": 12000,
    "totalDebtsUsd": 6000,
    "lendingProtocols": [
      {
        "protocolName": "Aave",
        "chain": "ethereum",
        "totalValueUsd": 6000,
        "totalAssetsUsd": 12000,
        "totalDebtsUsd": 6000,
        "debtRatio": 0.5,
        "tokenCount": 2
      }
    ]
  }
}
```

#### Get Combined Portfolio Metrics

**GET** `/api/portfolio/metrics/:walletAddress`

Returns both staking and lending metrics in a single request.

Example:
```bash
curl http://localhost:3000/api/portfolio/metrics/0x1234567890abcdef
```

Response:
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234567890abcdef",
    "staking": {
      "totalStakingTvlUsd": 5000,
      "stakingProtocols": [],
      "totalRewardsUsd": 250
    },
    "lending": {
      "borrowerHealthScore": 100,
      "totalAssetsUsd": 12000,
      "totalDebtsUsd": 6000,
      "lendingProtocols": []
    },
    "timestamp": "2024-11-14T12:00:00Z"
  }
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234567890abcdef",
    "totalVolume": 1500000.50,
    "totalTransactions": 42,
    "volumeByChain": {
      "ethereum": 1000000.00,
      "polygon": 500000.50
    },
    "volumeByToken": {
      "0xTokenA": 800000.00,
      "0xTokenB": 700000.50
    },
    "volumeByDex": {
      "uniswap": 900000.00,
      "sushiswap": 600000.50
    },
    "volumeByLp": {
      "0xLPPool1": 500000.00,
      "0xLPPool2": 1000000.50
    },
    "transactions": [
      {
        "walletAddress": "0x1234567890abcdef",
        "totalVolume": 1000.00,
        "totalTransactions": 1,
        "baseCurrency": "0xTokenA",
        "quoteCurrency": "0xTokenB",
        "chain": "ethereum",
        "dex": "uniswap",
        "lpPool": "0xLPPool1",
        "tokenAddress": "0xTokenA",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── config/
│   └── nansen.ts                    # Configuration and environment variables
├── models/
│   ├── tradingVolume.ts             # Data models for trading volume
│   └── hyperliquid.ts               # Data models for Hyperliquid
├── services/
│   ├── nansenClient.ts              # Nansen API client with retry logic
│   ├── tradingVolumeService.ts      # Business logic for trading volume
│   ├── hyperliquidService.ts        # Business logic for Hyperliquid trading
│   └── portfolioService.ts          # Business logic for DeFi portfolio analysis
├── routes/
│   ├── tradingVolumeRoute.ts        # Express routes for trading volume
│   ├── hyperliquidRoute.ts          # Express routes for Hyperliquid
│   └── portfolioRoute.ts            # Express routes for portfolio metrics
├── utils/
│   └── filters.ts                   # Filtering utilities
└── index.ts                         # Express app entry point
```

## Notes

### General
- This is a POC and may need adjustments based on the actual Nansen API endpoint structure
- The API endpoints used are based on available documentation and may require verification
- Rate limiting and error handling are implemented but may need tuning based on actual API behavior
- Volume calculations use raw token amounts; USD conversion would require additional price data

### Portfolio Metrics
- **Staking Analysis**: The Portfolio API returns current staking positions. To track "sustained staking days" (e.g., staked > X amount for N consecutive days), you'll need to:
  - Poll the `/api/portfolio/staking/:walletAddress` endpoint periodically (daily/hourly)
  - Store snapshots of staking amounts with timestamps
  - Implement historical tracking logic to determine consecutive days meeting your threshold
  - The service includes a message hint suggesting this approach

- **Borrower Health Score**: Uses a normalized 0-100 scale:
  - **100**: Perfect health (no debt or sufficient collateral)
  - **50-99**: Good health (assets > debts)
  - **1-49**: Risky (assets approaching debts)
  - **0**: Critical (no assets but has debt)
  - Formula: `Health Score = min((total_assets_usd / total_debts_usd) / 2 * 100, 100)` when debt > 0

- **Protocol-Level Data**: The API provides individual protocol breakdowns for both staking and lending, allowing you to:
  - Identify which protocols contribute most to your portfolio
  - Monitor individual protocol health factors
  - Calculate per-protocol debt ratios and collateralization

## License

ISC

