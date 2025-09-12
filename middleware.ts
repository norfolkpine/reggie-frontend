import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, _next, and public assets
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",

  ],
}

