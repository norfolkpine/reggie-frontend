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
  
  // Try the standard Django CSRF cookie name first
  const csrfCookie = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith('csrftoken='));
  
  if (csrfCookie) {
    const token = csrfCookie.split('=')[1];
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
      return token;
    }
  }
  
  // No CSRF token found
  return null;
}
