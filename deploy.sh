#!/bin/bash

# Deployment script for Company House PDF Downloader

echo "🚀 Starting deployment process..."

# Check if config.js exists
if [ ! -f "config.js" ]; then
    echo "❌ Error: config.js not found. Please create it from config.js.example"
    exit 1
fi

# Check for sensitive data in files
echo "🔍 Checking for exposed API keys..."
if grep -r "AIzaSy" --include="*.html" --include="*.js" . | grep -v "config.js"; then
    echo "⚠️  Warning: Found potential API keys in source files. Please move them to config.js"
fi

# Create a production build directory
echo "📦 Creating production build..."
mkdir -p dist

# Copy files to dist directory
cp index.html dist/
cp config.js dist/

# Minify HTML (optional - requires html-minifier)
# npx html-minifier index.html -o dist/index.html --collapse-whitespace --remove-comments

echo "✅ Build complete!"
echo ""
echo "📋 Deployment options:"
echo ""
echo "1. GitHub Pages:"
echo "   - Push the dist folder to gh-pages branch"
echo "   - Enable GitHub Pages in repository settings"
echo ""
echo "2. Vercel:"
echo "   vercel dist --prod"
echo ""
echo "3. Netlify:"
echo "   netlify deploy --dir=dist --prod"
echo ""
echo "4. Traditional hosting:"
echo "   Upload contents of dist/ folder to your web server"
echo ""
echo "⚠️  Remember to:"
echo "   - Set up environment variables on your hosting platform"
echo "   - Configure CORS on your Cloudflare Worker"
echo "   - Enable required Google Maps APIs"
echo "   - Test the deployment thoroughly"