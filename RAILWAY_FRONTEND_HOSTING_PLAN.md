# Railway Frontend Hosting Plan for SEO URLs

## Overview
Since you're already paying for Railway for the proxy server, you can use it to host the frontend too and get real SEO URLs without additional cost.

## Current Setup
- **Frontend**: GitHub Pages (free, but limited to hash routing)
- **Backend/Proxy**: Railway (paid, handling API requests)

## Proposed Setup
- **Both Frontend + Backend**: Railway (single paid service, full control)

## Benefits
1. **No additional cost** - Already paying for Railway
2. **Real SEO URLs** - Full server-side routing control
3. **Single deployment** - Frontend and backend in one place
4. **Better performance** - No cross-origin requests
5. **Simpler architecture** - Everything in one service

## Implementation Plan

### Phase 1: Prepare the Code Structure

#### 1.1 Reorganize Project Structure
```
/
├── server/
│   └── proxy-server.js (existing)
├── public/
│   ├── index.html
│   ├── 404.html
│   └── (other static files)
├── package.json
└── server.js (new - combines everything)
```

#### 1.2 Create Combined Server (server.js)
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Import existing proxy routes
const proxyRoutes = require('./server/proxy-server.js');

// Use proxy routes
app.use('/api', proxyRoutes);

// Serve static files
app.use(express.static('public'));

// Handle all company routes - serve index.html for client-side routing
app.get('/company/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

#### 1.3 Update package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Phase 2: Update Frontend Code

#### 2.1 Update Router to Handle Clean URLs
```javascript
// In index.html - update the routing logic
function initRouter() {
    // Check for clean URLs first
    const path = window.location.pathname;
    
    if (path.startsWith('/company/')) {
        // Extract company number from path
        const segments = path.split('/');
        const lastSegment = segments[segments.length - 1];
        const companyNumber = lastSegment.split('-').pop();
        
        // Load company directly
        loadCompany(companyNumber);
    } else if (window.location.hash) {
        // Fallback for old hash URLs
        handleHashChange();
    }
}

// Update all internal links to use clean URLs
function generateCompanyUrl(companyNumber, companyName) {
    return `/company/${companyNumber}`;
}
```

#### 2.2 Update API Calls
Change all API calls to use relative URLs:
```javascript
// Before: https://company-house-pdf-downloader-production-1eb5.up.railway.app/api/proxy/
// After: /api/proxy/
```

### Phase 3: Test Locally

#### 3.1 Run Combined Server Locally
```bash
npm install
npm run dev
```

#### 3.2 Test All Features
- [ ] Homepage loads
- [ ] Search works
- [ ] `/company/09051662` loads directly
- [ ] API proxy calls work
- [ ] File downloads work

### Phase 4: Deploy to Railway

#### 4.1 Create New Railway Service
1. Create new service in Railway: "docspace-frontend"
2. Connect to same GitHub repo
3. Set root directory if needed
4. Deploy

#### 4.2 Environment Variables
Copy all environment variables from proxy server:
- API keys
- Database URLs
- Any other secrets

#### 4.3 Configure Domain
1. Add custom domain in Railway
2. Get Railway's DNS records
3. Update Cloudflare DNS

### Phase 5: Migration Day

#### 5.1 Pre-Migration (Day Before)
1. Deploy combined app to Railway
2. Test on Railway's generated URL
3. Ensure everything works

#### 5.2 DNS Switch (5 minutes)
1. Update Cloudflare DNS:
   - Remove GitHub Pages records
   - Add Railway's records
2. Wait for propagation

#### 5.3 Post-Migration
1. Test all functionality
2. Monitor for errors
3. Submit new sitemap to Google

### Phase 6: Cleanup

#### 6.1 After 1 Week
1. Remove GitHub Pages configuration
2. Archive old proxy-only server
3. Update documentation

## Alternative: Two Services on Railway

If you prefer separation of concerns:

### Setup
1. **Service 1**: Frontend (serves HTML/JS/CSS)
2. **Service 2**: Backend API (existing proxy)

### Frontend Service (server.js)
```javascript
const express = require('express');
const app = express();

// Serve static files
app.use(express.static('public'));

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 3000);
```

### Benefits
- Clean separation
- Can scale independently
- Easier debugging

### Drawbacks
- Two services to manage
- Possible CORS issues
- Slightly more complex

## Cost Analysis

### Current Costs
- GitHub Pages: $0
- Railway (Proxy): ~$5-20/month

### After Migration
- Railway (Everything): Same ~$5-20/month
- No additional costs

### Resource Usage
- Current proxy uses minimal resources
- Adding static file serving adds negligible load
- Well within Railway's limits

## Rollback Plan

### If Issues Occur
1. **Immediate**: Switch DNS back to GitHub Pages (2 minutes)
2. **Keep Railway proxy running**: No API disruption
3. **Fix issues**: Debug without affecting production
4. **Retry**: When ready

## Benefits Summary

1. **SEO**: Real URLs like `/company/09051662`
2. **Performance**: Everything on same server
3. **Simplicity**: One deployment, one service
4. **Cost**: No additional expense
5. **Control**: Full server-side routing

## Timeline

- **Day 1**: Set up local development
- **Day 2**: Update frontend for clean URLs
- **Day 3**: Deploy to Railway test instance
- **Day 4**: Test thoroughly
- **Day 5**: Switch DNS during low traffic

## Example nginx.conf (if using Railway's static sites)
```nginx
location / {
    try_files $uri /index.html;
}

location /api {
    proxy_pass http://your-api-service;
}
```

This gives you the same SEO benefits as Vercel but uses the service you're already paying for!