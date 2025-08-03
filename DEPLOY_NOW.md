# Deploy Proxy Server to Railway - Quick Guide

## Option 1: Deploy via Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**: https://railway.app/new

2. **Choose "Deploy from GitHub repo"**

3. **Select your repository**: `mariaiontseva/Company-House-PDF-Downloader`

4. **Configure the deployment**:
   - Root Directory: `.` (leave as is)
   - Start Command: `node proxy-server.js`

5. **Add Environment Variables** (click "Add variables"):
   ```
   COMPANIES_HOUSE_API_KEY=22aefa40-ee9e-47c0-b40a-2dd3c03165c6
   MYSQL_HOST=turntable.proxy.rlwy.net
   MYSQL_PORT=51124
   MYSQL_USER=root
   MYSQL_PASSWORD=FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc
   MYSQL_DATABASE=railway
   PORT=3002
   ```

6. **Click "Deploy"**

7. **Generate Domain**:
   - Go to Settings tab
   - Click "Generate Domain"
   - Copy the URL (like `docspace-proxy-production.up.railway.app`)

## Option 2: Deploy via CLI

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create new project
railway init
# Choose "Empty Project"
# Name it "docspace-proxy"

# 4. Deploy
railway up

# 5. Add environment variables
railway variables set COMPANIES_HOUSE_API_KEY=22aefa40-ee9e-47c0-b40a-2dd3c03165c6
railway variables set MYSQL_HOST=turntable.proxy.rlwy.net
railway variables set MYSQL_PORT=51124
railway variables set MYSQL_USER=root
railway variables set MYSQL_PASSWORD=FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc
railway variables set MYSQL_DATABASE=railway
railway variables set PORT=3002

# 6. Get domain
railway domain
```

## After Deployment

1. **Update frontend code** if the URL is different than expected
2. **Test sanctions** at https://docspace.uk/#company/02577764
3. **Check logs** in Railway dashboard

The proxy server should now be live and sanctions will work for everyone!