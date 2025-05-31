import { TOKEN_KEY } from '@/contexts/auth-context';
import { baseApiUrl } from './config';
import { getCSRFToken } from './utils';

interface FetchAPIInit extends RequestInit {
  withoutContentType?: boolean;
}

export const fetchAPI = async (
  input: string,
  init?: FetchAPIInit,
  apiVersion = '1.0',
) => {
  const apiUrl = `${baseApiUrl(apiVersion)}${input}`;
  const csrfToken = getCSRFToken();
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...init?.headers,
    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  if (init?.withoutContentType) {
    delete headers?.['Content-Type' as keyof typeof headers];
  }

  const response = await fetch(apiUrl, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    let errorMessage = response.statusText;
    try {
      errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
        // Use the first value from the error data if detail is not present
        const firstKey = Object.keys(errorData)[0];
        errorMessage = String(errorData[firstKey]);
      }
    } catch (e) {
      // Parsing JSON failed, use statusText as already set
      console.error('Failed to parse error response JSON:', e);
    }

    const error = new Error(
      `Request failed with status ${response.status}: ${errorMessage}`,
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response;
};
