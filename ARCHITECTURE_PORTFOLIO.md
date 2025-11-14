# Portfolio API Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Applications                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP REST Calls
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Express Routes                                │
│                   (src/routes/portfolioRoute.ts)                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ GET /api/portfolio/staking/:walletAddress                      │ │
│  │ GET /api/portfolio/lending/:walletAddress                      │ │
│  │ GET /api/portfolio/metrics/:walletAddress                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Calls service methods
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Service Layer                                   │
│               (src/services/portfolioService.ts)                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ PortfolioService                                               │ │
│  │ ├── getStakingMetrics()                                        │ │
│  │ │   └── Filters staking positions                             │ │
│  │ │       └── Aggregates TVL and rewards                        │ │
│  │ ├── getLendingMetrics()                                        │ │
│  │ │   └── Identifies lending protocols                          │ │
│  │ │       └── Calculates health score                           │ │
│  │ └── getPortfolioMetrics()                                      │ │
│  │     └── Combines both metrics                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Uses client to fetch API data
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API Client                                    │
│                (src/services/nansenClient.ts)                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ NansenClient                                                   │ │
│  │ ├── getPortfolioDefiHoldings()                                 │ │
│  │ └── getPortfolioDefiHoldingsHistory()                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP POST
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Nansen API                                      │
│              https://api.nansen.ai                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ POST /api/v1/portfolio/defi-holdings                           │ │
│  │   Request: { wallet_address: "0x..." }                         │ │
│  │   Response: { summary, protocols[], tokens[] }                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Staking Metrics Request Flow

```
Client Request
    │
    ▼
GET /api/portfolio/staking/0x1234...
    │
    ▼
Router: Validate wallet address
    │
    ├─ Invalid? ──▶ Return 400 error
    │
    ├─ Valid? ──▶ portfolioService.getStakingMetrics()
    │              │
    │              ▼
    │          nansenClient.getPortfolioDefiHoldings()
    │              │
    │              ▼
    │          POST https://api.nansen.ai/api/v1/portfolio/defi-holdings
    │              │
    │              ▼
    │          Response: { protocols[], summary }
    │              │
    │              ▼
    │          Filter protocols by position_type: 'staking'
    │              │
    │              ▼
    │          Aggregate TVL and rewards
    │              │
    │              ▼
    │          Return StakingMetrics object
    │
    ▼
Route Handler: Return { success: true, data: metrics }
    │
    ▼
Client: Receives staking analysis
```

### Lending Metrics Request Flow

```
Client Request
    │
    ▼
GET /api/portfolio/lending/0x1234...
    │
    ▼
Router: Validate wallet address
    │
    ├─ Invalid? ──▶ Return 400 error
    │
    ├─ Valid? ──▶ portfolioService.getLendingMetrics()
    │              │
    │              ▼
    │          nansenClient.getPortfolioDefiHoldings()
    │              │
    │              ▼
    │          Response: { protocols[], summary }
    │              │
    │              ▼
    │          Extract totalAssetsUsd, totalDebtsUsd from summary
    │              │
    │              ▼
    │          Filter protocols where debts > 0
    │              │
    │              ▼
    │          Calculate health score
    │          health = min((assets / debts) / 2 * 100, 100)
    │              │
    │              ▼
    │          Build LendingMetrics object
    │
    ▼
Route Handler: Return { success: true, data: metrics }
    │
    ▼
Client: Receives lending analysis with health score
```

## Type Hierarchy

```
NansenApiResponse<T>
├── data: T
├── status: number
└── message?: string

NansenPortfolioDefiHoldings
├── summary: NansenPortfolioSummary
│   ├── total_value_usd: number
│   ├── total_assets_usd: number
│   ├── total_debts_usd: number
│   ├── total_rewards_usd?: number
│   ├── token_count: number
│   └── protocol_count: number
└── protocols: NansenPortfolioProtocol[]
    └── NansenPortfolioProtocol
        ├── protocol_name: string
        ├── chain: string
        ├── total_value_usd: number
        ├── total_assets_usd: number
        ├── total_debts_usd: number
        ├── total_rewards_usd?: number
        └── tokens: NansenPortfolioToken[]
            └── NansenPortfolioToken
                ├── address: string
                ├── symbol: string
                ├── amount: string
                ├── value_usd: number
                └── position_type?: string

StakingMetrics
├── totalStakingTvlUsd: number
├── stakingProtocols: StakingProtocol[]
│   └── StakingProtocol
│       ├── protocolName: string
│       ├── chain: string
│       ├── totalValueUsd: number
│       ├── totalAssetsUsd: number
│       ├── totalRewardsUsd?: number
│       └── tokenCount: number
├── totalRewardsUsd: number
└── message?: string

LendingMetrics
├── borrowerHealthScore: number
├── totalAssetsUsd: number
├── totalDebtsUsd: number
├── lendingProtocols: LendingProtocol[]
│   └── LendingProtocol
│       ├── protocolName: string
│       ├── chain: string
│       ├── totalValueUsd: number
│       ├── totalAssetsUsd: number
│       ├── totalDebtsUsd: number
│       ├── debtRatio: number
│       ├── healthFactor?: number
│       └── tokenCount: number
└── message?: string

PortfolioMetrics
├── walletAddress: string
├── staking: StakingMetrics
├── lending: LendingMetrics
└── timestamp: string
```

## Processing Logic

### Staking Extraction Algorithm

```typescript
for each protocol in portfolioResponse.protocols:
  stakingTokens = filter tokens where position_type === 'staking'
  
  if stakingTokens.length > 0:
    protocolTVL = sum(stakingTokens[].value_usd)
    rewards = protocol.total_rewards_usd || 0
    
    add to stakingProtocols:
      {
        protocolName: protocol.protocol_name,
        chain: protocol.chain,
        totalValueUsd: protocolTVL,
        totalAssetsUsd: protocol.total_assets_usd,
        totalRewardsUsd: rewards,
        tokenCount: stakingTokens.length
      }
    
    totalStakingTvlUsd += protocolTVL
    totalRewardsUsd += rewards

if stakingProtocols.empty:
  // Fallback: Include all protocols (no explicit staking tags)
  for each protocol:
    add all protocols as potential staking positions

return {
  totalStakingTvlUsd,
  stakingProtocols,
  totalRewardsUsd,
  message: "Sustained staking days..."
}
```

### Lending Metrics Calculation

```typescript
Extract from summary:
  totalAssetsUsd = portfolio.summary.total_assets_usd
  totalDebtsUsd = portfolio.summary.total_debts_usd

for each protocol in portfolioResponse.protocols:
  if protocol.total_debts_usd > 0 OR protocol.total_assets_usd > 0:
    debtRatio = protocol.total_debts_usd / max(protocol.total_assets_usd, ε)
    
    add to lendingProtocols:
      {
        protocolName: protocol.protocol_name,
        chain: protocol.chain,
        totalValueUsd: protocol.total_value_usd,
        totalAssetsUsd: protocol.total_assets_usd,
        totalDebtsUsd: protocol.total_debts_usd,
        debtRatio: debtRatio,
        tokenCount: protocol.tokens?.length || 0
      }

Calculate health score:
  if totalDebtsUsd === 0:
    healthScore = 100
  else if totalAssetsUsd === 0:
    healthScore = 0
  else:
    ratio = totalAssetsUsd / totalDebtsUsd
    normalizedScore = (ratio / 2) * 100
    healthScore = min(normalizedScore, 100)

return {
  borrowerHealthScore,
  totalAssetsUsd,
  totalDebtsUsd,
  lendingProtocols
}
```

## Error Handling Strategy

```
Request Received
    │
    ▼
Input Validation
├─ Invalid input? ──▶ Return 400 Bad Request
│
├─ Valid? ──▶ Call Service
│             │
│             ▼
│         Try block
│         │
│         ├─ Success? ──▶ Process response
│         │               │
│         │               ▼
│         │           Transform data
│         │           │
│         │           ▼
│         │           Return 200 OK
│         │
│         └─ Error? ──▶ Catch block
│                       │
│                       ▼
│                   Wrap error message
│                       │
│                       ▼
│                   Return 500 error
```

## Testing Architecture

```
portfolioService.test.ts
├── getStakingMetrics()
│   ├── Explicit staking positions
│   ├── Fallback to all protocols
│   ├── Empty protocols
│   └── Error handling
├── getLendingMetrics()
│   ├── Healthy position
│   ├── No debt scenario
│   ├── Critical position
│   ├── Protocol filtering
│   └── Error handling
├── getPortfolioMetrics()
│   ├── Combined metrics
│   └── Error handling
└── Health score calculations
    ├── Perfect health (score 100)
    ├── Good health (score 50-99)
    ├── Critical health (score 0)
    └── Edge cases

portfolioRoute.test.ts
├── GET /staking/:walletAddress
│   ├── Valid wallet
│   ├── Invalid wallet
│   └── Error handling
├── GET /lending/:walletAddress
│   ├── Valid wallet
│   ├── Invalid wallet
│   └── Error handling
└── GET /metrics/:walletAddress
    ├── Combined response
    └── Error handling
```

## Deployment Considerations

### Environment Variables Required
```
NANSEN_API_KEY=<api_key>
NANSEN_API_BASE_URL=https://api.nansen.ai
PORT=3000
NODE_ENV=production
```

### Performance Notes
- Each request makes 1 API call to Nansen
- Response time: ~500ms-2s depending on Nansen API latency
- Rate limiting: Dependent on Nansen plan tier
- No caching implemented (stateless design)

### Scalability Options
1. Add caching layer (Redis)
2. Batch wallet requests
3. Implement historical snapshots table
4. Add database for trend analysis
5. Queue system for bulk requests

## Security Considerations
- API key stored in environment variables (never in code)
- Input validation on all wallet addresses
- Error messages don't leak sensitive data
- CORS enabled for cross-origin requests
- Standard HTTP error codes used

