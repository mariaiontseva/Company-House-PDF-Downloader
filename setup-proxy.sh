#!/bin/bash

echo "Setting up Companies House iXBRL Proxy Server..."
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install express axios cors

# Create a simple start script
cat > start-proxy.sh << 'EOF'
#!/bin/bash
echo "Starting Companies House Proxy Server on port 3002..."
node proxy-server.js
EOF

chmod +x start-proxy.sh

echo ""
echo "Setup complete! To start the proxy server, run:"
echo "  ./start-proxy.sh"
echo ""
echo "Or run directly with:"
echo "  node proxy-server.js"
echo ""
echo "The proxy server will run on http://localhost:3002"
echo ""
echo "Available endpoints:"
echo "  - GET /health"
echo "  - GET /api/proxy/companies-house/*"
echo "  - GET /api/proxy/document/*"
echo "  - GET /api/proxy/ixbrl/:companyNumber/:transactionId"