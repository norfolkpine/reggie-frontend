import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_KEY } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that do not require authentication
  const publicRoutes = [
    "/sign-in", 
    "/sign-up", 
    "/forgot-password", 
    "/otp",
    "/test-token-expiration",
    "/test-csrf-fix",
    ...(process.env.NODE_ENV === 'development' ? ["/sentry-example-page"] : [])
  ];

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/assets/');

  // Skip middleware for API routes and static assets
  if (isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // If no session cookie and not a public route, redirect to sign-in
  if (!sessionCookie && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // If session cookie exists and trying to access a public route, redirect to dashboard
  if (sessionCookie && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, _next, and public assets
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",

  ],
}

