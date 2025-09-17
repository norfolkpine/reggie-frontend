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

# Copy static files to standalone build (required for standalone mode)
RUN cp -r .next/static .next/standalone/.next/

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

# Copy the standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Ensure static files are properly linked in standalone build
RUN mkdir -p .next/static && \
    if [ -d .next/static ]; then \
        echo "Static files copied successfully"; \
    else \
        echo "Warning: Static files not found"; \
    fi

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

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js app using the standalone server
CMD ["node", "server.js"]
