import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_KEY } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that do not require authentication
  const publicRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/otp"];

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    return NextResponse.next();
  }

  if (!token && !isPublicRoute) {
    // If no token and not a public route, redirect to sign-in
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (token && isPublicRoute) {
    // If token exists and trying to access a public route, redirect to dashboard
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

