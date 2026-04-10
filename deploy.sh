#!/bin/bash

# Railway Production Deployment Script
# This script deploys the OpenAI-enhanced Companies API to Railway

echo "🚀 Deploying to Railway Production..."

# 1. Login to Railway (if not already logged in)
if ! railway whoami &>/dev/null; then
    echo "Please login to Railway first:"
    railway login
fi

# 2. Link to your existing project
echo "📡 Linking to Railway project..."
railway link

# 3. Set the OpenAI API key as environment variable
echo "🔑 Setting OpenAI API key..."
echo "Please set your OpenAI API key manually:"
echo "railway variables set OPENAI_API_KEY=your_openai_api_key_here"

# 4. Deploy the application
echo "🚢 Deploying application..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your API will be available at: https://companies-api-production-68c2.up.railway.app"
echo "🤖 OpenAI endpoint: https://companies-api-production-68c2.up.railway.app/api/openai/completions"