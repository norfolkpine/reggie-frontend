/**
 * Development proxy configuration
 * This file contains settings for the dev proxy functionality
 */

export const devProxyConfig = {
  // Enable/disable the dev proxy
  enabled: process.env.NEXT_PUBLIC_ENABLE_DEV_PROXY === 'true' || process.env.NODE_ENV === 'development',
  
  // Target domain for development
  targetDomain: process.env.NEXT_PUBLIC_DEV_TARGET_DOMAIN || 'api.opie.sh',
  
  // Enable debug logging
  debug: process.env.NEXT_PUBLIC_DEBUG_PROXY === 'true' || process.env.NODE_ENV === 'development',
  
  // Cookie handling configuration
  cookies: {
    // Modify cookie domain to work locally
    localDomain: 'localhost',
    // Modify cookie path
    localPath: '/',
    // Preserve secure flag
    preserveSecure: false,
  },
  
  // Headers to exclude from proxying
  excludedHeaders: ['host', 'origin', 'referer'],
  
  // User agent for proxy requests
  userAgent: 'Reggie-Dev-Proxy/1.0',
} as const;

/**
 * Check if the dev proxy should be used for a given URL
 */
export function shouldUseDevProxy(url: string): boolean {
  if (!devProxyConfig.enabled) {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.endsWith('.opie.sh');
  } catch {
    return false;
  }
}

/**
 * Get the proxy status for debugging
 */
export function getDevProxyStatus() {
  return {
    enabled: devProxyConfig.enabled,
    targetDomain: devProxyConfig.targetDomain,
    debug: devProxyConfig.debug,
    nodeEnv: process.env.NODE_ENV,
  };
}

