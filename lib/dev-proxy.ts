/**
 * Development proxy utilities for handling .opie.sh domain requests
 * This module provides simple URL conversion utilities
 */

import { devProxyConfig, shouldUseDevProxy } from '@/config/dev-proxy.config';

/**
 * Converts a .opie.sh URL to use the local dev proxy
 * @param url - The original URL (e.g., "https://api.opie.sh/endpoint")
 * @returns The proxied URL for development (e.g., "/api/dev-proxy/api/endpoint")
 */
export function getProxiedUrl(url: string): string {
  if (!devProxyConfig.enabled) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Check if this is a .opie.sh domain
    if (urlObj.hostname.endsWith('.opie.sh')) {
      // Extract the subdomain and path
      const subdomain = urlObj.hostname.replace('.opie.sh', '');
      const path = urlObj.pathname + urlObj.search;
      
      // Return the proxy URL
      return `/api/dev-proxy/${subdomain}${path}`;
    }
    
    return url;
  } catch (error) {
    console.warn('Invalid URL for proxy conversion:', url);
    return url;
  }
}

/**
 * Checks if a URL should be proxied
 */
export function shouldProxyUrl(url: string): boolean {
  return shouldUseDevProxy(url);
}

/**
 * Gets the proxy status for debugging
 */
export function getProxyStatus(): {
  isDevelopment: boolean;
  isEnabled: boolean;
} {
  return {
    isDevelopment: devProxyConfig.enabled,
    isEnabled: devProxyConfig.enabled,
  };
}

/**
 * Simple function to make a proxied request
 * @param url - The original .opie.sh URL
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function proxiedFetch(url: string, options?: RequestInit): Promise<Response> {
  if (shouldProxyUrl(url)) {
    const proxiedUrl = getProxiedUrl(url);
    console.log(`[Dev Proxy] Proxying ${url} -> ${proxiedUrl}`);
    return fetch(proxiedUrl, options);
  }
  
  return fetch(url, options);
}
