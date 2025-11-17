# Sentry Integration Setup

## Overview

This project uses Sentry for error tracking, performance monitoring, and source map uploads. Sentry provides real-time error tracking and performance monitoring for the Next.js application.

## Configuration Files

### Core Configuration
- **`next.config.mjs`** - Main Sentry webpack plugin configuration
- **`sentry.server.config.ts`** - Server-side Sentry initialization
- **`sentry.edge.config.ts`** - Edge runtime Sentry initialization
- **`instrumentation.ts`** - Application instrumentation setup
- **`instrumentation-client.ts`** - Client-side Sentry initialization

### Sentry Organization Details
- **Organization:** `ben-heath-pty-ltd`
- **Project:** `bh-opie-frontend`
- **DSN:** Configured via environment variables (see below)

## CI/CD Setup

### GitHub Actions Configuration

The Sentry authentication token is configured in the CI/CD pipeline for source map uploads during builds.

#### Required Secrets
Add the following secrets to your GitHub repository:
- **`SENTRY_AUTH_TOKEN`** - Your Sentry authentication token for source map uploads
- **`NEXT_PUBLIC_SENTRY_DSN`** - Your Sentry DSN for error tracking (must be prefixed with `NEXT_PUBLIC_` for Next.js)

#### Workflow Configuration
The `.github/workflows/deploy.yml` file is configured to:
1. Set the `SENTRY_AUTH_TOKEN` as an environment variable during the build step
2. Allow the Sentry webpack plugin to upload source maps during the Docker build process

```yaml
- name: Build Docker image
  run: |
    IMAGE_FRONTEND=gcr.io/${PROJECT_ID}/${IMAGE_NAME_FRONTEND}:latest
    SENTRY_AUTH_TOKEN=${{ secrets.SENTRY_AUTH_TOKEN }} \
    NEXT_PUBLIC_SENTRY_DSN=${{ secrets.NEXT_PUBLIC_SENTRY_DSN }} \
    docker build \
      --build-arg NEXT_PUBLIC_DEFAULT_AGENT_ID=${{ secrets.NEXT_PUBLIC_DEFAULT_AGENT_ID }} \
      --build-arg NEXT_PUBLIC_API_ORIGIN=${{ secrets.NEXT_PUBLIC_API_ORIGIN }} \
      --build-arg NEXT_PUBLIC_API_BASE_URL=${{ secrets.NEXT_PUBLIC_API_BASE_URL }} \
      --build-arg COLLABORATION_WS_URL=${{ secrets.COLLABORATION_WS_URL }} \
      --build-arg NEXT_PUBLIC_SENTRY_DSN=${{ secrets.NEXT_PUBLIC_SENTRY_DSN }} \
      -t $IMAGE_FRONTEND .
```

## Local Development

### Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Test Sentry integration:**
   Visit `/sentry-example-page` to test error reporting and connectivity.

### Environment Variables
For local development, you may need to set the following environment variables:
- `SENTRY_AUTH_TOKEN` - For source map uploads during builds
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking

**Note:** The DSN value is now configurable via environment variables. If not set, it will fall back to the default value for backward compatibility.

## Error Tracking

### Automatic Error Capture
Sentry automatically captures:
- Unhandled JavaScript errors
- Network request failures
- Performance issues
- React component errors

### Manual Error Reporting
Use Sentry's API to manually capture errors:

```tsx
import * as Sentry from "@sentry/nextjs";

// Capture exceptions
try {
  // Your code here
} catch (error) {
  Sentry.captureException(error);
}

// Capture messages
Sentry.captureMessage("Something went wrong", "error");
```

### Performance Monitoring
Track performance with spans:

```tsx
import * as Sentry from "@sentry/nextjs";

const transaction = Sentry.startTransaction({
  name: "My Transaction",
  op: "operation",
});

// Your code here

transaction.finish();
```

## Source Maps

### Automatic Upload
Source maps are automatically uploaded to Sentry during CI builds when:
- `SENTRY_AUTH_TOKEN` is set as an environment variable
- The build runs in a CI environment (`CI=true`)

### Configuration
Source map upload is configured in `next.config.mjs`:
- **Widen client file upload:** Enabled for prettier stack traces
- **Silent mode:** Only prints logs in CI environments
- **Tree shaking:** Automatically removes Sentry logger statements

## Monitoring Features

### Error Boundaries
React error boundaries are configured to capture component errors:

```tsx
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error, {
  contexts: {
    react: {
      componentStack: errorInfo.componentStack,
    },
  },
});
```

### Performance Monitoring
- **Automatic instrumentation** of Next.js pages and API routes
- **Custom spans** for business logic
- **Database query monitoring** (if configured)
- **Vercel Cron Monitors** (automatic instrumentation)

### User Context
Set user information for better error tracking:

```tsx
Sentry.setUser({
  id: "user-id",
  email: "user@example.com",
  username: "username",
});
```

## Troubleshooting

### Common Issues

1. **Source maps not uploading:**
   - Verify `SENTRY_AUTH_TOKEN` is set in GitHub secrets
   - Check that the token has the correct permissions
   - Ensure the build is running in CI environment

2. **Errors not appearing in Sentry:**
   - Verify the DSN is correct
   - Check network connectivity to Sentry
   - Ensure Sentry is properly initialized

3. **Performance data missing:**
   - Verify performance monitoring is enabled
   - Check that transactions are being created and finished properly

### Testing Sentry Integration
1. Visit `/sentry-example-page` in your application
2. Click the test buttons to generate sample errors
3. Check your Sentry dashboard for the captured events

### Debug Mode
Enable debug mode for troubleshooting:
```tsx
Sentry.init({
  dsn: "your-dsn",
  debug: true, // Enable debug mode
});
```

## Best Practices

### Error Handling
- Always wrap async operations in try-catch blocks
- Use error boundaries for React components
- Provide meaningful error messages
- Include relevant context with errors

### Performance Monitoring
- Create custom spans for business logic
- Monitor critical user journeys
- Set up alerts for performance regressions
- Use transactions to group related operations

### Security
- Never log sensitive information
- Use Sentry's data scrubbing features
- Regularly review and clean up old data
- Monitor for unusual error patterns

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Webpack Plugin](https://www.npmjs.com/package/@sentry/webpack-plugin)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/)

---

**Note:** This documentation should be updated whenever Sentry configuration changes or new features are added. 