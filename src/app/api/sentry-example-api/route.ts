import { NextResponse } from "next/server";

// Environment-based flag to enable/disable Sentry example functionality
// Only enabled in development or when explicitly set
const SENTRY_EXAMPLE_ENABLED = process.env.NODE_ENV === 'development' || process.env.ENABLE_SENTRY_EXAMPLE === 'true';

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring
export function GET() {
  if (SENTRY_EXAMPLE_ENABLED) {
    throw new SentryExampleAPIError("This error is raised on the backend called by the example page.");
    return NextResponse.json({ data: "Testing Sentry Error..." });
  } else {
    return NextResponse.json({ 
      message: "Sentry example API route is disabled",
      status: "disabled",
      note: "Enable by setting NODE_ENV=development or ENABLE_SENTRY_EXAMPLE=true"
    });
  }
}
