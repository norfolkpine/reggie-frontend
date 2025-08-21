import { NextRequest, NextResponse } from 'next/server';
import { devProxyConfig } from '@/config/dev-proxy.config';

// Only allow this proxy when enabled
if (!devProxyConfig.enabled) {
  throw new Error('Dev proxy is not enabled');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxyRequest(request, params.path, 'PATCH');
}

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Construct the target URL
    const path = pathSegments.join('/');
    const targetUrl = `https://${path}.opie.sh`;
    
    // Get the request body if it exists
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (e) {
        // No body to read
      }
    }

    // Prepare headers for the proxy request
    const headers = new Headers();
    
    // Copy relevant headers from the original request
    request.headers.forEach((value, key) => {
      // Skip headers that shouldn't be proxied
      if (!devProxyConfig.excludedHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Set the host header to the target domain
    headers.set('host', `${path}.opie.sh`);
    
    // Ensure we include credentials
    headers.set('accept', request.headers.get('accept') || '*/*');
    headers.set('user-agent', request.headers.get('user-agent') || devProxyConfig.userAgent);

    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    // Add body for non-GET requests
    if (body) {
      fetchOptions.body = body;
    }

    // Make the request to the target domain
    const response = await fetch(targetUrl, fetchOptions);

    // Create a new response with the proxied content
    const responseBody = await response.text();
    const newResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      // Handle cookies specially to ensure they work in the local domain
      if (key.toLowerCase() === 'set-cookie') {
        // Modify the cookie domain to work locally
        const modifiedCookie = value
          .split(';')
          .map(part => {
            if (part.trim().toLowerCase().startsWith('domain=')) {
              return `Domain=${devProxyConfig.cookies.localDomain}`;
            }
            if (part.trim().toLowerCase().startsWith('path=')) {
              return `Path=${devProxyConfig.cookies.localPath}`;
            }
            // Remove secure flag in development if configured
            if (!devProxyConfig.cookies.preserveSecure && part.trim().toLowerCase().startsWith('secure')) {
              return '';
            }
            return part;
          })
          .filter(part => part !== '') // Remove empty parts
          .join('; ');
        newResponse.headers.append('set-cookie', modifiedCookie);
      } else {
        newResponse.headers.set(key, value);
      }
    });

    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
