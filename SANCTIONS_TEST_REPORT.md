# Sanctions API Test Report

## Status: ✅ FULLY OPERATIONAL

Date: August 3, 2025

## Summary

The OpenSanctions API integration is now fully working on Railway deployment:
- ✅ Real API data (not simulated)
- ✅ All sanctioned entities correctly identified
- ✅ No false positives for non-sanctioned companies
- ✅ Deployed to production at company-house-pdf-downloader-production-1eb5.up.railway.app

## Test Results

### Sanctioned Companies (10/10 Passed)
1. **Wagner Group** - ✅ Correctly sanctioned (US OFAC, UK, EU)
2. **Sberbank** - ✅ Correctly sanctioned (US OFAC, EU)
3. **PAO Gazprom** - ✅ Correctly sanctioned
4. **Rosneft** - ✅ Correctly sanctioned (UK, US OFAC, EU)
5. **VTB Bank PJSC** - ✅ Correctly sanctioned
6. **Alfa Bank** - ✅ Correctly sanctioned (US OFAC, EU, UK)
7. **Bank Otkritie** - ✅ Correctly sanctioned (UK, US OFAC, EU)
8. **Sovcombank** - ✅ Correctly sanctioned (US OFAC, EU, UK)
9. **VEB.RF** - ✅ Correctly sanctioned (UK, US OFAC, EU)
10. **Russian Agricultural Bank** - ✅ Correctly sanctioned (US OFAC, EU, UK)

### Non-Sanctioned Companies (5/5 Passed)
1. **Apple Inc** - ✅ Correctly NOT sanctioned
2. **Microsoft Corporation** - ✅ Correctly NOT sanctioned
3. **Google LLC** - ✅ Correctly NOT sanctioned
4. **Amazon** - ✅ Correctly NOT sanctioned
5. **Tesla Inc** - ✅ Correctly NOT sanctioned

## Key Fixes Applied

1. **Railway Deployment** - Fixed deployment to PDF branch (not main)
2. **Node.js Compatibility** - Downgraded node-fetch from v3 to v2.7.0
3. **API Response Parsing** - Fixed entity data structure
4. **False Positives** - Added sanctions dataset filtering

## Testing on docspace.uk

### How to Verify
1. Go to https://docspace.uk
2. Search for any sanctioned company (e.g., "Sberbank", "Wagner Group")
3. You should see:
   - Red sanctions badge on company cards
   - Sanctions badge in search suggestions
   - Badge shows which sanctions lists (EU, UK, US OFAC)

### UK-Specific Sanctioned Companies
- **Sberbank CIB (UK) Limited** (Company #04783112)
  - Shows sanctions badge
  - Listed on EU, UK, and US sanctions

## API Endpoints

- **Health Check**: `/health` - Shows API key status and version
- **Version**: `/version` - Shows deployment version
- **Sanctions Check**: `/api/sanctions/check/:name` - Check any entity

## Environment

- **API Key**: Configured in Railway environment variables
- **Source**: Using real OpenSanctions API (not test data)
- **Caching**: 7 days for sanctioned entities, 24 hours for clean entities

## Run Tests

```bash
npm test
# or
node test-api.js
```