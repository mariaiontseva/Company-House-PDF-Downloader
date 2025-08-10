# Cloudflare Worker Setup for SEO URLs

## Safe Deployment Steps

### 1. Test on a Route First
Instead of applying to entire domain, test on specific path:

1. Log in to Cloudflare Dashboard
2. Go to Workers & Pages
3. Create new Worker
4. Name it: `docspace-seo-urls`
5. Paste the code from `cloudflare-worker-safe.js`
6. Save and Deploy

### 2. Add Route for Testing
1. Go to your domain in Cloudflare
2. Go to Workers Routes
3. Add route: `docspace.uk/company/test-*`
4. Select worker: `docspace-seo-urls`
5. Save

This will ONLY affect URLs starting with `/company/test-`

### 3. Test URLs
Test these URLs (they won't affect other pages):
- https://docspace.uk/company/test-company-12345678
- https://docspace.uk/company/test-tesco-00445790

### 4. Monitor
- Check Cloudflare Analytics
- Monitor for any errors
- Verify normal pages still work

### 5. Gradual Rollout
If tests pass:
1. Add route for one company: `docspace.uk/company/tesco-*`
2. Test thoroughly
3. Then add full route: `docspace.uk/company/*`

### 6. Emergency Rollback
If anything breaks:
1. Go to Workers Routes
2. Delete the route
3. Changes revert instantly

## Important Notes
- Worker only handles `/company/*` URLs
- All other URLs pass through unchanged
- Built-in error handling and fallbacks
- No changes needed to existing code