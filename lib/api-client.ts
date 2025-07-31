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
    window.location.href = "/sign-in";
  }
}

async function handleResponse(response: Response, httpMethod?: string) {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const refreshTokenLocal = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshTokenLocal) {
        try {
          const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshTokenLocal }),
            credentials: 'include',
          });

          if (!refreshResponse.ok) {
            // Use auth context to handle token expiration
            if (authContext) {
              authContext.handleTokenExpiration();
            } else {
              // Fallback if auth context is not available
              localStorage.clear();
              window.location.href = "/sign-in";
            }
            throw new Error("Refresh token failed");
          }

          const { access, refresh } = await refreshResponse.json();
          localStorage.setItem(TOKEN_KEY, access);
          localStorage.setItem(REFRESH_TOKEN_KEY, refresh);

          // Retry the original request with new token
          const retryResponse = await fetch(response.url, {
            ...response,
            headers: {
              ...response.headers,
              Authorization: `Bearer ${access}`,
            },
            credentials: 'include',
          });

          return handleResponse(retryResponse, httpMethod);
        } catch (error) {
          // Use auth context to handle token expiration
          if (authContext) {
            authContext.handleTokenExpiration();
          } else {
            // Fallback if auth context is not available
            localStorage.clear();
            window.location.href = "/sign-in";
          }
          throw error;
        }
      } else {
        // No refresh token available, redirect to sign-in
        if (authContext) {
          authContext.handleTokenExpiration();
        } else {
          localStorage.clear();
          window.location.href = "/sign-in";
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

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
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