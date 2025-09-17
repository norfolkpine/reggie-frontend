#!/usr/bin/env node

// Fix Public Path/Base URL Issues
const fs = require('fs');

console.log('🔧 Fixing Public Path/Base URL Issues...\n');

function fixPublicPath() {
  try {
    let nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
    
    // Check if already configured
    if (nextConfig.includes('basePath') || nextConfig.includes('assetPrefix')) {
      console.log('✅ Public path already configured');
      return;
    }
    
    // Add configuration for subdirectory deployment
    const configAddition = `
  // Configure for subdirectory deployment (uncomment if needed)
  // basePath: '/my-app',  // If your app is served from /my-app/
  // assetPrefix: '/my-app/',  // If assets are served from /my-app/
  // trailingSlash: true,  // Add trailing slashes to URLs
`;
    
    // Insert before the closing brace
    const insertPoint = nextConfig.lastIndexOf('}');
    if (insertPoint > 0) {
      nextConfig = nextConfig.slice(0, insertPoint) + configAddition + '\n' + nextConfig.slice(insertPoint);
      
      fs.writeFileSync('next.config.mjs', nextConfig);
      console.log('✅ Added public path configuration to next.config.mjs');
      console.log('ℹ️  Uncomment the lines you need for your deployment');
    }
  } catch (error) {
    console.log('❌ Could not update next.config.mjs:', error.message);
  }
}

function createServerConfig() {
  const serverConfig = `// server.js - Custom server for production
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Handle static files with proper headers
      if (pathname.startsWith('/_next/static/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(\`> Ready on http://\${hostname}:\${port}\`);
  });
});
`;

  fs.writeFileSync('server.js', serverConfig);
  console.log('✅ Created custom server.js for better static file handling');
}

fixPublicPath();
createServerConfig();

console.log('\n📋 Next Steps:');
console.log('1. Update next.config.mjs with your actual basePath if needed');
console.log('2. Test with: npm run build && npm start');
console.log('3. For Docker: Update Dockerfile to use server.js');
