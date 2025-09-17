# Next.js Build Troubleshooting Guide

This guide helps you diagnose and fix common `npm run build` issues that don't occur in `npm run dev`.

## 🚀 Quick Start

### Run All Fixes Automatically
```bash
./fix-all-build-issues.sh
```

### Run Individual Diagnostics
```bash
# Comprehensive diagnostic
node troubleshoot-build.js

# Fix specific issues
node fix-public-path.js    # Public path/base URL issues
node fix-csp.js           # Content Security Policy issues  
node fix-routing.js       # Routing issues
```

## 🔍 Common Issues & Solutions

### 1. Public Path/Base URL Issues
**Problem**: Assets load in dev but not in production
**Symptoms**: 404 errors for CSS/JS files, broken images
**Solution**:
```bash
node fix-public-path.js
```
This adds configuration for subdirectory deployment and creates a custom server.

### 2. Server Configuration Issues
**Problem**: Static files not served correctly
**Symptoms**: 404 errors for `_next/static/` files
**Solution**:
- Use the provided `server.js` for better static file handling
- Configure nginx/Apache for production
- Ensure proper cache headers

### 3. Content Security Policy (CSP) Issues
**Problem**: Inline scripts/styles blocked in production
**Symptoms**: JavaScript not executing, styles not applying
**Solution**:
```bash
node fix-csp.js
```
This adds CSP headers and identifies problematic inline content.

### 4. Routing Issues
**Problem**: Client-side routing not working in production
**Symptoms**: 404 errors for valid routes, refresh issues
**Solution**:
```bash
node fix-routing.js
```
This creates proper error pages, middleware, and nginx config.

### 5. Environment Variable Issues
**Problem**: Different behavior between dev and production
**Symptoms**: API calls failing, missing configuration
**Solution**:
- Check `.env.production` file exists
- Verify `NEXT_PUBLIC_` variables are set
- Use build-time environment variables

### 6. Build-Time Errors
**Problem**: Build fails with TypeScript/ESLint errors
**Symptoms**: Build process fails, missing dependencies
**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check ESLint errors  
npx next lint

# Install missing dependencies
npm install
```

### 7. Asset Loading Issues
**Problem**: Images, fonts, or other assets not loading
**Symptoms**: Broken images, missing fonts, 404 errors
**Solution**:
- Check `public/` directory structure
- Verify asset paths in code
- Ensure proper file permissions

## 🛠️ Manual Troubleshooting Steps

### Step 1: Run Comprehensive Diagnostic
```bash
node troubleshoot-build.js
```

### Step 2: Check Build Output
```bash
npm run build
ls -la .next/
```

### Step 3: Test Production Server
```bash
npm start
# Open http://localhost:3000
# Check browser console for errors
```

### Step 4: Test Static Files
```bash
curl -I http://localhost:3000/_next/static/css/
curl -I http://localhost:3000/_next/static/chunks/
```

### Step 5: Check Environment Variables
```bash
# In production
NODE_ENV=production node -e "console.log(process.env.NEXT_PUBLIC_API_BASE_URL)"
```

## 🐳 Docker-Specific Issues

### Standalone Build Issues
```bash
# Ensure standalone mode is enabled
echo 'output: "standalone"' >> next.config.mjs

# Build and test
npm run build
cd .next/standalone && node server.js
```

### Static Files in Docker
```bash
# Copy static files to standalone build
cp -r .next/static .next/standalone/.next/
```

## 📊 Diagnostic Tools

### Available Scripts
- `troubleshoot-build.js` - Comprehensive diagnostic
- `fix-public-path.js` - Fix base URL issues
- `fix-csp.js` - Fix CSP issues
- `fix-routing.js` - Fix routing issues
- `fix-all-build-issues.sh` - Run all fixes

### Manual Checks
```bash
# Check build output
ls -la .next/

# Check standalone build
ls -la .next/standalone/

# Check static files
ls -la .next/static/

# Check environment variables
cat .env.production
```

## 🚨 Critical Issues

### Build Fails Completely
1. Check TypeScript errors: `npx tsc --noEmit`
2. Check ESLint errors: `npx next lint`
3. Install dependencies: `npm install`
4. Clear cache: `rm -rf .next && npm run build`

### Static Files 404
1. Ensure standalone build: `output: 'standalone'` in next.config.mjs
2. Copy static files: `cp -r .next/static .next/standalone/.next/`
3. Check server configuration

### JavaScript Not Loading
1. Check CSP configuration
2. Check for inline script issues
3. Verify environment variables
4. Check browser console for errors

## 📋 Checklist

- [ ] Build completes without errors
- [ ] Static files are accessible (CSS, JS, images)
- [ ] Environment variables are loaded
- [ ] Client-side routing works
- [ ] No CSP violations in console
- [ ] All pages load correctly
- [ ] API calls work in production
- [ ] Docker build works (if applicable)

## 🆘 Still Having Issues?

1. Run the comprehensive diagnostic: `node troubleshoot-build.js`
2. Check browser console for specific errors
3. Compare dev vs production behavior
4. Check server logs for 404/500 errors
5. Verify all environment variables are set correctly

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Next.js Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
