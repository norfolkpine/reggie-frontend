// The key used to store the JWT token in localStorage.
export const TOKEN_KEY = "opie.auth.token";

// The key used to store the refresh token in localStorage.
export const REFRESH_TOKEN_KEY = "opie.auth.refresh.token";

// The key used to store user information in localStorage.
export const USER_KEY = "opie.auth.user";

// The name of the HttpOnly session cookie set by the backend.
// This is used by the middleware to verify authentication.
export const SESSION_COOKIE_KEY = "bh_opie_sessionid";