export const backendUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const baseApiUrl = (apiVersion: string = '1.0') =>
  `${backendUrl()}/api/v${apiVersion}/`;
