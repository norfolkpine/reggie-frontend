import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the user is authenticated by looking for the token
  const token = request.cookies.get("accessToken")?.value

  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Define protected routes that require authentication
  const protectedRoutes = ["/chat", "/profile", "/settings"]

  // Define authentication routes (login, register)
  const authRoutes = ["/login", "/register"]

  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the requested path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If the route is protected and the user is not authenticated,
  // redirect to the login page
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // If the route is an auth route and the user is authenticated,
  // redirect to the home page
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

