# Portfolio API Response Examples

This document shows example responses from the new Portfolio API endpoints.

## Endpoint 1: GET /api/portfolio/staking/:walletAddress

### Request
```bash
curl http://localhost:3000/api/portfolio/staking/0x4062b997279de7213731dbe00485722a26718892
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "totalStakingTvlUsd": 125000.50,
    "totalRewardsUsd": 3500.25,
    "stakingProtocols": [
      {
        "protocolName": "Lido",
        "chain": "ethereum",
        "totalValueUsd": 75000,
        "totalAssetsUsd": 75000,
        "totalRewardsUsd": 2100,
        "tokenCount": 1
      },
      {
        "protocolName": "Rocket Pool",
        "chain": "ethereum",
        "totalValueUsd": 50000.50,
        "totalAssetsUsd": 50000.50,
        "totalRewardsUsd": 1400.25,
        "tokenCount": 1
      }
    ],
    "message": "Note: Sustained staking days calculation requires historical tracking. Consider polling this endpoint periodically and storing snapshots to determine how many consecutive days staking has exceeded a threshold."
  }
}
```

### Error Response - Invalid Wallet (400)
```json
{
  "success": false,
  "error": "Invalid wallet address"
}
```

### Error Response - API Error (500)
```json
{
  "success": false,
  "error": "Failed to fetch staking metrics",
  "message": "Failed to fetch portfolio DeFi holdings: API Error: 401 Unauthorized"
}
```

---

## Endpoint 2: GET /api/portfolio/lending/:walletAddress

### Request
```bash
curl http://localhost:3000/api/portfolio/lending/0x4062b997279de7213731dbe00485722a26718892
```

### Success Response - Healthy Position (200)
```json
{
  "success": true,
  "data": {
    "borrowerHealthScore": 85.5,
    "totalAssetsUsd": 200000,
    "totalDebtsUsd": 100000,
    "lendingProtocols": [
      {
        "protocolName": "Aave V3",
        "chain": "ethereum",
        "totalValueUsd": 50000,
        "totalAssetsUsd": 150000,
        "totalDebtsUsd": 100000,
        "debtRatio": 0.667,
        "tokenCount": 3
      },
      {
        "protocolName": "Compound",
        "chain": "ethereum",
        "totalValueUsd": 25000,
        "totalAssetsUsd": 50000,
        "totalDebtsUsd": 0,
        "debtRatio": 0,
        "tokenCount": 2
      }
    ]
  }
}
```

### Success Response - No Debt (200)
```json
{
  "success": true,
  "data": {
    "borrowerHealthScore": 100,
    "totalAssetsUsd": 50000,
    "totalDebtsUsd": 0,
    "lendingProtocols": [
      {
        "protocolName": "Compound",
        "chain": "ethereum",
        "totalValueUsd": 50000,
        "totalAssetsUsd": 50000,
        "totalDebtsUsd": 0,
        "debtRatio": 0,
        "tokenCount": 1
      }
    ]
  }
}
```

### Success Response - Critical Position (200)
```json
{
  "success": true,
  "data": {
    "borrowerHealthScore": 12.5,
    "totalAssetsUsd": 50000,
    "totalDebtsUsd": 400000,
    "lendingProtocols": [
      {
        "protocolName": "Aave V3",
        "chain": "ethereum",
        "totalValueUsd": -350000,
        "totalAssetsUsd": 50000,
        "totalDebtsUsd": 400000,
        "debtRatio": 8,
        "tokenCount": 2
      }
    ]
  }
}
```

---

## Endpoint 3: GET /api/portfolio/metrics/:walletAddress

### Request
```bash
curl http://localhost:3000/api/portfolio/metrics/0x4062b997279de7213731dbe00485722a26718892
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x4062b997279de7213731dbe00485722a26718892",
    "staking": {
      "totalStakingTvlUsd": 75000,
      "totalRewardsUsd": 2100,
      "stakingProtocols": [
        {
          "protocolName": "Lido",
          "chain": "ethereum",
          "totalValueUsd": 75000,
          "totalAssetsUsd": 75000,
          "totalRewardsUsd": 2100,
          "tokenCount": 1
        }
      ],
      "message": "Note: Sustained staking days calculation requires historical tracking..."
    },
    "lending": {
      "borrowerHealthScore": 100,
      "totalAssetsUsd": 100000,
      "totalDebtsUsd": 0,
      "lendingProtocols": [
        {
          "protocolName": "Aave V3",
          "chain": "ethereum",
          "totalValueUsd": 100000,
          "totalAssetsUsd": 100000,
          "totalDebtsUsd": 0,
          "debtRatio": 0,
          "tokenCount": 2
        }
      ]
    },
    "timestamp": "2024-11-14T14:37:45.123Z"
  }
}
```

---

## Health Score Interpretation

### Score Ranges
| Score | Status | Interpretation |
|-------|--------|-----------------|
| 100 | Perfect | No debt or fully hedged |
| 75-99 | Excellent | Assets >> Debts, very safe |
| 50-74 | Good | Assets > Debts, comfortable margin |
| 25-49 | Caution | Assets approaching debts, reduce leverage |
| 1-24 | Warning | Assets < 2x debts, high risk of liquidation |
| 0 | Critical | No assets but has debt, immediate risk |

### Formula Details
```
Health Score = min((total_assets_usd / total_debts_usd) / 2 * 100, 100)

Examples:
- Assets: $100,000, Debts: $50,000 → Ratio: 2.0 → Score: 100
- Assets: $100,000, Debts: $100,000 → Ratio: 1.0 → Score: 50
- Assets: $100,000, Debts: $200,000 → Ratio: 0.5 → Score: 25
- Assets: $0, Debts: $100,000 → Score: 0 (critical)
- Assets: $100,000, Debts: $0 → Score: 100 (perfect)
```

---

## Common Scenarios

### Scenario 1: Pure Staker (No Lending)
```json
{
  "staking": {
    "totalStakingTvlUsd": 50000,
    "stakingProtocols": [{"protocolName": "Lido", ...}]
  },
  "lending": {
    "borrowerHealthScore": 100,
    "totalAssetsUsd": 0,
    "totalDebtsUsd": 0,
    "lendingProtocols": []
  }
}
```

### Scenario 2: Active Borrower with Good Health
```json
{
  "staking": {
    "totalStakingTvlUsd": 100000,
    "stakingProtocols": [...]
  },
  "lending": {
    "borrowerHealthScore": 75,
    "totalAssetsUsd": 200000,
    "totalDebtsUsd": 100000,
    "lendingProtocols": [...]
  }
}
```

### Scenario 3: Risk Position (Needs Attention)
```json
{
  "borrowerHealthScore": 20,
  "totalAssetsUsd": 50000,
  "totalDebtsUsd": 400000,
  "message": "⚠️ High risk position - consider reducing debt"
}
```

---

## Error Cases

### Missing API Key
```json
{
  "success": false,
  "error": "Failed to fetch staking metrics",
  "message": "Failed to fetch portfolio DeFi holdings: API Error: 401 Unauthorized"
}
```

### Invalid Wallet Address
```json
{
  "success": false,
  "error": "Invalid wallet address"
}
```

### Wallet with No DeFi Activity
```json
{
  "success": true,
  "data": {
    "totalStakingTvlUsd": 0,
    "stakingProtocols": [],
    "totalRewardsUsd": 0
  }
}
```

### Network Error
```json
{
  "success": false,
  "error": "Failed to fetch lending metrics",
  "message": "Failed to fetch portfolio DeFi holdings: API Error: Network timeout"
}
```

