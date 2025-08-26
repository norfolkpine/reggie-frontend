export const errorCauses = async (response: Response, data?: unknown) => {
  const errorsBody = (await response.json()) as Record<
    string,
    string | string[]
  > | null;

  const causes = errorsBody
    ? Object.entries(errorsBody)
        .map(([, value]) => value)
        .flat()
    : undefined;

  return {
    status: response.status,
    cause: causes,
    data,
  };
};

/**
 * Retrieves the CSRF token from the document's cookies.
 * Django typically sets this as 'csrftoken' cookie.
 */
export function getCSRFToken(): string | null {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    return null;
  }
  
  // Debug: Log all cookies to see what's available
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 All cookies:', document.cookie);
  }
  
  // Try the standard Django CSRF cookie name first
  const csrfCookie = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith('csrftoken='));
  
  if (csrfCookie) {
    const token = csrfCookie.split('=')[1];
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Found csrftoken cookie:', token.substring(0, 10) + '...');
    }
    return token;
  }
  
  // Try alternative cookie names that Django might use
  const alternativeNames = ['csrfmiddlewaretoken'];
  for (const name of alternativeNames) {
    const altCookie = document.cookie
      .split(';')
      .find((cookie) => cookie.trim().startsWith(`${name}=`));
    if (altCookie) {
      const token = altCookie.split('=')[1];
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Found ${name} cookie:`, token.substring(0, 10) + '...');
      }
      return token;
    }
  }
  
  // Debug: Log what we were looking for
  if (process.env.NODE_ENV === 'development') {
    console.log('❌ No CSRF token found. Looked for:', ['csrftoken', ...alternativeNames]);
    console.log('🔍 Cookie names found:', document.cookie.split(';').map(c => c.trim().split('=')[0]));
  }
  
  // No CSRF token found
  return null;
}
