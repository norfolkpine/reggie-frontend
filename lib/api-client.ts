import { getCSRFToken } from "@/api";
import { TOKEN_KEY } from "../lib/constants";

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Smart hostname detection for development
function getSmartBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // In development, try to match the current hostname
  if (typeof window !== 'undefined' && isDevelopment) {
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    // If frontend is on localhost, use localhost for backend
    if (currentHost === 'localhost') {
      return `http://localhost:8000`;
    }
    
    // If frontend is on 127.0.0.1, use 127.0.0.1 for backend
    if (currentHost === '127.0.0.1') {
      return `http://127.0.0.1:8000`;
    }
  }
  
  // Fallback to environment variable or empty string
  return envUrl || '';
}

// Use smart hostname detection for API base URL
export const BASE_URL = getSmartBaseUrl();

// Debug logging in development
if (isDevelopment) {
  console.log('🔧 API Client Configuration:');
  console.log('  - Environment:', process.env.NODE_ENV);
  console.log('  - NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('  - Current window hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
  console.log('  - Final BASE_URL:', BASE_URL);
}

// Validate BASE_URL in production
if (isProduction && !process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL must be set in production');
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

interface AuthContext {
  handleTokenExpiration: () => void;
}

// Auth context management with better encapsulation
class AuthContextManager {
  private static instance: AuthContextManager;
  private authContext: AuthContext | null = null;

  private constructor() {}

  static getInstance(): AuthContextManager {
    if (!AuthContextManager.instance) {
      AuthContextManager.instance = new AuthContextManager();
    }
    return AuthContextManager.instance;
  }

  setAuthContext(context: AuthContext): void {
    this.authContext = context;
  }

  getAuthContext(): AuthContext | null {
    return this.authContext;
  }

  clearAuthContext(): void {
    this.authContext = null;
  }
}

const authManager = AuthContextManager.getInstance();

// Function to set the auth context reference
export function setAuthContext(context: AuthContext): void {
  authManager.setAuthContext(context);
}

// Utility function to manually trigger token expiration (for testing)
export function triggerTokenExpiration(): void {
  const context = authManager.getAuthContext();
  if (context) {
    context.handleTokenExpiration();
  } else {
    // Fallback if auth context is not available - clear storage but don't hard redirect
    if (typeof window !== 'undefined') {
      localStorage.clear();
      console.warn('Auth context not available for token expiration handling');
      // Don't use window.location.href - let the auth context handle navigation
    }
  }
}

// CSRF token management with better security practices
export async function ensureCSRFToken(): Promise<boolean> {
  try {
    if (isDevelopment) {
      console.log('🔍 ensureCSRFToken: Starting CSRF token check...');
    }
    
    // First, try to get the CSRF token from cookies (most efficient)
    let csrfToken = getCSRFToken();
    
    if (csrfToken) {
      if (isDevelopment) {
        console.log('✅ CSRF token found in cookies, length:', csrfToken.length);
      }
      return true;
    }
    
    if (isDevelopment) {
      console.log('❌ No CSRF token found in cookies, trying to get from backend...');
    }
    
    // Try to get CSRF token from Django Allauth config endpoint
    try {
      const csrfResponse = await fetch(`${BASE_URL}/_allauth/browser/v1/config`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (csrfResponse.ok) {
        // Check if we now have a CSRF token in cookies
        csrfToken = getCSRFToken();
        if (csrfToken) {
          if (isDevelopment) {
            console.log('CSRF token retrieved from Django Allauth config endpoint');
          }
          return true;
        }
      } else {
        if (isDevelopment) {
          console.log(`Django Allauth config endpoint returned status: ${csrfResponse.status}`);
        }
      }
    } catch (csrfError) {
      if (isDevelopment) {
        console.log('Django Allauth config endpoint not available or failed:', csrfError);
      }
    }
    
    if (isDevelopment) {
      console.warn('Failed to retrieve CSRF token from backend');
    }
    return false;
    
  } catch (error) {
    if (isDevelopment) {
      console.error('Failed to ensure CSRF token:', error);
    }
    return false;
  }
}



// Function to refresh CSRF token when we get a CSRF error
export async function refreshCSRFToken(): Promise<boolean> {
  if (isDevelopment) {
    console.log('Refreshing CSRF token...');
  }
  
  try {
    // Get a fresh CSRF token from Django Allauth config endpoint
    const response = await fetch(`${BASE_URL}/_allauth/browser/v1/config`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        if (isDevelopment) {
          console.log('CSRF token refreshed successfully');
        }
        return true;
      }
    }
    
    return false;
  } catch (error) {
    if (isDevelopment) {
      console.error('Failed to refresh CSRF token:', error);
    }
    return false;
  }
}

// Improved response handling with better error management
async function handleResponse(response: Response, httpMethod?: string): Promise<unknown> {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Handle authentication/authorization errors
      const context = authManager.getAuthContext();
      if (context) {
        context.handleTokenExpiration();
      } else {
        // Fallback if auth context is not available - clear storage but don't hard redirect
        if (typeof window !== 'undefined') {
          localStorage.clear();
          console.warn('Auth context not available for authentication error handling');
          // Don't use window.location.href - let the auth context handle navigation
        }
      }
    }
    
    // Try to parse error response, fallback to status text
    try {
      const errorData = await response.json();
      throw errorData;
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  // If 204 No Content and DELETE, return nothing
  if (response.status === 204 && httpMethod?.toUpperCase() === 'DELETE') {
    return;
  }
  
  // Try to parse JSON response, fallback to text for non-JSON responses
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
}

// Enhanced API client with CSRF retry logic
async function apiClient(endpoint: string, config: RequestConfig = {}, retryCount = 0): Promise<unknown> {
  const { params, ...requestConfig } = config;
  const token = localStorage.getItem(TOKEN_KEY);

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Get CSRF token and ensure it exists for non-GET requests
  let csrfToken = getCSRFToken();
  
  // For non-GET requests, ensure we have a CSRF token
  if (requestConfig.method && requestConfig.method.toUpperCase() !== 'GET' && !csrfToken) {
    if (isDevelopment) {
      console.log('No CSRF token found, attempting to retrieve...');
    }
    await ensureCSRFToken();
    csrfToken = getCSRFToken();
  }

  const headers: Record<string, string> = {
    // Don't set Content-Type for FormData - browser sets it automatically with boundary
    ...(!(requestConfig.body instanceof FormData) && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(csrfToken && { "X-CSRFToken": csrfToken }),
    ...(config.headers as Record<string, string>),
  };

  if (isDevelopment && csrfToken) {
    console.log('Using CSRF token:', csrfToken.substring(0, 10) + '...');
    console.log('Token length:', csrfToken.length);
    console.log('Headers being sent:', headers);
  }

  try {
    const response = await fetch(url.toString(), {
      ...requestConfig,
      headers,
      credentials: 'include',
    });

    // Check for CSRF errors and retry once with a fresh token
    if ((response.status === 403 || response.status === 409) && retryCount === 0) {
      try {
        const errorData = await response.json();
        
        const isCsrfError = (errorData.detail && errorData.detail.includes('CSRF')) || (Array.isArray(errorData.errors) && errorData.errors.some((err: any) => err.message && err.message.includes('CSRF')));

        if (isCsrfError) {
          if (isDevelopment) {
            console.log(`CSRF error detected (status ${response.status}):`, errorData);
            console.log('Current CSRF token:', csrfToken);
            console.log('Attempting to refresh token...');
          }
          
          // Refresh CSRF token and retry once
          const refreshed = await refreshCSRFToken();
          if (refreshed) {
            if (isDevelopment) {
              console.log('Token refreshed, retrying request...');
            }
            return apiClient(endpoint, config, retryCount + 1);
          } else {
            if (isDevelopment) {
              console.log('Failed to refresh token, trying to get new CSRF token...');
            }
            // Try to get a new CSRF token
            const newToken = await ensureCSRFToken();
            if (newToken) {
              if (isDevelopment) {
                console.log('New CSRF token obtained, retrying request...');
              }
              return apiClient(endpoint, config, retryCount + 1);
            }
          }
        }
      } catch {
        // If we can't parse the error, continue with normal error handling
      }
    }

    return handleResponse(response, requestConfig.method);
  } catch (error) {
    if (isDevelopment) {
      console.error(`Network error when fetching ${url.toString()}:`, error);
    }
    throw error;
  }
}

// Type-safe API methods
export const api = {
  get: (endpoint: string, config?: RequestConfig): Promise<unknown> =>
    apiClient(endpoint, { ...config, method: "GET" }),

  post: <T = unknown>(endpoint: string, data?: T, config?: RequestConfig): Promise<unknown> =>
    apiClient(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T = unknown>(endpoint: string, data?: T, config?: RequestConfig): Promise<unknown> =>
    apiClient(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T = unknown>(endpoint: string, data?: T, config?: RequestConfig): Promise<unknown> =>
    apiClient(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string, config?: RequestConfig): Promise<unknown> =>
    apiClient(endpoint, { ...config, method: "DELETE" }),
    
  options: (endpoint: string, config?: RequestConfig): Promise<unknown> =>
    apiClient(endpoint, { ...config, method: "OPTIONS" }),

  // Multipart form data upload (for file uploads)
  postMultipart: (endpoint: string, formData: FormData, config?: RequestConfig): Promise<unknown> =>
    apiClient(endpoint, {
      ...config,
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type for multipart uploads - let browser set it with boundary
        ...(config?.headers as Record<string, string>),
      },
    }),
};

export default api;