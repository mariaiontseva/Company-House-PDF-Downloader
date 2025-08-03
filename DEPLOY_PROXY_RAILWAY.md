# Deploy Proxy Server to Railway

This guide will help you deploy the proxy server to Railway so sanctions work for everyone on the internet.

## Prerequisites
- Railway account (https://railway.app)
- Railway CLI installed (`npm install -g @railway/cli`)

## Step 1: Prepare for Deployment

1. Create a `package.json` in the root directory if not exists:
```json
{
  "name": "docspace-proxy-server",
  "version": "1.0.0",
  "description": "Proxy server for DocSpace UK - handles Companies House and Sanctions API",
  "main": "proxy-server.js",
  "scripts": {
    "start": "node proxy-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

2. Create a `.env` file for local development (don't commit this):
```
COMPANIES_HOUSE_API_KEY=your_api_key_here
MYSQL_HOST=your_mysql_host
MYSQL_PORT=your_mysql_port
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_mysql_database
```

## Step 2: Deploy to Railway

1. Login to Railway CLI:
```bash
railway login
```

2. Create a new Railway project:
```bash
railway init
# Choose "Empty Project"
# Give it a name like "docspace-proxy-server"
```

3. Set environment variables on Railway:
```bash
# Set each environment variable
railway variables set COMPANIES_HOUSE_API_KEY=your_api_key_here
railway variables set MYSQL_HOST=your_mysql_host
railway variables set MYSQL_PORT=your_mysql_port
railway variables set MYSQL_USER=your_mysql_user
railway variables set MYSQL_PASSWORD=your_mysql_password
railway variables set MYSQL_DATABASE=your_mysql_database
railway variables set PORT=3002
```

4. Deploy the proxy server:
```bash
railway up
```

5. Get your deployment URL:
```bash
railway domain
```

You'll get a URL like: `https://docspace-proxy-server.up.railway.app`

## Step 3: Update Your Frontend Code

Update the sanctions check function in `index.html` to use the deployed URL:

```javascript
// Sanctions check function
async function checkSanctions(entityName) {
    try {
        // Use deployed Railway URL for production
        const baseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3002' 
            : 'https://docspace-proxy-server.up.railway.app';
        const url = `${baseUrl}/api/sanctions/check/${encodeURIComponent(entityName)}`;
        console.log('🔍 Checking sanctions for:', entityName, 'URL:', url);
        
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Sanctions data received:', data);
            return data.data;
        } else {
            console.error('❌ Sanctions check failed with status:', response.status);
        }
    } catch (error) {
        console.error('❌ Sanctions check error:', error);
    }
    return null;
}

// Update sanctions count function similarly
async function updateSanctionsCount() {
    try {
        const baseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3002' 
            : 'https://docspace-proxy-server.up.railway.app';
        const response = await fetch(`${baseUrl}/api/sanctions/count`);
        // ... rest of the function
    }
}
```

## Step 4: Monitor Your Deployment

1. View logs:
```bash
railway logs
```

2. Check deployment status:
```bash
railway status
```

## Important Notes

1. **Costs**: Railway provides $5 free credits monthly. The proxy server should stay within free limits for moderate usage.

2. **CORS**: The proxy server already has CORS enabled for all origins, so it will work from docspace.uk

3. **Sleeping**: Railway apps may sleep after inactivity. First request might be slow.

4. **Custom Domain**: You can add a custom domain like `api.docspace.uk` in Railway settings.

## Troubleshooting

If sanctions still don't work after deployment:

1. Check Railway logs for errors
2. Verify environment variables are set correctly
3. Test the API directly: `https://your-app.up.railway.app/health`
4. Check browser console for CORS errors

## Next Steps

Once deployed:
1. Test sanctions on both desktop and mobile
2. Consider getting OpenSanctions API key for production use
3. Monitor usage and performance