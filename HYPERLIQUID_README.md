# Nansen Hyperliquid API Integration

## Overview

This POC includes integration with Nansen's Hyperliquid API to track perpetual trading positions and trades on the Hyperliquid DEX.

## Features

- **Track Perpetual Positions**: Monitor real-time perp positions with leverage, PnL, and liquidation prices
- **Analyze Trade History**: View detailed trade history with entry/exit prices, fees, and PnL
- **Filter by Token**: Use token symbols (BTC, ETH, etc.) instead of addresses
- **Aggregate Data**: Automatic aggregation by token, side (long/short), and win rate calculation

## API Endpoints

### Get Perpetual Positions

**GET** `/api/hyperliquid/positions/:address`

Query parameters:
- `tokenSymbol` - Filter by token symbol (e.g., BTC, ETH)
- `side` - Filter by position side (long/short)
- `minPnl` - Minimum PnL filter
- `maxPnl` - Maximum PnL filter

Example:
```bash
# Get all positions
curl http://localhost:3000/api/hyperliquid/positions/0xYourAddress

# Filter by token
curl "http://localhost:3000/api/hyperliquid/positions/0xYourAddress?tokenSymbol=BTC"

# Filter by side
curl "http://localhost:3000/api/hyperliquid/positions/0xYourAddress?side=long"
```

### Get Perpetual Trades

**GET** `/api/hyperliquid/trades/:address`

Query parameters:
- `tokenSymbol` - Filter by token symbol
- `side` - Filter by trade side (long/short/buy/sell)
- `startDate` - Start date (ISO 8601 format)
- `endDate` - End date (ISO 8601 format)

Example:
```bash
# Get all trades (last month by default)
curl http://localhost:3000/api/hyperliquid/trades/0xYourAddress

# Filter by token and date range
curl "http://localhost:3000/api/hyperliquid/trades/0xYourAddress?tokenSymbol=ETH&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z"
```

### Advanced Filtering (POST)

**POST** `/api/hyperliquid/positions/:address`

**POST** `/api/hyperliquid/trades/:address`

Request body:
```json
{
  "filters": {
    "tokenSymbol": "BTC",
    "side": "long",
    "minPnl": 0,
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }
}
```

## Response Format

### Positions Response

```json
{
  "success": true,
  "data": {
    "address": "0xYourAddress",
    "totalPositions": 3,
    "totalPnl": 1250.50,
    "totalPnlPercentage": 12.5,
    "totalMarginUsed": 10000.00,
    "longPositions": 2,
    "shortPositions": 1,
    "positionsByToken": {
      "BTC": [...],
      "ETH": [...]
    },
    "positions": [
      {
        "address": "0xYourAddress",
        "tokenSymbol": "BTC",
        "side": "long",
        "size": 0.5,
        "entryPrice": 45000.00,
        "markPrice": 47000.00,
        "leverage": 5.0,
        "pnl": 1000.00,
        "pnlPercentage": 10.0,
        "liquidationPrice": 40000.00,
        "marginUsed": 5000.00,
        "timestamp": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

### Trades Response

```json
{
  "success": true,
  "data": {
    "address": "0xYourAddress",
    "totalTrades": 42,
    "totalVolume": 150000.00,
    "totalFees": 150.00,
    "totalPnl": 2500.00,
    "winRate": 65.5,
    "tradesByToken": {
      "BTC": [...],
      "ETH": [...]
    },
    "trades": [
      {
        "address": "0xYourAddress",
        "tokenSymbol": "BTC",
        "side": "long",
        "size": 0.5,
        "price": 45000.00,
        "fee": 11.25,
        "pnl": 500.00,
        "timestamp": "2024-01-15T10:00:00.000Z",
        "txHash": "0x..."
      }
    ]
  }
}
```

## Key Differences from Spot Trading API

1. **Token Identification**: Uses token symbols (BTC, ETH) instead of contract addresses
2. **Perp-Specific Data**: Includes leverage, liquidation prices, and margin usage
3. **Side Terminology**: Uses long/short instead of buy/sell for positions
4. **Platform Specific**: Only works with Hyperliquid DEX (no chain parameter needed)

## API Credits

Both endpoints use **one Nansen API credit per request**. All filtering and aggregation is done locally after fetching the data.

## Testing

Test with wallet: `0x7b6fa77213265d873ba102e6fc0775864bcd1c60`

```bash
# Get positions
curl http://localhost:3000/api/hyperliquid/positions/0x7b6fa77213265d873ba102e6fc0775864bcd1c60

# Get trades
curl http://localhost:3000/api/hyperliquid/trades/0x7b6fa77213265d873ba102e6fc0775864bcd1c60
```

## Integration

The Hyperliquid functionality is integrated alongside the existing trading volume API:

- Spot/DEX trading volume: `/api/trading-volume/:walletAddress`
- Hyperliquid perp positions: `/api/hyperliquid/positions/:address`
- Hyperliquid perp trades: `/api/hyperliquid/trades/:address`

All use the same Nansen API key and share the same HTTP client infrastructure with retry logic and error handling.

