# Deployment Configuration Guide

This document contains the configuration changes needed to switch between different deployment platforms.

## Current Configuration: Cloudflare Pages (Static Export)

### Files Modified for Cloudflare Pages:

#### 1. `next.config.mjs`
```javascript
// Cloudflare Pages configuration - static export
// Changed from 'standalone' (Vercel) to 'export' (Cloudflare Pages)
output: 'export', // Generate static files for Cloudflare Pages
trailingSlash: true, // Add trailing slashes to URLs for better routing
distDir: 'out', // Output directory for static files

images: {
  unoptimized: true, // Required for static export
},

// Sentry configuration - tunnelRoute disabled for static export
// DISABLED for static export (Cloudflare Pages) - tunnelRoute doesn't work with static exports
// tunnelRoute: "/monitoring",
```

#### 2. `wrangler.toml` (New file)
```toml
# Cloudflare Pages configuration for Reggie Frontend
name = "reggie-frontend"
compatibility_date = "2024-01-01"

# Production environment
[env.production]
name = "reggie-frontend"

# Staging environment
[env.staging]
name = "reggie-frontend-staging"

# Cloudflare Pages build configuration
# This tells Cloudflare Pages where to find the built static files
pages_build_output_dir = "out"
```

---

## To Switch Back to Vercel (Standalone Build)

### 1. Update `next.config.mjs`

Replace the Cloudflare Pages configuration with Vercel configuration:

```javascript
// Vercel configuration - standalone build
output: 'standalone', // Generate standalone build for Vercel
// Remove trailingSlash: true,
// Remove distDir: 'out',

images: {
  unoptimized: false, // Vercel can optimize images
},

// Re-enable Sentry tunnelRoute for Vercel
tunnelRoute: "/monitoring",
```

### 2. Remove `wrangler.toml`
```bash
rm wrangler.toml
```

### 3. Update `.gitignore` (if needed)
Remove the `out` directory from `.gitignore` if it was added:
```
# Remove this line if it exists:
# out/
```

---

## Build Commands

### For Cloudflare Pages:
```bash
npm run build
# Output: Creates 'out' directory with static files
```

### For Vercel:
```bash
npm run build
# Output: Creates '.next' directory with standalone build
```

---

## Deployment Settings

### Cloudflare Pages:
- **Build Command**: `npm run build`
- **Build Output Directory**: `out`
- **Node.js Version**: 18.x or 20.x

### Vercel:
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Node.js Version**: 18.x or 20.x

---

## Key Differences

| Feature | Cloudflare Pages | Vercel |
|---------|------------------|--------|
| Build Type | Static Export | Standalone |
| Output Dir | `out` | `.next` |
| Images | Unoptimized | Optimized |
| Sentry Tunnel | Disabled | Enabled |
| Server Features | None | Full SSR/API Routes |
| Routing | Static files | Dynamic routing |

---

## Dynamic Routes Configuration

For static export, all dynamic routes must have `generateStaticParams()` function:

### Files that need `generateStaticParams()`:
- `app/(dashboard)/chat/[sessionId]/page.tsx`
- `app/(dashboard)/documents/[id]/page.tsx`

### Example implementation:
```typescript
// Required for static export - generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for now - this route will be handled client-side
  // In a real app, you might want to pre-generate common IDs
  return []
}
```

## Notes

- **Static Export Limitations**: Cloudflare Pages static export doesn't support:
  - Server-side rendering (SSR)
  - API routes
  - Dynamic routes at build time (requires generateStaticParams)
  - Image optimization
  - Sentry tunnel routes

- **Standalone Build Benefits**: Vercel standalone build supports:
  - Full Next.js features
  - Server-side rendering
  - API routes
  - Image optimization
  - Advanced Sentry features

---

## Quick Switch Commands

### To Cloudflare Pages:
```bash
# Update next.config.mjs with export configuration
# Create wrangler.toml
# Build and deploy
npm run build
```

### To Vercel:
```bash
# Update next.config.mjs with standalone configuration
# Remove wrangler.toml
# Build and deploy
npm run build
```

---

*Last updated: $(date)*
