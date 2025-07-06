# Proxy Server Deployment Guide

## Overview
The proxy server is required for the Finance tab to fetch iXBRL data from Companies House API, bypassing CORS restrictions.

## Production Setup

### 1. Install Dependencies
```bash
cd /path/to/your/app
npm install express cors axios
```

### 2. Set Environment Variables
Create a `.env` file with your Companies House API key:
```
CH_API_KEY=your_companies_house_api_key_here
PORT=3002
```

### 3. Run with PM2 (Recommended)
```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the proxy server
pm2 start proxy-server.js --name "ch-proxy"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 4. Configure Nginx
Add this to your Nginx configuration to proxy requests to the Node.js server:

```nginx
location /proxy/ {
    proxy_pass http://localhost:3002/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 5. Restart Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Testing
Visit: https://docspace.uk/#company/08510890
Click on the Finance tab - it should load iXBRL data for Lobster IT Limited.

## Monitoring
```bash
# View proxy server logs
pm2 logs ch-proxy

# Monitor proxy server
pm2 monit
```

## Troubleshooting
- Check PM2 logs: `pm2 logs ch-proxy`
- Verify API key is set: `pm2 env ch-proxy`
- Test proxy directly: `curl http://localhost:3002/health`