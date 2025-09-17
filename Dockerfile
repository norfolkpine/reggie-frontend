# ---- Build Stage ----
FROM node:24.4.1-alpine AS builder

# Set working directory
WORKDIR /app

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_DEFAULT_AGENT_ID
ARG NEXT_PUBLIC_API_ORIGIN
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_NANGO_API_URL
ARG NEXT_PUBLIC_NANGO_BASE_URL
ARG COLLABORATION_WS_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_AUTH_TOKEN

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm install; fi

# Copy all files
COPY . .

# Set environment variables for build
ENV NEXT_PUBLIC_DEFAULT_AGENT_ID=$NEXT_PUBLIC_DEFAULT_AGENT_ID
ENV NEXT_PUBLIC_API_ORIGIN=$NEXT_PUBLIC_API_ORIGIN
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_NANGO_API_URL=$NEXT_PUBLIC_NANGO_API_URL
ENV NEXT_PUBLIC_NANGO_BASE_URL=$NEXT_PUBLIC_NANGO_BASE_URL
ENV COLLABORATION_WS_URL=$COLLABORATION_WS_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

# Build the Next.js app
RUN npm run build

# ---- Production Stage ----
FROM node:24.4.1-alpine AS runner

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_DEFAULT_AGENT_ID
ARG NEXT_PUBLIC_API_ORIGIN
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_NANGO_API_URL
ARG NEXT_PUBLIC_NANGO_BASE_URL
ARG COLLABORATION_WS_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_AUTH_TOKEN

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set environment variables (can be customized)
ENV NODE_ENV=production
ENV NEXT_PUBLIC_DEFAULT_AGENT_ID=$NEXT_PUBLIC_DEFAULT_AGENT_ID
ENV NEXT_PUBLIC_API_ORIGIN=$NEXT_PUBLIC_API_ORIGIN
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_NANGO_API_URL=$NEXT_PUBLIC_NANGO_API_URL
ENV NEXT_PUBLIC_NANGO_BASE_URL=$NEXT_PUBLIC_NANGO_BASE_URL
ENV COLLABORATION_WS_URL=$COLLABORATION_WS_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

# Switch to non-root user
USER nextjs

# Expose the port Next.js runs on
EXPOSE 3000

# Set the hostname to 0.0.0.0 to allow external connections
ENV HOSTNAME="0.0.0.0"

# Start the Next.js app
CMD ["node", "server.js"]
