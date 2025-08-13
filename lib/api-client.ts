import { getCSRFToken } from "@/api";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";

// Debug: Log env variable at build time
console.log('BUILD: process.env.NEXT_PUBLIC_API_BASE_URL =', process.env.NEXT_PUBLIC_API_BASE_URL);

// Robust BASE_URL logic
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// Debug: Log BASE_URL at runtime (both server and client)
if (typeof window === 'undefined') {
  console.log('SERVER: BASE_URL =', BASE_URL);
} else {
  console.log('CLIENT: BASE_URL =', BASE_URL);
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  // method is already inherited from RequestInit
}

// Global auth context reference - will be set by the auth provider
let authContext: { handleTokenExpiration: () => void } | null = null;

// Function to set the auth context reference
export function setAuthContext(context: { handleTokenExpiration: () => void }) {
  authContext = context;
}

// Utility function to manually trigger token expiration (for testing)
export function triggerTokenExpiration() {
  if (authContext) {
    authContext.handleTokenExpiration();
  } else {
    // Fallback if auth context is not available
    localStorage.clear();
    if (typeof window !== 'undefined') {
      window.location.href = "/sign-in";
    }
  }
}

export async function ensureCSRFToken() {
  try {
    // First, try to get the CSRF token from cookies
    let csrfToken = getCSRFToken();
    
    if (!csrfToken) {
      // If no CSRF token exists, make a request to a Django page that will set it
      // We'll use the config endpoint but ensure it sets the cookie
      const response = await fetch(`${BASE_URL}/_allauth/browser/v1/config`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });
      
      if (response.ok) {
        // Check if we now have a CSRF token
        csrfToken = getCSRFToken();
        console.log('CSRF token retrieved:', csrfToken);
      }
      
      // If still no CSRF token, try to get it from a dedicated endpoint
      if (!csrfToken) {
        try {
          const csrfResponse = await fetch(`${BASE_URL}/_allauth/browser/v1/csrf-token`, {
            method: 'GET',
            credentials: 'include'
          });
          
          if (csrfResponse.ok) {
            const csrfData = await csrfResponse.json();
            csrfToken = csrfData.csrfToken;
            console.log('CSRF token from endpoint:', csrfToken);
          }
        } catch (csrfError) {
          console.log('CSRF endpoint not available, continuing with cookie method');
        }
      }
    }
    
    return !!csrfToken;
  } catch (error) {
    console.error('Failed to ensure CSRF token:', error);
    return false;
  }
}


async function handleResponse(response: Response, httpMethod?: string) {
  if (!response.ok) {
    if(response.status === 401 || response.status === 403) {
      // Handle authentication/authorization errors
      if (authContext) {
        authContext.handleTokenExpiration();
      } else {
        // Fallback if auth context is not available
        localStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      }
    }
    throw await response.json();
  }
  // If 204 No Content and DELETE, return nothing
  if (response.status === 204 && (httpMethod?.toUpperCase() === 'DELETE')) {
    return;
  }
  return response.json();
}

async function apiClient(endpoint: string, config: RequestConfig = {}) {
  const { params, ...requestConfig } = config;
  const token = localStorage.getItem(TOKEN_KEY);

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const csrfToken = getCSRFToken();
  console.log("csrfToken", csrfToken);

  const headers = {
    "Content-Type": "application/json",
    "credentials": "include",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(csrfToken && { "X-CSRFToken": csrfToken }),
    ...config.headers,
  };

  try {
    const response = await fetch(url.toString(), {
      ...requestConfig,
      headers,
      credentials: 'include',
    });

    // Pass HTTP method to handleResponse if available
    return handleResponse(response, requestConfig.method);
  } catch (error) {
    console.error(`Network error when fetching ${url.toString()}:`, error);
    throw error;
  }
}

export const api = {
  // Base HTTP methods
  get: (endpoint: string, config?: RequestConfig) =>
    apiClient(endpoint, { ...config, method: "GET" }),

  post: (endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string, config?: RequestConfig) =>
    apiClient(endpoint, { ...config, method: "DELETE" }),
  options:  (endpoint: string, config?: RequestConfig) =>
    apiClient(endpoint, { ...config, method: "OPTIONS" }),
};

export default api;