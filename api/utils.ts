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
 */
export function getCSRFToken(): string | null {
  if (typeof document !== 'undefined') {
    console.log('document.cookie', document.cookie);
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      console.log('name', name);
      console.log('value', value);
      if (name === 'csrftoken') {
        return value;
      }
    }
  }
  return null;
}
