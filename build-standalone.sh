#!/bin/bash

# Build script for Next.js standalone with proper static file handling
echo "🔨 Building Next.js standalone with static files..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Build the application
echo "📦 Building Next.js application..."
npm run build

# Check if standalone build was created
if [ ! -d ".next/standalone" ]; then
    echo "❌ Standalone build not found. Make sure 'output: standalone' is set in next.config.mjs"
    exit 1
fi

# Copy static files to standalone build
echo "📁 Copying static files to standalone build..."
cp -r .next/static .next/standalone/.next/

# Verify static files were copied
if [ -d ".next/standalone/.next/static" ]; then
    echo "✅ Static files copied successfully"
    echo "📊 Static files count: $(find .next/standalone/.next/static -type f | wc -l)"
else
    echo "❌ Failed to copy static files"
    exit 1
fi

echo "🎉 Standalone build ready!"
echo "🚀 To test locally:"
echo "   cd .next/standalone && node server.js"
echo ""
echo "🐳 To build Docker image:"
echo "   ./docker-build.sh"
