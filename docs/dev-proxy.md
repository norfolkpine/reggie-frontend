# Development Proxy for .opie.sh Domains

This document explains how to use the development proxy that handles session cookies and CSRF tokens from `.opie.sh` domains in your local development environment.

## Overview

The dev proxy automatically intercepts requests to `.opie.sh` domains and routes them through a local API endpoint, ensuring that:

- Session cookies are properly handled
- CSRF tokens are preserved and accessible
- The app works seamlessly in development mode
- Production behavior is unchanged

## How It Works

1. **Automatic Interception**: When you make a `fetch` request to any `.opie.sh` domain in development, it's automatically intercepted
2. **Local Proxying**: The request is routed through `/api/dev-proxy/[subdomain]/[path]`
3. **Cookie Handling**: Cookies from the target domain are modified to work with `localhost`
4. **Transparent Operation**: Your existing code doesn't need to change

## Configuration

The proxy is configured in `config/dev-proxy.config.ts`:

```typescript
export const devProxyConfig = {
  // Enable/disable the dev proxy
  enabled: process.env.NEXT_PUBLIC_ENABLE_DEV_PROXY === 'true' || process.env.NODE_ENV === 'development',
  
  // Target domain for development
  targetDomain: process.env.NEXT_PUBLIC_DEV_TARGET_DOMAIN || 'api.opie.sh',
  
  // Cookie handling
  cookies: {
    localDomain: 'localhost',
    localPath: '/',
    preserveSecure: false,
  },
  
  // Headers to exclude from proxying
  excludedHeaders: ['host', 'origin', 'referer'],
};
```

## Environment Variables

You can control the proxy behavior with these environment variables:

```bash
# Enable/disable the proxy explicitly
NEXT_PUBLIC_ENABLE_DEV_PROXY=true

# Set the target domain
NEXT_PUBLIC_DEV_TARGET_DOMAIN=api.opie.sh

# Enable debug logging
NEXT_PUBLIC_DEBUG_PROXY=true
```

## Usage Examples

### Basic Usage

```typescript
// This will automatically be proxied in development
const response = await fetch('https://api.opie.sh/users');
```

### With CSRF Token

```typescript
import { getCSRFToken } from '@/api/utils';

const csrfToken = getCSRFToken();
const response = await fetch('https://api.opie.sh/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
  },
  body: JSON.stringify(userData),
});
```

### Manual Proxy URL

```typescript
import { getProxiedUrl } from '@/lib/dev-proxy';

const originalUrl = 'https://api.opie.sh/users';
const proxiedUrl = getProxiedUrl(originalUrl);
// In dev: "/api/dev-proxy/api/users"
// In prod: "https://api.opie.sh/users"
```

## Testing

Visit `/dev-proxy-test` in development mode to test the proxy functionality. This page will:

- Show the current proxy status
- Test URL conversion
- Verify proxy requests work
- Check fetch override functionality

## Troubleshooting

### Proxy Not Working

1. **Check Environment**: Ensure `NODE_ENV=development` or `NEXT_PUBLIC_ENABLE_DEV_PROXY=true`
2. **Check Console**: Look for `[Dev Proxy]` messages in the browser console
3. **Verify Routes**: Ensure the proxy API route is accessible at `/api/dev-proxy/[...path]`

### Cookies Not Persisting

1. **Check Domain**: Cookies should be set to `localhost` in development
2. **Check Path**: Cookies should have path `/`
3. **Check Secure Flag**: Secure cookies are automatically removed in development

### CSRF Token Issues

1. **Check Proxy**: Ensure the proxy is intercepting requests to `.opie.sh`
2. **Check Headers**: Verify `X-CSRFToken` header is being sent
3. **Check Cookies**: Ensure `csrftoken` cookie is accessible

## Architecture

```
Client Request → Dev Proxy → .opie.sh Domain
     ↓              ↓            ↓
  fetch() → /api/dev-proxy/ → https://api.opie.sh/
     ↓              ↓            ↓
  Response ← Modified Cookies ← Original Response
```

## Security Notes

- The proxy only runs in development mode
- Production builds ignore all proxy functionality
- Cookies are automatically modified for local development
- Secure flags are removed in development for localhost compatibility

## Development

To modify the proxy behavior:

1. **Configuration**: Edit `config/dev-proxy.config.ts`
2. **API Route**: Modify `app/api/dev-proxy/[...path]/route.ts`
3. **Utilities**: Update `lib/dev-proxy.ts`
4. **Testing**: Use the test page at `/dev-proxy-test`

## Related Files

- `config/dev-proxy.config.ts` - Configuration
- `lib/dev-proxy.ts` - Utility functions
- `app/api/dev-proxy/[...path]/route.ts` - API route
- `app/dev-proxy-test/page.tsx` - Test page
- `app/layout.tsx` - Initialization

