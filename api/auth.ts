import { Login, User, Register, JWT, PatchedUser, LoginResponse } from '@/types/api';
import { getCSRFToken } from './utils';

export const Client = Object.freeze({
  APP: 'app',
  BROWSER: 'browser'
})

export const settings = {
  client: Client.BROWSER,
  baseUrl: `/_allauth/${Client.BROWSER}/v1`,
  withCredentials: true
}

const ACCEPT_JSON = {
  accept: 'application/json'
}

// Enhanced request function with proper CSRF handling
async function request(method: string, path: string, data?: any, headers?: Record<string, string>) {
  // First ensure we have a CSRF token for non-GET requests
  if (method !== 'GET') {
    try {
      // Try to establish session first
      await fetch('/_allauth/browser/v1/config', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
    } catch (e) {
      console.log('Config endpoint not available, continuing...');
    }
  }

  const options: RequestInit = {
    method,
    headers: {
      ...ACCEPT_JSON,
      'X-Requested-With': 'XMLHttpRequest', // Important for Django to return JSON
      ...headers
    },
    credentials: 'include'
  }

  // Don't pass along authentication related headers to the config endpoint.
  if (path !== '/config') {
    if (settings.client === Client.BROWSER) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        options.headers = {
          ...options.headers,
          'X-CSRFToken': csrfToken
        };
      } else if (method !== 'GET') {
        console.warn('No CSRF token available for', method, 'request to', path);
      }
    }
  }

  if (typeof data !== 'undefined') {
    options.body = JSON.stringify(data)
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    }
  }

  const resp = await fetch(settings.baseUrl + path, options)
  
  // Check if response is JSON before parsing
  const contentType = resp.headers.get('content-type');
  let responseData;
  
  if (contentType && contentType.includes('application/json')) {
    responseData = await resp.json();
  } else {
    // If not JSON, get text and create error
    const textResponse = await resp.text();
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: Server returned HTML instead of JSON. This usually means the endpoint is not configured correctly.`);
    }
    responseData = { message: textResponse };
  }
  
  if (!resp.ok) {
    // Handle Django Allauth error format
    if (responseData.errors) {
      throw { errors: responseData.errors };
    } else if (responseData.detail) {
      throw new Error(responseData.detail);
    } else if (responseData.message) {
      throw new Error(responseData.message);
    } else {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
  }
  
  return responseData;
}

export async function login(credentials: Login): Promise<LoginResponse> {
  const response = await request('POST', '/auth/login', credentials);
  return response as LoginResponse;
}

export async function register(credentials: Register): Promise<User> {
  const response = await request('POST', '/auth/signup', credentials);
  return response as User;
}

export async function logout(): Promise<void> {
  // Django Allauth headless doesn't have a logout endpoint
  // Instead, we clear the session client-side
  if (typeof document !== 'undefined') {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  }
}

export async function verifySession(): Promise<LoginResponse> {
  const response = await request('GET', '/auth/session');
  return response as LoginResponse;
}

export async function getCurrentUser(): Promise<LoginResponse> {
  // Use session endpoint instead of user endpoint for Django Allauth headless
  const response = await request('GET', '/auth/session');
  return response as LoginResponse;
}

export async function updateUser(userData: PatchedUser): Promise<User> {
  // Django Allauth headless doesn't have user update endpoint
  // This would need to be implemented via a custom API endpoint
  throw new Error('User update not supported in Django Allauth headless mode');
}

export async function forgotPassword(email: string): Promise<void> {
  await request('POST', '/auth/password/request', { email });
}