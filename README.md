# Nansen API POC - Trading Volume Analysis

A proof-of-concept application for retrieving and analyzing on-chain trading volume using the Nansen API. This POC demonstrates how to:

- Fetch trading volume data for specific wallet addresses
- Filter trading data by token, chain, liquidity pool (LP), or DEX
- Aggregate and summarize trading activity

## Features

- **Wallet Trading Volume**: Get comprehensive trading volume data for any wallet address
- **Advanced Filtering**: Filter by:
  - Token address
  - Blockchain network (chain)
  - Decentralized Exchange (DEX)
  - Liquidity Pool (LP)
  - Date range
- **Volume Aggregation**: Automatically aggregates volumes by chain, token, DEX, and LP
- **RESTful API**: Simple HTTP endpoints for easy integration

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
│   └── nansen.ts          # Configuration and environment variables
├── models/
│   └── tradingVolume.ts   # Data models and interfaces
├── services/
│   ├── nansenClient.ts    # Nansen API client with retry logic
│   └── tradingVolumeService.ts  # Business logic for trading volume
├── routes/
│   └── tradingVolumeRoute.ts    # Express routes
├── utils/
│   └── filters.ts         # Filtering utilities
└── index.ts              # Express app entry point
```

## Notes

- This is a POC and may need adjustments based on the actual Nansen API endpoint structure
- The API endpoints used are based on available documentation and may require verification
- Rate limiting and error handling are implemented but may need tuning based on actual API behavior
- Volume calculations use raw token amounts; USD conversion would require additional price data

## License

ISC

