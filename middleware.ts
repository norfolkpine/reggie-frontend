import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle Django Allauth proxy
  if (pathname.startsWith('/_allauth/')) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
    const targetUrl = new URL(pathname + request.nextUrl.search, apiBaseUrl)
    
    try {
      // Prepare headers for Django backend
      const headers: Record<string, string> = {}
      request.headers.forEach((value, key) => {
        // Skip host header as we'll set it manually
        if (key.toLowerCase() !== 'host') {
          headers[key] = value
        }
      })
      headers['host'] = new URL(apiBaseUrl).host
      
      // Prepare request body
      let body: string | undefined
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.text()
      }
      
      // Forward the request to Django backend
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers,
        body,
      })
      
      // Create response with the same status and headers
      const nextResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
      })
      
      // Copy headers from Django response
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') {
          nextResponse.headers.set(key, value)
        }
      })
      
      // Handle Set-Cookie headers with domain rewriting for localhost
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          let modifiedCookie = value.trim()
          
          // Replace opie.sh domain with localhost for development
          if (modifiedCookie.includes('Domain=.opie.sh')) {
            modifiedCookie = modifiedCookie.replace('Domain=.opie.sh', 'Domain=localhost')
          }
          if (modifiedCookie.includes('Domain=opie.sh')) {
            modifiedCookie = modifiedCookie.replace('Domain=opie.sh', 'Domain=localhost')
          }
          
          // Remove Secure flag for localhost (HTTP)
          if (modifiedCookie.includes('; Secure')) {
            modifiedCookie = modifiedCookie.replace('; Secure', '')
          }
          
          // Ensure SameSite=Lax for compatibility
          if (!modifiedCookie.includes('SameSite=')) {
            modifiedCookie += '; SameSite=Lax'
          }
          
          // Set Path to root if not specified
          if (!modifiedCookie.includes('Path=')) {
            modifiedCookie += '; Path=/'
          }
          
          nextResponse.headers.append('set-cookie', modifiedCookie)
        }
      })
      
      return nextResponse
      
    } catch (error) {
      console.error(`Middleware proxy error for ${pathname}:`, error)
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Backend service unavailable', 
          message: 'Unable to connect to the Django backend service.',
          code: 'CONNECTION_ERROR'
        }), 
        { 
          status: 503, 
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
  
  return NextResponse.next()
}

// Configure the middleware to run on API and auth routes
export const config = {
  matcher: [
    '/_allauth/:path*',
  ],
}

