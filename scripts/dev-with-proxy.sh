#!/bin/bash

# Development script with proxy enabled
# This script starts the Next.js development server with the dev proxy enabled

echo "🚀 Starting Reggie Frontend with Dev Proxy enabled..."

# Set environment variables for development
export NODE_ENV=development
export NEXT_PUBLIC_ENABLE_DEV_PROXY=true
export NEXT_PUBLIC_DEBUG_PROXY=true

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting development server on port 5173..."
echo "🔧 Dev Proxy is enabled for .opie.sh domains"
echo "📱 Test page available at: http://localhost:5173/dev-proxy-test"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

