#!/usr/bin/env node

// Comprehensive Next.js Build Troubleshooting Tool
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Next.js Build Troubleshooting Tool\n');

// 1. Check Public Path/Base URL Configuration
console.log('1️⃣ Checking Public Path/Base URL Configuration...');
function checkPublicPath() {
  try {
    const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
    
    // Check for basePath or assetPrefix
    const hasBasePath = nextConfig.includes('basePath');
    const hasAssetPrefix = nextConfig.includes('assetPrefix');
    const hasTrailingSlash = nextConfig.includes('trailingSlash');
    
    console.log(`   basePath configured: ${hasBasePath ? '✅' : '❌'}`);
    console.log(`   assetPrefix configured: ${hasAssetPrefix ? '✅' : '❌'}`);
    console.log(`   trailingSlash configured: ${hasTrailingSlash ? '✅' : '❌'}`);
    
    if (!hasBasePath && !hasAssetPrefix) {
      console.log('   ℹ️  No custom basePath/assetPrefix found - assuming root deployment');
    }
    
    return { hasBasePath, hasAssetPrefix, hasTrailingSlash };
  } catch (error) {
    console.log('   ❌ Could not read next.config.mjs');
    return { hasBasePath: false, hasAssetPrefix: false, hasTrailingSlash: false };
  }
}

// 2. Check Server Configuration
console.log('\n2️⃣ Checking Server Configuration...');
function checkServerConfig() {
  const dockerfile = fs.existsSync('Dockerfile');
  const dockerCompose = fs.existsSync('docker-compose.yml');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log(`   Dockerfile present: ${dockerfile ? '✅' : '❌'}`);
  console.log(`   docker-compose.yml present: ${dockerCompose ? '✅' : '❌'}`);
  console.log(`   Start script: ${packageJson.scripts?.start ? '✅' : '❌'}`);
  
  if (packageJson.scripts?.start) {
    console.log(`   Start command: ${packageJson.scripts.start}`);
  }
  
  return { dockerfile, dockerCompose, hasStartScript: !!packageJson.scripts?.start };
}

// 3. Check Content Security Policy
console.log('\n3️⃣ Checking Content Security Policy (CSP)...');
function checkCSP() {
  try {
    const layoutFile = fs.readFileSync('app/layout.tsx', 'utf8');
    const hasCSP = layoutFile.includes('Content-Security-Policy') || 
                   layoutFile.includes('csp') || 
                   layoutFile.includes('nonce');
    
    console.log(`   CSP headers in layout: ${hasCSP ? '✅' : '❌'}`);
    
    // Check for inline scripts/styles
    const hasInlineScripts = layoutFile.includes('<script>') && !layoutFile.includes('src=');
    const hasInlineStyles = layoutFile.includes('<style>') && !layoutFile.includes('href=');
    
    console.log(`   Inline scripts detected: ${hasInlineScripts ? '⚠️' : '✅'}`);
    console.log(`   Inline styles detected: ${hasInlineStyles ? '⚠️' : '✅'}`);
    
    if (hasInlineScripts || hasInlineStyles) {
      console.log('   ℹ️  Inline content may be blocked by CSP in production');
    }
    
    return { hasCSP, hasInlineScripts, hasInlineStyles };
  } catch (error) {
    console.log('   ❌ Could not check CSP configuration');
    return { hasCSP: false, hasInlineScripts: false, hasInlineStyles: false };
  }
}

// 4. Check Routing Configuration
console.log('\n4️⃣ Checking Routing Configuration...');
function checkRouting() {
  const appDir = fs.existsSync('app');
  const pagesDir = fs.existsSync('pages');
  const middleware = fs.existsSync('middleware.ts') || fs.existsSync('middleware.js');
  
  console.log(`   App Router (app/): ${appDir ? '✅' : '❌'}`);
  console.log(`   Pages Router (pages/): ${pagesDir ? '✅' : '❌'}`);
  console.log(`   Middleware present: ${middleware ? '✅' : '❌'}`);
  
  // Check for dynamic routes
  let dynamicRoutes = 0;
  if (appDir) {
    try {
      const findDynamic = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          if (file.isDirectory()) {
            if (file.name.startsWith('[') && file.name.endsWith(']')) {
              dynamicRoutes++;
            }
            findDynamic(path.join(dir, file.name));
          }
        });
      };
      findDynamic('app');
    } catch (e) {
      // Ignore errors
    }
  }
  
  console.log(`   Dynamic routes found: ${dynamicRoutes}`);
  
  return { appDir, pagesDir, middleware, dynamicRoutes };
}

// 5. Check Environment Variables
console.log('\n5️⃣ Checking Environment Variables...');
function checkEnvironmentVariables() {
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
  const envVars = {};
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
      );
      envVars[file] = lines.length;
      console.log(`   ${file}: ${lines.length} variables`);
    } else {
      console.log(`   ${file}: ❌ Not found`);
    }
  });
  
  // Check for NEXT_PUBLIC_ variables
  const allEnvContent = Object.keys(envVars).map(file => {
    try {
      return fs.readFileSync(file, 'utf8');
    } catch {
      return '';
    }
  }).join('\n');
  
  const publicVars = (allEnvContent.match(/NEXT_PUBLIC_/g) || []).length;
  console.log(`   NEXT_PUBLIC_ variables: ${publicVars}`);
  
  return { envVars, publicVars };
}

// 6. Check Build-Time Errors
console.log('\n6️⃣ Checking Build-Time Errors...');
function checkBuildErrors() {
  try {
    console.log('   Running TypeScript check...');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('   TypeScript: ✅ No errors');
  } catch (error) {
    const errorCount = (error.stdout?.toString() || '').split('error TS').length - 1;
    console.log(`   TypeScript: ❌ ${errorCount} errors found`);
  }
  
  try {
    console.log('   Running ESLint check...');
    execSync('npx next lint', { stdio: 'pipe' });
    console.log('   ESLint: ✅ No errors');
  } catch (error) {
    console.log('   ESLint: ❌ Errors found');
  }
  
  try {
    console.log('   Checking for missing dependencies...');
    execSync('npm ls --depth=0', { stdio: 'pipe' });
    console.log('   Dependencies: ✅ All installed');
  } catch (error) {
    console.log('   Dependencies: ❌ Missing packages');
  }
}

// 7. Check Asset Loading
console.log('\n7️⃣ Checking Asset Loading...');
function checkAssetLoading() {
  const publicDir = fs.existsSync('public');
  const staticDir = fs.existsSync('.next/static');
  const standaloneDir = fs.existsSync('.next/standalone');
  
  console.log(`   Public directory: ${publicDir ? '✅' : '❌'}`);
  console.log(`   Static build files: ${staticDir ? '✅' : '❌'}`);
  console.log(`   Standalone build: ${standaloneDir ? '✅' : '❌'}`);
  
  if (staticDir) {
    const staticFiles = fs.readdirSync('.next/static', { recursive: true })
      .filter(file => typeof file === 'string' && file.includes('.')).length;
    console.log(`   Static files count: ${staticFiles}`);
  }
  
  if (standaloneDir) {
    const standaloneStatic = fs.existsSync('.next/standalone/.next/static');
    console.log(`   Standalone static files: ${standaloneStatic ? '✅' : '❌'}`);
  }
  
  return { publicDir, staticDir, standaloneDir };
}

// 8. Check Build Output
console.log('\n8️⃣ Checking Build Output...');
function checkBuildOutput() {
  const buildDir = '.next';
  if (!fs.existsSync(buildDir)) {
    console.log('   ❌ Build directory not found. Run "npm run build" first.');
    return false;
  }
  
  const requiredFiles = [
    'server',
    'static',
    'BUILD_ID',
    'package.json'
  ];
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(buildDir, file));
    console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
  });
  
  return true;
}

// Run all checks
const results = {
  publicPath: checkPublicPath(),
  server: checkServerConfig(),
  csp: checkCSP(),
  routing: checkRouting(),
  env: checkEnvironmentVariables(),
  assets: checkAssetLoading(),
  buildOutput: checkBuildOutput()
};

checkBuildErrors();

// Summary and Recommendations
console.log('\n📋 Summary and Recommendations:');
console.log('================================');

if (!results.buildOutput) {
  console.log('🚨 CRITICAL: No build output found. Run "npm run build" first.');
}

if (!results.assets.staticDir) {
  console.log('🚨 CRITICAL: Static files not built. Check build process.');
}

if (!results.assets.standaloneDir) {
  console.log('⚠️  WARNING: Standalone build not found. Add "output: standalone" to next.config.mjs for Docker.');
}

if (results.csp.hasInlineScripts || results.csp.hasInlineStyles) {
  console.log('⚠️  WARNING: Inline scripts/styles detected. May be blocked by CSP in production.');
}

if (results.env.publicVars === 0) {
  console.log('⚠️  WARNING: No NEXT_PUBLIC_ environment variables found.');
}

console.log('\n🔧 Quick Fixes:');
console.log('===============');

if (!results.assets.standaloneDir) {
  console.log('• Add standalone mode: Add "output: \'standalone\'" to next.config.mjs');
}

if (!results.server.dockerfile) {
  console.log('• Create Dockerfile for containerized deployment');
}

if (results.csp.hasInlineScripts) {
  console.log('• Move inline scripts to external files or add nonce attributes');
}

console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. Run: npm run build');
console.log('2. Test locally: npm start');
console.log('3. For Docker: ./docker-build.sh');
console.log('4. Check browser console for runtime errors');
console.log('5. Verify all assets load correctly');
