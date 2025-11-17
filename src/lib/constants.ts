// The key used to store user information in localStorage.
// Note: This is for client-side state only - actual authentication is handled by session cookies.
export const USER_KEY = "opie.auth.user";

// The name of the HttpOnly session cookie set by the backend.
// This is used by the middleware to verify authentication and is the primary auth mechanism.
export const SESSION_COOKIE_KEY = "bh_opie_sessionid";

// Legacy constants - kept for backward compatibility but not used in cookie-based auth
// @deprecated These are misleadingly named - we use session cookies, not JWT tokens
export const TOKEN_KEY = "opie.auth.token";
export const REFRESH_TOKEN_KEY = "opie.auth.refresh.token";