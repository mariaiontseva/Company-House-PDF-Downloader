#!/bin/bash

echo "🚀 Deploying Proxy Server to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway
echo "📡 Logging into Railway..."
railway login

# Link to project or create new one
echo "🔗 Linking to Railway project..."
railway link

# Deploy the application
echo "🚢 Deploying proxy server..."
railway up

# Get the deployment URL
echo "🌐 Getting deployment URL..."
railway domain

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Railway dashboard"
echo "2. Update the proxy URL in your frontend code if different"
echo "3. Commit and push the frontend changes"