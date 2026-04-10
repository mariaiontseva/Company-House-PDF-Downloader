# Vercel SEO URL Migration Plan for DocSpace

## Overview
Migrate from GitHub Pages with hash-based routing to Vercel with real SEO-friendly URLs.

## Benefits of Vercel
- Native support for Single Page Applications with client-side routing
- Automatic URL rewrites (no hash needed)
- Built-in Edge Functions (similar to Cloudflare Workers)
- Free tier includes custom domains
- Automatic HTTPS
- Global CDN

## Phase 1: Preparation (No changes to production)

### 1.1 Create Vercel Account
- Sign up at vercel.com
- Connect GitHub account
- Do NOT import the project yet

### 1.2 Prepare the Codebase
1. Create a new branch: `vercel-seo`
2. Add `vercel.json` configuration file:
```json
{
  "rewrites": [
    {
      "source": "/company/:path*",
      "destination": "/index.html"
    },
    {
      "source": "/",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 1.3 Update index.html for Clean URLs
Modify the router to handle both hash and clean URLs:
```javascript
// Check if we're on a company page (clean URL)
if (window.location.pathname.startsWith('/company/')) {
    const companyNumber = extractCompanyNumber(window.location.pathname);
    loadCompany(companyNumber);
} else if (window.location.hash.startsWith('#company/')) {
    // Fallback for hash URLs
    const companyNumber = window.location.hash.split('/')[1];
    loadCompany(companyNumber);
}
```

## Phase 2: Test Deployment on Vercel

### 2.1 Deploy to Vercel (Test URL)
1. Import project to Vercel
2. Deploy from `vercel-seo` branch
3. Get test URL: `docspace-abc123.vercel.app`

### 2.2 Test Everything
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] `/company/09051662` loads the company directly
- [ ] Navigation between companies works
- [ ] All API calls work (proxy server connection)
- [ ] Authentication works

### 2.3 Add Redirects for Old URLs
Add to `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/#company/:number",
      "destination": "/company/:number",
      "permanent": true
    }
  ]
}
```

## Phase 3: DNS Migration

### 3.1 Prepare DNS Records
1. Note current Cloudflare DNS settings
2. Prepare new DNS records for Vercel:
   - Remove GitHub Pages A records
   - Add Vercel CNAME: `cname.vercel-dns.com`

### 3.2 Add Custom Domain in Vercel
1. Go to Vercel project settings
2. Add `docspace.uk` as custom domain
3. Vercel will provide DNS instructions

### 3.3 Migration Window (5 minutes downtime)
1. Update DNS in Cloudflare to point to Vercel
2. Wait for propagation (usually instant with Cloudflare)
3. Test immediately

## Phase 4: Post-Migration

### 4.1 Update All Internal Links
Replace all hash URLs with clean URLs:
- Footer links
- Popular companies section  
- Search result links

### 4.2 Update Sitemap
Generate new sitemap with clean URLs:
```
https://docspace.uk/company/09051662
https://docspace.uk/company/00445790
```

### 4.3 Submit to Google
- Submit new sitemap
- Request re-indexing of key pages

## Phase 5: Enhanced SEO Features

### 5.1 Server-Side Rendering (Optional)
Use Vercel Edge Functions for dynamic meta tags:
```javascript
// api/company/[number].js
export default function handler(req, res) {
  const { number } = req.query;
  // Fetch company data
  // Return HTML with proper meta tags
}
```

### 5.2 Add Structured Data
Include JSON-LD for each company page

### 5.3 Performance Optimizations
- Enable Vercel Analytics
- Optimize images with Vercel Image Optimization
- Use Edge caching

## Rollback Plan

If anything goes wrong:

### Immediate (< 2 minutes)
1. Change DNS back to GitHub Pages
2. Site returns to working state with hash URLs

### Clean Rollback (< 10 minutes)
1. Remove custom domain from Vercel
2. Re-add domain to GitHub Pages
3. Restore original DNS

## Cost Analysis

### Vercel Free Tier Includes:
- 100GB bandwidth/month (current site uses ~10GB)
- Unlimited sites
- Custom domains
- SSL certificates
- Edge Functions (100K requests/month)

### When to Upgrade:
- Over 100GB bandwidth
- Need more build minutes
- Want analytics

## Testing Checklist

Before going live:
- [ ] All company pages load with clean URLs
- [ ] Search functionality works
- [ ] Authentication works
- [ ] Proxy server connections work
- [ ] Mobile version works
- [ ] No console errors
- [ ] Meta tags update dynamically
- [ ] Old hash URLs redirect to clean URLs
- [ ] 404 page works for invalid companies

## Timeline

- **Day 1**: Create Vercel account, prepare code
- **Day 2**: Deploy to test URL, thorough testing
- **Day 3**: If tests pass, migrate DNS during low-traffic period
- **Day 4**: Monitor, fix any issues
- **Day 5**: Submit to search engines

## Example URL Transformations

| Current URL | New URL |
|------------|---------|
| `docspace.uk/#company/09051662` | `docspace.uk/company/09051662` |
| `docspace.uk/#company/mitocholine-limited-09051662` | `docspace.uk/company/mitocholine-limited-09051662` |

## Benefits After Migration

1. **SEO**: Each company gets indexed as a separate page
2. **Sharing**: Clean URLs in social media previews  
3. **Analytics**: Better tracking of page views
4. **Performance**: Vercel's edge network is faster
5. **Future-proof**: Ready for server-side features