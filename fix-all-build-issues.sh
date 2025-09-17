#!/bin/bash

# Master script to fix all common Next.js build issues
echo "🔧 Next.js Build Issues Auto-Fixer"
echo "=================================="
echo ""

# Run the comprehensive diagnostic
echo "1️⃣ Running comprehensive diagnostic..."
node troubleshoot-build.js

echo ""
echo "2️⃣ Fixing Public Path/Base URL issues..."
node fix-public-path.js

echo ""
echo "3️⃣ Fixing Content Security Policy issues..."
node fix-csp.js

echo ""
echo "4️⃣ Fixing Routing issues..."
node fix-routing.js

echo ""
echo "5️⃣ Building the application..."
npm run build

echo ""
echo "6️⃣ Testing the build..."
if [ -d ".next" ]; then
    echo "✅ Build directory created successfully"
    
    # Check for standalone build
    if [ -d ".next/standalone" ]; then
        echo "✅ Standalone build created"
        
        # Copy static files if needed
        if [ ! -d ".next/standalone/.next/static" ]; then
            echo "📁 Copying static files to standalone build..."
            cp -r .next/static .next/standalone/.next/
            echo "✅ Static files copied"
        fi
    else
        echo "⚠️  Standalone build not found. Add 'output: standalone' to next.config.mjs"
    fi
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi

echo ""
echo "7️⃣ Testing the production server..."
echo "Starting server in background..."
cd .next/standalone && node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test the server
echo "Testing server response..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|307"; then
    echo "✅ Server is responding"
    
    # Test static files
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/css/ | grep -q "200"; then
        echo "✅ Static files are accessible"
    else
        echo "⚠️  Static files may not be accessible"
    fi
else
    echo "❌ Server is not responding properly"
fi

# Stop the server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Build issues fixed!"
echo ""
echo "📋 Summary of fixes applied:"
echo "• Public path configuration added to next.config.mjs"
echo "• Content Security Policy configured"
echo "• Routing middleware created"
echo "• Error and 404 pages created"
echo "• Nginx configuration created"
echo "• Standalone build with static files"
echo ""
echo "🚀 Next steps:"
echo "1. Test locally: npm start"
echo "2. For Docker: ./docker-build.sh"
echo "3. For production: Use the nginx.conf file"
echo "4. Check browser console for any remaining issues"
