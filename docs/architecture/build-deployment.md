# Build and Deployment

This document describes the build configuration, deployment process, and infrastructure setup for the reggie-frontend application.

## Overview

The application is built with Next.js 15 and can be deployed to various platforms including Vercel, Google Cloud Run, and Cloudflare Pages. The build process is optimized for production with standalone output mode.

## Build Configuration

### Next.js Configuration

**Location:** `next.config.mjs`

### Key Settings

```typescript
const nextConfig = {
  // Output mode for deployment
  output: 'standalone',  // Generates standalone server for Vercel
  
  // Trailing slashes for better routing
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: true,  // Disable image optimization
  },
  
  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
    NEXT_PUBLIC_NANGO_API_URL: process.env.NEXT_PUBLIC_NANGO_API_URL,
    NEXT_PUBLIC_NANGO_BASE_URL: process.env.NEXT_PUBLIC_NANGO_BASE_URL,
  },
}
```

### Sentry Integration

The configuration includes Sentry for error tracking:

```typescript
export default withSentryConfig(nextConfig, {
  org: "ben-heath-pty-ltd",
  project: "bh-opie-frontend",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
```

## Build Process

### Local Development Build

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start
```

### Build Output

With `output: 'standalone'`, Next.js generates:

```
.next/
├── standalone/          # Standalone server files
│   ├── server.js
│   └── ...
├── static/             # Static assets
└── ...
```

## TypeScript Configuration

**Location:** `tsconfig.json`

### Key Settings

```json
{
  "compilerOptions": {
    "target": "ES6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Path Aliases

All imports use the `@/` alias:

```typescript
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
```

## Environment Variables

### Required Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Optional Variables

```env
NEXT_PUBLIC_NANGO_API_URL=...
NEXT_PUBLIC_NANGO_BASE_URL=...
```

### Environment-Specific Configuration

- **Development**: Uses localhost backend by default
- **Production**: Requires `NEXT_PUBLIC_API_BASE_URL` to be set

## Docker Deployment

### Dockerfile

**Location:** `Dockerfile`

The Dockerfile uses a multi-stage build:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Build

```bash
# Build image
docker build -t reggie-frontend .

# Run container
docker run -p 3000:3000 reggie-frontend
```

### Docker Compose

**Location:** `docker-compose.yml`

For local development with Docker:

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8000
```

## Google Cloud Build

### Cloud Build Configuration

**Location:** `cloudbuild.yaml`

### Build Steps

```yaml
steps:
  # Build the application
  - name: 'gcr.io/cloud-builders/npm'
    args: ['install']
  
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'build']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'reggie-frontend'
      - '--source'
      - '.'
```

### Cloud Run Deployment

**Location:** `cloudbuild-cloudrun.yaml`

Deploys to Google Cloud Run with:

- Automatic scaling
- HTTPS by default
- Environment variable configuration
- Region selection

## Vercel Deployment

### Configuration

Vercel automatically detects Next.js and configures:

- Build command: `next build`
- Output directory: `.next`
- Install command: `pnpm install`

### Environment Variables

Set in Vercel dashboard:

```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_NANGO_API_URL=...
NEXT_PUBLIC_NANGO_BASE_URL=...
```

### Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

## Cloudflare Pages

### Configuration

For Cloudflare Pages, change output mode:

```typescript
// next.config.mjs
output: 'export'  // Static export for Cloudflare Pages
```

### Build Settings

- **Build command**: `pnpm build`
- **Build output directory**: `out`
- **Node version**: 18+

## Build Optimization

### Code Splitting

Next.js automatically:
- Splits code by route
- Lazy loads components
- Optimizes bundle size

### Image Optimization

Currently disabled (`unoptimized: true`). To enable:

```typescript
images: {
  unoptimized: false,
  domains: ['example.com'],
}
```

### Bundle Analysis

Analyze bundle size:

```bash
# Install analyzer
pnpm add -D @next/bundle-analyzer

# Analyze
ANALYZE=true pnpm build
```

## Performance Optimization

### Static Generation

Use static generation where possible:

```typescript
// app/page.tsx
export default async function Page() {
  const data = await fetchData()
  return <PageContent data={data} />
}
```

### Dynamic Imports

Lazy load heavy components:

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false,
})
```

### Font Optimization

Fonts are optimized with `next/font`:

```typescript
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})
```

## Monitoring and Error Tracking

### Sentry Integration

**Configuration Files:**
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- `instrumentation.ts` - Automatic instrumentation

### Error Tracking

Sentry automatically tracks:
- Unhandled errors
- API errors
- Performance issues
- User sessions

## CI/CD Pipeline

### GitHub Actions (Example)

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
```

## Best Practices

1. **Environment Variables**: Never commit sensitive variables
2. **Build Optimization**: Use standalone output for server deployments
3. **Error Tracking**: Configure Sentry for production
4. **Type Safety**: Keep TypeScript strict mode enabled
5. **Bundle Size**: Monitor and optimize bundle size
6. **Caching**: Leverage Next.js caching strategies
7. **Security**: Keep dependencies updated

## Troubleshooting

### Build Errors

**TypeScript Errors:**
- Check `tsconfig.json` configuration
- Ensure all types are properly defined

**Module Resolution:**
- Verify path aliases in `tsconfig.json`
- Check import paths use `@/` alias

**Environment Variables:**
- Ensure `NEXT_PUBLIC_*` prefix for client-side variables
- Verify variables are set in deployment platform

### Deployment Issues

**Static Export Issues:**
- Check for dynamic routes that need server-side rendering
- Verify API routes are not used with static export

**Docker Issues:**
- Ensure Node.js version matches Dockerfile
- Check port configuration

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [API Layer](./api-layer.md)
- [Deployment Guide](../deployment/README.md)

