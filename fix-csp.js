#!/usr/bin/env node

// Fix Content Security Policy Issues
const fs = require('fs');

console.log('🔧 Fixing Content Security Policy Issues...\n');

function fixCSP() {
  try {
    let layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
    
    // Check if CSP is already configured
    if (layoutContent.includes('Content-Security-Policy')) {
      console.log('✅ CSP already configured');
      return;
    }
    
    // Add CSP configuration
    const cspConfig = `
  // Content Security Policy configuration
  const cspHeader = \`
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://vercel.live;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  \`;

  export const metadata = {
    other: {
      'Content-Security-Policy': cspHeader,
    },
  };
`;

    // Insert before the export default
    const insertPoint = layoutContent.indexOf('export default');
    if (insertPoint > 0) {
      layoutContent = layoutContent.slice(0, insertPoint) + cspConfig + '\n' + layoutContent.slice(insertPoint);
      
      fs.writeFileSync('app/layout.tsx', layoutContent);
      console.log('✅ Added CSP configuration to app/layout.tsx');
    }
  } catch (error) {
    console.log('❌ Could not update app/layout.tsx:', error.message);
  }
}

function createCSPMiddleware() {
  const middlewareContent = `// middleware.ts - CSP and security headers
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
    );
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
`;

  fs.writeFileSync('middleware.ts', middlewareContent);
  console.log('✅ Created middleware.ts for security headers');
}

function fixInlineContent() {
  try {
    let layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
    
    // Check for inline scripts
    const inlineScripts = layoutContent.match(/<script[^>]*>(?!.*src=)[^<]*<\/script>/g);
    if (inlineScripts) {
      console.log('⚠️  Found inline scripts that may be blocked by CSP:');
      inlineScripts.forEach((script, index) => {
        console.log(`   ${index + 1}. ${script.substring(0, 50)}...`);
      });
    }
    
    // Check for inline styles
    const inlineStyles = layoutContent.match(/<style[^>]*>(?!.*src=)[^<]*<\/style>/g);
    if (inlineStyles) {
      console.log('⚠️  Found inline styles that may be blocked by CSP:');
      inlineStyles.forEach((style, index) => {
        console.log(`   ${index + 1}. ${style.substring(0, 50)}...`);
      });
    }
    
    if (!inlineScripts && !inlineStyles) {
      console.log('✅ No problematic inline content found');
    }
  } catch (error) {
    console.log('❌ Could not check for inline content:', error.message);
  }
}

fixCSP();
createCSPMiddleware();
fixInlineContent();

console.log('\n📋 Next Steps:');
console.log('1. Test the CSP configuration');
console.log('2. Check browser console for CSP violations');
console.log('3. Adjust CSP rules as needed for your app');
console.log('4. Consider moving inline scripts/styles to external files');
