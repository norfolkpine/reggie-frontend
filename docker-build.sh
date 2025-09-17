#!/bin/bash

# Docker build script for Reggie Frontend
echo "🐳 Building Reggie Frontend Docker Image..."

# Build the Docker image
docker build \
  --build-arg NEXT_PUBLIC_DEFAULT_AGENT_ID="o-8e3621016-reggie" \
  --build-arg NEXT_PUBLIC_API_ORIGIN="https://app.opie.sh" \
  --build-arg NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000" \
  --build-arg NEXT_PUBLIC_NANGO_API_URL="https://nango.opie.sh" \
  --build-arg NEXT_PUBLIC_NANGO_BASE_URL="https://connect.opie.sh" \
  --build-arg COLLABORATION_WS_URL="wss://collab.opie.sh:4444/collaboration/ws/" \
  --build-arg NEXT_PUBLIC_SENTRY_DSN="https://1549fc718b029bc85a39dc02d18adacc@o4509706557915136.ingest.us.sentry.io/4509738327539712" \
  --build-arg SENTRY_AUTH_TOKEN="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" \
  -t reggie-frontend:latest .

echo "✅ Docker image built successfully!"
echo "🚀 To run the container:"
echo "   docker run -p 3000:3000 reggie-frontend:latest"
