# Usage Examples

## Basic Usage

### 1. Get all trading volume for a wallet

```bash
curl http://localhost:3000/api/trading-volume/0x1234567890abcdef1234567890abcdef12345678
```

### 2. Filter by chain

```bash
curl "http://localhost:3000/api/trading-volume/0x1234567890abcdef1234567890abcdef12345678?chain=ethereum"
```

### 3. Filter by token address

```bash
curl "http://localhost:3000/api/trading-volume/0x1234567890abcdef1234567890abcdef12345678?tokenAddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
```

### 4. Filter by DEX

```bash
curl "http://localhost:3000/api/trading-volume/0x1234567890abcdef1234567890abcdef12345678?dex=uniswap"
```

### 5. Filter by multiple parameters

```bash
curl "http://localhost:3000/api/trading-volume/0x1234567890abcdef1234567890abcdef12345678?chain=ethereum&tokenAddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&dex=uniswap"
```

### 6. Filter by date range

```bash
curl "http://localhost:3000/api/trading-volume/0x1234567890abcdef1234567890abcdef12345678?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z"
```

### 7. Advanced filtering with POST

```bash
curl -X POST http://localhost:3000/api/trading-volume/0x1234567890abcdef1234567890abcdef12345678 \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "chain": "ethereum",
      "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "dex": "uniswap",
      "lpPool": "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z"
    }
  }'
```

## JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
const baseUrl = 'http://localhost:3000';

// Get all trading volume
async function getTradingVolume() {
  try {
    const response = await axios.get(`${baseUrl}/api/trading-volume/${walletAddress}`);
    console.log('Trading Volume:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get trading volume with filters
async function getFilteredTradingVolume() {
  try {
    const response = await axios.get(`${baseUrl}/api/trading-volume/${walletAddress}`, {
      params: {
        chain: 'ethereum',
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        dex: 'uniswap',
      },
    });
    console.log('Filtered Trading Volume:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get trading volume with advanced filters (POST)
async function getAdvancedFilteredTradingVolume() {
  try {
    const response = await axios.post(`${baseUrl}/api/trading-volume/${walletAddress}`, {
      filters: {
        chain: 'ethereum',
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        dex: 'uniswap',
        lpPool: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      },
    });
    console.log('Advanced Filtered Trading Volume:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Python Example

```python
import requests

wallet_address = '0x1234567890abcdef1234567890abcdef12345678'
base_url = 'http://localhost:3000'

# Get all trading volume
def get_trading_volume():
    response = requests.get(f'{base_url}/api/trading-volume/{wallet_address}')
    print('Trading Volume:', response.json())

# Get trading volume with filters
def get_filtered_trading_volume():
    params = {
        'chain': 'ethereum',
        'tokenAddress': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'dex': 'uniswap',
    }
    response = requests.get(f'{base_url}/api/trading-volume/{wallet_address}', params=params)
    print('Filtered Trading Volume:', response.json())

# Get trading volume with advanced filters (POST)
def get_advanced_filtered_trading_volume():
    payload = {
        'filters': {
            'chain': 'ethereum',
            'tokenAddress': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            'dex': 'uniswap',
            'lpPool': '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
            'startDate': '2024-01-01T00:00:00Z',
            'endDate': '2024-12-31T23:59:59Z',
        }
    }
    response = requests.post(f'{base_url}/api/trading-volume/{wallet_address}', json=payload)
    print('Advanced Filtered Trading Volume:', response.json())
```

## Response Format

All endpoints return a JSON response in the following format:

```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
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
        "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "totalVolume": 1000.00,
        "totalTransactions": 1,
        "baseCurrency": "0xTokenA",
        "quoteCurrency": "0xTokenB",
        "chain": "ethereum",
        "dex": "uniswap",
        "lpPool": "0xLPPool1",
        "tokenAddress": "0xTokenA",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

