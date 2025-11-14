# Documentation Index

## Overview Files

### README.md
The main project documentation. **START HERE** for comprehensive information about:
- Project overview and features
- Installation and setup
- All API endpoints (trading volume, Hyperliquid, portfolio)
- Response format examples
- Project structure
- Implementation notes

**Key sections:**
- Features: Lists all three feature sets
- Usage: Complete API documentation
- Project Structure: File organization
- Notes: Important implementation details

---

## Portfolio Feature Documentation

### QUICK_START_PORTFOLIO.md
**Read this next** if you just want to get started with the portfolio endpoints.
- What's new (3 endpoints)
- Starting the server
- Example requests (copy-paste ready)
- Understanding health scores
- Common use cases
- Troubleshooting

**Best for:** Getting started quickly, common scenarios

### PORTFOLIO_API_EXAMPLES.md
**Detailed response examples** for all three endpoints and scenarios.
- Success responses
- Error responses
- Health score interpretation table
- Common scenarios (pure staker, borrower, risky position)
- Edge cases

**Best for:** Understanding what responses look like, testing

### ARCHITECTURE_PORTFOLIO.md
**System design and algorithms** for the portfolio implementation.
- System overview diagram
- Data flow diagrams (staking and lending)
- Type hierarchy
- Processing algorithms with pseudocode
- Error handling strategy
- Testing architecture
- Deployment considerations

**Best for:** Understanding the implementation, future enhancements

### IMPLEMENTATION_SUMMARY.md
**Technical details** of what was implemented.
- Overview of changes
- Service layer description
- Route definitions
- Test coverage
- Files created/modified
- Features explained
- Next steps for future enhancements

**Best for:** Understanding what code was added, code review

---

## Getting Started Path

### Path 1: I just want to use the API (5 minutes)
1. Read: **QUICK_START_PORTFOLIO.md**
2. Reference: **PORTFOLIO_API_EXAMPLES.md** (responses)
3. Start server and test

### Path 2: I want to understand the system (30 minutes)
1. Read: **README.md** (Portfolio section)
2. Study: **ARCHITECTURE_PORTFOLIO.md** (diagrams and algorithms)
3. Review: **IMPLEMENTATION_SUMMARY.md** (what was built)
4. Explore: Test files for usage patterns

### Path 3: I want to contribute/enhance (1 hour)
1. Read: **IMPLEMENTATION_SUMMARY.md**
2. Study: **ARCHITECTURE_PORTFOLIO.md**
3. Review: **src/services/portfolioService.ts**
4. Review: **src/routes/portfolioRoute.ts**
5. Check: Test files for test patterns
6. Reference: **PORTFOLIO_API_EXAMPLES.md** for edge cases

---

## File Locations

### Endpoint Documentation

| Endpoint | Documentation | Examples |
|----------|---------------|----------|
| `/api/portfolio/staking/:walletAddress` | README.md § Staking | PORTFOLIO_API_EXAMPLES.md § Endpoint 1 |
| `/api/portfolio/lending/:walletAddress` | README.md § Lending | PORTFOLIO_API_EXAMPLES.md § Endpoint 2 |
| `/api/portfolio/metrics/:walletAddress` | README.md § Combined | PORTFOLIO_API_EXAMPLES.md § Endpoint 3 |

### Implementation Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/services/portfolioService.ts` | Business logic | 194 |
| `src/routes/portfolioRoute.ts` | REST endpoints | 95 |
| `src/services/__tests__/portfolioService.test.ts` | Service tests | 280+ |
| `src/routes/__tests__/portfolioRoute.test.ts` | Route tests | 200+ |

### Documentation Files

| File | Purpose | Best For |
|------|---------|----------|
| README.md | Full project docs | Reference, complete information |
| QUICK_START_PORTFOLIO.md | Getting started | New users, quick setup |
| PORTFOLIO_API_EXAMPLES.md | Response examples | Testing, understanding responses |
| ARCHITECTURE_PORTFOLIO.md | System design | Developers, contributions |
| IMPLEMENTATION_SUMMARY.md | What was built | Code review, understanding changes |
| DOCUMENTATION_INDEX.md | This file | Navigation, choosing what to read |

---

## Key Concepts Explained

### Health Score (0-100)
Normalized borrower health indicator.
- **100**: Perfect health (no debt)
- **75-99**: Excellent (assets much greater than debts)
- **50-74**: Good (assets greater than debts)
- **25-49**: Caution (assets approaching debts)
- **1-24**: Warning (assets less than 2x debts)
- **0**: Critical (no assets but has debt)

**Formula:** `health = min((assets / debts) / 2 * 100, 100)`

### Staking TVL (Total Value Locked)
Sum of all assets locked in staking protocols.
- **Includes:** Lido staked ETH, Rocket Pool rETH, solo staking, etc.
- **Per-protocol:** Individual breakdown available
- **Rewards:** Tracked separately

### Lending Metrics
Tracking of borrowed and supplied assets.
- **Assets:** Amount supplied to lending protocols
- **Debts:** Amount borrowed from protocols
- **Ratio:** Per-protocol debt/asset ratio
- **Health:** Overall borrower health score

### Sustained Staking Days
Not directly provided - requires historical tracking.
- **Solution:** Poll endpoint periodically, store snapshots
- **Calculation:** Count consecutive days where amount > threshold
- **Service message:** Includes guidance on implementation

---

## Common Questions

**Q: How do I get started?**
A: Read QUICK_START_PORTFOLIO.md, then follow the "Start the Server" section.

**Q: What does the health score mean?**
A: See "Health Score" section in PORTFOLIO_API_EXAMPLES.md or README.md.

**Q: How do I calculate sustained staking days?**
A: See "Sustained Staking Days" section in README.md Notes.

**Q: What if I get an error?**
A: Check "Error Cases" in PORTFOLIO_API_EXAMPLES.md.

**Q: How does the system work internally?**
A: See ARCHITECTURE_PORTFOLIO.md for detailed diagrams and algorithms.

**Q: Where's the test coverage?**
A: See test files in `src/services/__tests__/` and `src/routes/__tests__/`.

**Q: Can I filter by protocol?**
A: Not yet - see "Next Steps" in IMPLEMENTATION_SUMMARY.md.

**Q: Can I track historical data?**
A: Not yet - see "Historical Tracking" in Phase 2 enhancements.

---

## Documentation Updates

All documentation was created/updated on: **November 14, 2024**

### New Files Created
- QUICK_START_PORTFOLIO.md
- PORTFOLIO_API_EXAMPLES.md
- ARCHITECTURE_PORTFOLIO.md
- IMPLEMENTATION_SUMMARY.md
- DOCUMENTATION_INDEX.md (this file)

### Files Updated
- README.md (added Portfolio section)

---

## Support & Troubleshooting

### Issue: "Invalid wallet address"
- **Check:** Wallet format should be 0x followed by 40 hex characters
- **Fix:** Use valid Ethereum wallet address
- **Ref:** QUICK_START_PORTFOLIO.md § Troubleshooting

### Issue: "API Error: 401"
- **Check:** NANSEN_API_KEY in .env file
- **Fix:** Add valid Nansen API key
- **Ref:** QUICK_START_PORTFOLIO.md § Setup

### Issue: "API Error: 404"
- **Check:** Your Nansen API tier supports Portfolio endpoints
- **Fix:** Check Nansen documentation for tier limitations
- **Ref:** README.md § Notes

### Issue: Empty response with all zeros
- **Check:** Wallet may have no DeFi activity
- **Expected:** Possible for new/inactive wallets
- **Ref:** PORTFOLIO_API_EXAMPLES.md § Wallet with No Activity

---

## Quick Reference

### API Endpoints
```
GET /api/portfolio/staking/:walletAddress
GET /api/portfolio/lending/:walletAddress
GET /api/portfolio/metrics/:walletAddress
```

### Start Server
```bash
npm run dev          # Development
npm run build        # Build
npm start            # Production
```

### Run Tests
```bash
npm test
```

### Key Files
```
src/services/portfolioService.ts   # Main logic
src/routes/portfolioRoute.ts       # Endpoints
src/services/__tests__/            # Tests
```

### Health Score Quick Reference
| Score | Status | Action |
|-------|--------|--------|
| 100 | Perfect | Hold position |
| 75-99 | Excellent | Maintain |
| 50-74 | Good | Monitor |
| 25-49 | Caution | Review position |
| 1-24 | Warning | Reduce leverage |
| 0 | Critical | Immediate action |

---

## What to Read When

**First time?** → QUICK_START_PORTFOLIO.md

**Testing?** → PORTFOLIO_API_EXAMPLES.md

**Contributing?** → ARCHITECTURE_PORTFOLIO.md

**Deep dive?** → IMPLEMENTATION_SUMMARY.md

**All details?** → README.md

**Lost?** → This file (DOCUMENTATION_INDEX.md)

