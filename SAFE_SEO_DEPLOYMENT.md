# Safe SEO URL Deployment Plan for Production

## Phase 1: Cloudflare Worker Setup (No Code Changes)

### Step 1: Create Worker
1. Log into Cloudflare Dashboard
2. Go to Workers & Pages > Create Application > Create Worker
3. Name: `docspace-seo-test`
4. Click "Quick Edit"
5. Paste code from `cloudflare-worker-seo.js`
6. Save and Deploy

### Step 2: Test with Single Company Route
1. Go to docspace.uk in Cloudflare > Workers Routes
2. Add Route: `docspace.uk/company/mitocholine-*`
3. Select Worker: `docspace-seo-test`
4. Save

**Test**: Visit `https://docspace.uk/company/mitocholine-limited-09051662`
- Should show Mitocholine company
- URL should stay as SEO URL
- Check page title updates

### Step 3: Monitor for 24 Hours
- Check Cloudflare Analytics
- Monitor error logs
- Ensure hash URLs still work: `/#company/09051662`

## Phase 2: Limited Rollout

### Step 1: Add More Test Routes
Add one route at a time:
```
docspace.uk/company/tesco-*
docspace.uk/company/revolut-*
docspace.uk/company/wise-*
```

### Step 2: Test Each Route
For each company, verify:
- [ ] SEO URL loads correctly
- [ ] Page title updates
- [ ] Meta description changes
- [ ] Company data displays
- [ ] Direct hash URL still works

## Phase 3: Code Updates (Optional Enhancements)

### Step 1: Update Search Results (Low Risk)
Add to your index.html after the searchCompany function:

```javascript
// Only update URL on production when showing company
if (window.location.hostname !== 'localhost' && companyData) {
    const seoUrl = generateCompanySEOUrl(
        companyData.company_number,
        companyData.company_name,
        detectIndustryFromSIC(companyData.sic_codes)
    );
    
    // Update URL without reload
    if (!window.location.pathname.startsWith('/company/')) {
        history.replaceState(
            { companyNumber: companyData.company_number },
            companyData.company_name,
            seoUrl
        );
    }
}
```

### Step 2: Test Locally First
1. Run local server
2. Search for a company
3. Verify URL updates (on localhost it won't)
4. Check no errors in console

## Phase 4: Full Rollout

### Step 1: Enable for All Companies
1. Update Worker Route to: `docspace.uk/company/*`
2. This enables ALL company SEO URLs

### Step 2: Update Internal Links
Once confirmed working, update:
- Popular companies section
- Footer links
- Search results

## Emergency Rollback Plan

If anything breaks:

### Immediate (< 1 minute):
1. Go to Cloudflare > Workers Routes
2. Delete the `docspace.uk/company/*` route
3. Site immediately reverts to hash URLs

### If Code Changes Cause Issues:
1. Remove the URL update code
2. Deploy immediately
3. Hash URLs continue working

## Testing Checklist

Before each phase:
- [ ] Test on local first
- [ ] Check mobile and desktop
- [ ] Verify search still works
- [ ] Test direct hash URLs
- [ ] Check page performance
- [ ] Monitor error logs

## Example URL Transformations

| Search Term | Old URL | New SEO URL |
|------------|---------|-------------|
| Mitocholine | `/#company/09051662` | `/company/mitocholine-limited-09051662` |
| Tesco | `/#company/00445790` | `/company/tesco-plc-retail-00445790` |
| Revolut | `/#company/09366592` | `/company/revolut-limited-fintech-09366592` |

## Benefits Once Deployed

1. **Google Indexing**: Each company gets its own indexed page
2. **Social Sharing**: Proper previews with company names
3. **Better Analytics**: Track which companies are viewed
4. **User Experience**: Clean, readable URLs
5. **SEO Value**: Keywords in URLs help rankings