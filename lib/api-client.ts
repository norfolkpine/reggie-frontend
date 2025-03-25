import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/contexts/auth-context';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      const refreshTokenLocal = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshTokenLocal) {
        try {
          const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshTokenLocal }),
          });

          if (!refreshResponse.ok) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            window.location.href = '/sign-in';
            throw new Error('Refresh token failed');
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
          });

          return handleResponse(retryResponse);
        } catch (error) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/sign-in';
          throw error;
        }
      }
    }
    throw new Error(`HTTP error! status: ${response.status}`);
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
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...config.headers,
  };

  const response = await fetch(url.toString(), {
    ...requestConfig,
    headers,
  });

  return handleResponse(response);
}

export const api = {
  // Base HTTP methods
  get: (endpoint: string, config?: RequestConfig) => 
    apiClient(endpoint, { ...config, method: 'GET' }),
  
  post: (endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient(endpoint, { 
      ...config, 
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  put: (endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  patch: (endpoint: string, data?: any, config?: RequestConfig) =>
    apiClient(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  
  delete: (endpoint: string, config?: RequestConfig) =>
    apiClient(endpoint, { ...config, method: 'DELETE' }),

};

export default api;