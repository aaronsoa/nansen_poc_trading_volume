# Quick Start: Portfolio Analysis Endpoints

## What's New?

Three new endpoints for analyzing staking and lending positions in DeFi protocols:

1. **GET `/api/portfolio/staking/:walletAddress`** - Staking metrics
2. **GET `/api/portfolio/lending/:walletAddress`** - Lending/borrowing metrics  
3. **GET `/api/portfolio/metrics/:walletAddress`** - Combined portfolio view

## Starting the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The server will log all available endpoints on startup, including the new portfolio endpoints.

## Example Requests

### Check Staking Portfolio
```bash
curl http://localhost:3000/api/portfolio/staking/0x1234567890abcdef
```

**Returns:**
- Total staking TVL
- Per-protocol breakdown (Lido, Rocket Pool, etc.)
- Accumulated rewards
- Guidance on tracking staking duration

### Check Lending/Borrowing Health
```bash
curl http://localhost:3000/api/portfolio/lending/0x1234567890abcdef
```

**Returns:**
- Borrower health score (0-100)
- Total assets supplied
- Total debt
- Per-protocol positions and debt ratios

### Full Portfolio Snapshot
```bash
curl http://localhost:3000/api/portfolio/metrics/0x1234567890abcdef
```

**Returns:**
- Combined staking + lending data
- Current timestamp
- All metrics in one request

## Understanding Health Scores

**Borrower Health Score (0-100):**
- **100** = Perfect health (no debt)
- **75-99** = Excellent (very safe position)
- **50-74** = Good (comfortable margin)
- **25-49** = Caution needed (approaching risk)
- **1-24** = High risk (liquidation possible)
- **0** = Critical (debt with no assets)

### Calculation
```
Health = min((assets / debts) / 2 * 100, 100)
```

**Example:**
- Assets: $100,000, Debts: $50,000 → Health = 100 (excellent)
- Assets: $100,000, Debts: $100,000 → Health = 50 (good)
- Assets: $100,000, Debts: $200,000 → Health = 25 (caution)

## Response Format

All endpoints return:
```json
{
  "success": true,
  "data": {
    // endpoint-specific data
  }
}
```

Or on error:
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message (optional)"
}
```

## Implementation Details

### Staking Metrics
- Extracts staking positions from Nansen Portfolio API
- Identifies positions with `position_type: 'staking'`
- Sums TVL and rewards across protocols
- Provides per-protocol breakdown

**Note on Sustained Staking Days:**
The API returns current balances. To track "staked X amount for N consecutive days":
1. Save responses periodically (daily/hourly)
2. Store with timestamps
3. Implement logic to count consecutive days meeting your threshold

### Lending Metrics
- Extracts lending positions (supplied assets)
- Calculates borrowing exposure
- Computes normalized health score
- Per-protocol debt ratios

**Key Metrics:**
- `totalAssetsUsd` - All supplied assets across protocols
- `totalDebtsUsd` - Total borrowed amount
- `debtRatio` - Per-protocol borrowed/supplied ratio
- `borrowerHealthScore` - Normalized 0-100 health indicator

## Testing

Unit tests are included. To run:
```bash
npm test
```

Tests cover:
- Staking metric extraction
- Lending metric calculations
- Health score edge cases
- Error handling
- Input validation

## Files Overview

### Core Implementation
- `src/services/nansenClient.ts` - Extended with Portfolio API methods
- `src/services/portfolioService.ts` - Business logic for calculations
- `src/routes/portfolioRoute.ts` - REST endpoint handlers
- `src/index.ts` - Routes registration

### Tests
- `src/services/__tests__/portfolioService.test.ts` - Service tests
- `src/routes/__tests__/portfolioRoute.test.ts` - Route tests

### Documentation
- `README.md` - Full documentation with examples
- `PORTFOLIO_API_EXAMPLES.md` - Response examples for all scenarios
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details

## Common Use Cases

### Monitor Staking Rewards
```bash
curl http://localhost:3000/api/portfolio/staking/0xmyaddress
# Check totalRewardsUsd and track growth
```

### Risk Assessment
```bash
curl http://localhost:3000/api/portfolio/lending/0xmyaddress
# Check borrowerHealthScore - alert if < 50
```

### Portfolio Dashboard
```bash
curl http://localhost:3000/api/portfolio/metrics/0xmyaddress
# Get both staking and lending in one request
```

### Track Multiple Wallets
```bash
for wallet in 0xaddr1 0xaddr2 0xaddr3; do
  curl http://localhost:3000/api/portfolio/metrics/$wallet
done
```

## Troubleshooting

**"Invalid wallet address"** → Check wallet format (0x followed by 40 hex chars)

**"API Error: 401"** → Verify NANSEN_API_KEY in .env

**"API Error: 404"** → Portfolio endpoint may not be available in your Nansen tier

**Empty protocols array** → Wallet may have no DeFi activity

## Next Steps

1. **Historical Tracking** - Store snapshots to track sustained staking
2. **Alerting** - Send alerts when health score drops below threshold
3. **Aggregation** - Track multiple wallets and portfolio totals
4. **Filtering** - Add protocol/chain specific queries
5. **Time-series** - Store and analyze trends over time

## Support

For issues or questions:
1. Check README.md for full documentation
2. Review test files for usage examples
3. Check PORTFOLIO_API_EXAMPLES.md for response examples
4. Verify Nansen API tier supports Portfolio endpoints

