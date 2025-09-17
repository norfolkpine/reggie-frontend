#!/usr/bin/env node

// Fix Routing Issues
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Routing Issues...\n');

function checkRoutingSetup() {
  const appDir = fs.existsSync('app');
  const pagesDir = fs.existsSync('pages');
  
  console.log(`App Router (app/): ${appDir ? '✅' : '❌'}`);
  console.log(`Pages Router (pages/): ${pagesDir ? '✅' : '❌'}`);
  
  if (!appDir && !pagesDir) {
    console.log('❌ No routing setup found!');
    return false;
  }
  
  return true;
}

function createNotFoundPage() {
  const notFoundContent = `// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg">Page not found</p>
      <Link 
        href="/" 
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Go Home
      </Link>
    </div>
  );
}
`;

  if (!fs.existsSync('app/not-found.tsx')) {
    fs.writeFileSync('app/not-found.tsx', notFoundContent);
    console.log('✅ Created app/not-found.tsx');
  } else {
    console.log('✅ app/not-found.tsx already exists');
  }
}

function createErrorPage() {
  const errorContent = `// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Something went wrong!</h1>
      <p className="mt-4 text-lg">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
`;

  if (!fs.existsSync('app/error.tsx')) {
    fs.writeFileSync('app/error.tsx', errorContent);
    console.log('✅ Created app/error.tsx');
  } else {
    console.log('✅ app/error.tsx already exists');
  }
}

function createMiddleware() {
  const middlewareContent = `// middleware.ts - Handle routing and redirects
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle trailing slashes
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return NextResponse.redirect(new URL(pathname.slice(0, -1), request.url));
  }
  
  // Handle common routing issues
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Add any custom routing logic here
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
`;

  if (!fs.existsSync('middleware.ts')) {
    fs.writeFileSync('middleware.ts', middlewareContent);
    console.log('✅ Created middleware.ts for routing');
  } else {
    console.log('✅ middleware.ts already exists');
  }
}

function checkDynamicRoutes() {
  const dynamicRoutes = [];
  
  function findDynamicRoutes(dir) {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      files.forEach(file => {
        if (file.isDirectory()) {
          if (file.name.startsWith('[') && file.name.endsWith(']')) {
            dynamicRoutes.push(path.relative('app', path.join(dir, file.name)));
          }
          findDynamicRoutes(path.join(dir, file.name));
        }
      });
    } catch (e) {
      // Ignore errors
    }
  }
  
  if (fs.existsSync('app')) {
    findDynamicRoutes('app');
  }
  
  if (dynamicRoutes.length > 0) {
    console.log('✅ Dynamic routes found:');
    dynamicRoutes.forEach(route => console.log(`   - ${route}`));
  } else {
    console.log('ℹ️  No dynamic routes found');
  }
  
  return dynamicRoutes;
}

function createNginxConfig() {
  const nginxConfig = `# nginx.conf - For production deployment
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve static files
    location /_next/static/ {
        alias /app/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
`;

  fs.writeFileSync('nginx.conf', nginxConfig);
  console.log('✅ Created nginx.conf for production deployment');
}

if (checkRoutingSetup()) {
  createNotFoundPage();
  createErrorPage();
  createMiddleware();
  checkDynamicRoutes();
  createNginxConfig();
}

console.log('\n📋 Next Steps:');
console.log('1. Test routing with: npm run build && npm start');
console.log('2. Check that all routes work correctly');
console.log('3. For production: Use the nginx.conf or similar server config');
console.log('4. Test dynamic routes and error handling');
