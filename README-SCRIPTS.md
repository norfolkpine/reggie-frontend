# Next.js Build Troubleshooting Scripts

This directory contains a comprehensive set of tools to diagnose and fix common Next.js build issues that occur in production but not in development.

## 🚀 Quick Start

### Fix All Issues Automatically
```bash
./fix-all-build-issues.sh
```

### Run Individual Diagnostics
```bash
node troubleshoot-build.js
```

## 📁 Script Overview

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `troubleshoot-build.js` | Comprehensive diagnostic tool | First step - identifies all issues |
| `fix-all-build-issues.sh` | Master script that runs all fixes | When you want to fix everything at once |
| `fix-public-path.js` | Fixes base URL and asset path issues | When assets return 404 errors |
| `fix-csp.js` | Fixes Content Security Policy issues | When JavaScript/styles are blocked |
| `fix-routing.js` | Fixes client-side routing issues | When navigation doesn't work in production |
| `build-standalone.sh` | Builds Next.js with standalone mode | For Docker deployment |
| `docker-build.sh` | Builds Docker image with proper config | For containerized deployment |
| `debug-build.js` | Simple build health checker | Quick status check |

## 🔧 Individual Scripts

### 1. `troubleshoot-build.js`
**Comprehensive diagnostic tool that checks all common build issues.**

```bash
node troubleshoot-build.js
```

**What it checks:**
- ✅ Public path/base URL configuration
- ✅ Server configuration (Docker, scripts)
- ✅ Content Security Policy setup
- ✅ Routing configuration (App Router, middleware)
- ✅ Environment variables
- ✅ Build-time errors (TypeScript, ESLint)
- ✅ Asset loading (static files, standalone build)
- ✅ Build output structure

**Output example:**
```
🔍 Next.js Build Troubleshooting Tool

1️⃣ Checking Public Path/Base URL Configuration...
   basePath configured: ❌
   assetPrefix configured: ❌
   trailingSlash configured: ❌

2️⃣ Checking Server Configuration...
   Dockerfile present: ✅
   docker-compose.yml present: ✅
   Start script: ✅

[... more checks ...]

📋 Summary and Recommendations:
================================
🚨 CRITICAL: No build output found. Run "npm run build" first.
⚠️  WARNING: Standalone build not found. Add "output: standalone" to next.config.mjs for Docker.
```

### 2. `fix-all-build-issues.sh`
**Master script that runs all diagnostic and fix tools automatically.**

```bash
./fix-all-build-issues.sh
```

**What it does:**
1. Runs comprehensive diagnostic
2. Fixes public path issues
3. Fixes CSP issues
4. Fixes routing issues
5. Builds the application
6. Tests the build
7. Provides summary of fixes

**Perfect for:** When you want to fix everything at once without manual intervention.

### 3. `fix-public-path.js`
**Fixes base URL and asset path issues for subdirectory deployments.**

```bash
node fix-public-path.js
```

**What it fixes:**
- Adds `basePath` and `assetPrefix` configuration to `next.config.mjs`
- Creates custom `server.js` for better static file handling
- Configures proper cache headers for assets

**Creates:**
- `next.config.mjs` updates (commented out, ready to enable)
- `server.js` - Custom server with proper static file handling

**Use when:** Assets return 404 errors in production but work in development.

### 4. `fix-csp.js`
**Fixes Content Security Policy issues that block inline scripts/styles.**

```bash
node fix-csp.js
```

**What it fixes:**
- Adds CSP headers to `app/layout.tsx`
- Creates `middleware.ts` with security headers
- Identifies problematic inline scripts/styles
- Provides recommendations for CSP compliance

**Creates:**
- CSP configuration in `app/layout.tsx`
- `middleware.ts` with security headers
- Identifies inline content that may be blocked

**Use when:** JavaScript doesn't execute or styles don't apply in production.

### 5. `fix-routing.js`
**Fixes client-side routing issues and creates proper error handling.**

```bash
node fix-routing.js
```

**What it fixes:**
- Creates `app/not-found.tsx` for 404 errors
- Creates `app/error.tsx` for error boundaries
- Creates `middleware.ts` for routing logic
- Creates `nginx.conf` for production deployment
- Identifies dynamic routes

**Creates:**
- `app/not-found.tsx` - Custom 404 page
- `app/error.tsx` - Error boundary component
- `middleware.ts` - Routing middleware
- `nginx.conf` - Production server configuration

**Use when:** Client-side routing doesn't work, refresh causes 404s, or error handling is missing.

### 6. `build-standalone.sh`
**Builds Next.js with standalone mode and proper static file handling.**

```bash
./build-standalone.sh
```

**What it does:**
1. Cleans previous builds
2. Builds Next.js application
3. Verifies standalone build was created
4. Copies static files to standalone build
5. Provides verification and next steps

**Perfect for:** Docker deployment preparation.

### 7. `docker-build.sh`
**Builds Docker image with all necessary environment variables.**

```bash
./docker-build.sh
```

**What it does:**
- Builds Docker image with build arguments
- Sets all environment variables
- Creates production-ready container
- Provides run instructions

**Environment variables included:**
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_API_ORIGIN`
- `NEXT_PUBLIC_NANGO_API_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- And more...

### 8. `debug-build.js`
**Simple build health checker for quick status verification.**

```bash
node debug-build.js
```

**What it checks:**
- Environment variables
- Environment files
- Build output directory
- TypeScript/ESLint errors
- Dependencies

**Perfect for:** Quick health check after making changes.

## 🎯 Common Workflows

### First Time Setup
```bash
# 1. Run comprehensive diagnostic
node troubleshoot-build.js

# 2. Fix all issues automatically
./fix-all-build-issues.sh

# 3. Test the build
npm run build && npm start
```

### Docker Deployment
```bash
# 1. Build standalone
./build-standalone.sh

# 2. Build Docker image
./docker-build.sh

# 3. Run container
docker run -p 3000:3000 reggie-frontend:latest
```

### Debugging Specific Issues
```bash
# Check what's wrong
node troubleshoot-build.js

# Fix specific issue
node fix-public-path.js  # For asset issues
node fix-csp.js         # For JavaScript issues
node fix-routing.js     # For navigation issues
```

### Quick Health Check
```bash
node debug-build.js
```

## 📋 Troubleshooting Guide

### Issue: Assets return 404
**Solution:**
```bash
node fix-public-path.js
```

### Issue: JavaScript not executing
**Solution:**
```bash
node fix-csp.js
```

### Issue: Client-side routing broken
**Solution:**
```bash
node fix-routing.js
```

### Issue: Build fails
**Solution:**
```bash
node troubleshoot-build.js  # See specific errors
npm install                 # Fix dependencies
npm run build              # Try building again
```

### Issue: Docker container not working
**Solution:**
```bash
./build-standalone.sh
./docker-build.sh
```

## 🔍 Understanding the Output

### ✅ Green Checkmarks
- Configuration is correct
- No issues found
- Ready for production

### ⚠️ Yellow Warnings
- Potential issues that may cause problems
- Recommendations for improvement
- Non-critical but worth addressing

### ❌ Red X's
- Critical issues that need fixing
- Build will likely fail
- Must be addressed before deployment

### ℹ️ Blue Information
- Additional context
- Explanations of findings
- Next steps to take

## 🚀 Best Practices

1. **Always run diagnostic first:**
   ```bash
   node troubleshoot-build.js
   ```

2. **Fix issues systematically:**
   - Start with critical issues (❌)
   - Address warnings (⚠️)
   - Verify fixes work

3. **Test after each fix:**
   ```bash
   npm run build && npm start
   ```

4. **Use automated fixes when possible:**
   ```bash
   ./fix-all-build-issues.sh
   ```

5. **Keep scripts updated:**
   - Scripts are designed for Next.js 15.3.4
   - Update paths if your project structure changes

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Next.js Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)

## 🆘 Getting Help

If scripts don't solve your issue:

1. Check the diagnostic output carefully
2. Look for specific error messages
3. Check browser console for runtime errors
4. Verify environment variables are set correctly
5. Compare dev vs production behavior

## 📝 Script Maintenance

These scripts are designed to be:
- **Non-destructive** - They create new files or add configuration, don't delete existing code
- **Idempotent** - Safe to run multiple times
- **Informative** - Provide clear output about what they're doing
- **Configurable** - Easy to modify for your specific needs

To modify a script:
1. Read the script to understand what it does
2. Make your changes
3. Test with a small change first
4. Run the diagnostic to verify it works
