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
export function getCSRFToken() {
  console.log("document.cookie", document.cookie);
  console.log("All cookies:", document.cookie.split(';').map(c => c.trim()));
  
  const csrfCookie = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith('csrftoken='));
  
  if (csrfCookie) {
    const token = csrfCookie.split('=')[1];
    console.log("CSRF token found:", token);
    return token;
  } else {
    console.log("No CSRF token found in cookies");
    // Try alternative cookie names that Django might use
    const alternativeNames = ['csrfmiddlewaretoken', 'csrftoken'];
    for (const name of alternativeNames) {
      const altCookie = document.cookie
        .split(';')
        .find((cookie) => cookie.trim().startsWith(`${name}=`));
      if (altCookie) {
        const token = altCookie.split('=')[1];
        console.log(`Alternative CSRF token found (${name}):`, token);
        return token;
      }
    }
    return null;
  }
}
