import { getCSRFToken } from "@/api";

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
  logout: () => Promise<void>;
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




// Request deduplication to prevent multiple concurrent 401 handlers
const pendingAuthHandlers = new Set<string>();

// Improved response handling with better error management
async function handleResponse(response: Response, httpMethod?: string): Promise<unknown> {
  // Check if response is not ok OR if it has an error status (like 400)
  if (!response.ok || response.status >= 400) {
    if (response.status === 401 || response.status === 403) {
      // Handle authentication/authorization errors
      const context = authManager.getAuthContext();
      if (context) {
        // Fix 401/403 logic: 401 = unauthorized (session expired) → logout, 403 = forbidden (CSRF) → retry
        if (response.status === 401) {
          // Session expired - logout and clear all data
          console.log('401 Unauthorized response received - logging out user and redirecting to login');
          const handlerKey = 'logout';
          if (!pendingAuthHandlers.has(handlerKey)) {
            pendingAuthHandlers.add(handlerKey);
            context.logout().finally(() => {
              pendingAuthHandlers.delete(handlerKey);
            });
          }
        } else if (response.status === 403) {
          // CSRF or permission error - just clear user state, don't logout
          const handlerKey = 'token-expiration';
          if (!pendingAuthHandlers.has(handlerKey)) {
            pendingAuthHandlers.add(handlerKey);
            context.handleTokenExpiration();
            pendingAuthHandlers.delete(handlerKey);
          }
        }
      } else {
        // Fallback if auth context is not available - clear storage and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('opie.auth.user');
          console.warn('Auth context not available for authentication error handling');
          // Redirect to login page as fallback
          window.location.href = '/sign-in';
        }
      }
    }
    
    // Try to parse error response, fallback to status text
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      // If JSON parsing fails, create a generic error
      const errorObj = {
        status: response.status,
        statusText: response.statusText,
        message: `HTTP ${response.status}: ${response.statusText}`,
        errors: [{
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: 'http_error',
          param: undefined
        }]
      };
      throw errorObj;
    }
    
    // If we successfully parsed the JSON, create enhanced error and throw it
    const enhancedError = {
      ...errorData,
      status: response.status,
      statusText: response.statusText
    };
    throw enhancedError;
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

// Enhanced API client without retry logic
async function apiClient(endpoint: string, config: RequestConfig = {}): Promise<unknown> {
  const { params, ...requestConfig } = config;

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
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(csrfToken && { "X-CSRFToken": csrfToken }),
    ...(config.headers as Record<string, string>),
  };

  if (isDevelopment && csrfToken) {
    console.log('Using CSRF token:', csrfToken.substring(0, 10) + '...');
    console.log('Token length:', csrfToken.length);
    console.log('Headers being sent:', headers);
  }

  try {
    if (isDevelopment) {
      console.log(`Making API request to ${endpoint}`);
    }
    
    const response = await fetch(url.toString(), {
      ...requestConfig,
      headers,
      credentials: 'include',
    });

    if (isDevelopment) {
      console.log(`API response for ${endpoint}: ${response.status} ${response.statusText}`);
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
};

export default api;