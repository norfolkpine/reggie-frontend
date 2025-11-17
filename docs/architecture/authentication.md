# Authentication and Authorization

This document describes the authentication and authorization architecture of the reggie-frontend application.

## Overview

The application uses Django Allauth for backend authentication with session-based authentication. The frontend manages authentication state through React Context and integrates with Next.js middleware for route protection.

## Authentication Flow

### Login Flow

1. User submits credentials via login form
2. Frontend calls `/api/auth/login/` endpoint
3. Backend validates credentials and sets session cookie
4. Frontend stores user data in localStorage
5. Auth context updates authentication state
6. User is redirected to dashboard

### Logout Flow

1. User triggers logout
2. Frontend calls `/api/auth/logout/` endpoint
3. Backend clears session cookie
4. Frontend clears all storage (localStorage, sessionStorage)
5. React Query cache is cleared
6. Auth context resets to logged out state
7. User is redirected to sign-in page

### Token Expiration Handling

1. API request receives 401 Unauthorized response
2. API client detects authentication error
3. Auth context's `handleTokenExpiration()` is called
4. User data is cleared from state
5. User is redirected to sign-in (if not already on public route)

## Auth Context

### Implementation

**Location:** `src/contexts/auth-context.tsx`

### Interface

```typescript
interface AuthContext {
  isAuthenticated: boolean
  login: (credentials: Login) => Promise<void>
  logout: () => Promise<void>
  user: User | null
  loading: boolean
  handleTokenExpiration: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
  status: 'LOGGED_IN' | 'LOGGED_OUT'
}
```

### Usage

```typescript
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout 
  } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }
  
  return <Dashboard user={user} onLogout={logout} />
}
```

### Provider Setup

The AuthProvider wraps the application in `src/app/layout.tsx`:

```typescript
<AuthProvider allowedRoutes={allowedRoutes}>
  <AuthGuard allowedRoutes={allowedRoutes}>
    {children}
  </AuthGuard>
</AuthProvider>
```

## User Storage

### localStorage

User data is stored in localStorage with key `opie.auth.user`:

```typescript
const USER_KEY = 'opie.auth.user'

// Store user
localStorage.setItem(USER_KEY, JSON.stringify(user))

// Retrieve user
const userStr = localStorage.getItem(USER_KEY)
const user = userStr ? JSON.parse(userStr) : null
```

### Session Cookie

The backend sets a session cookie (`sessionid`) that is automatically included in requests via `credentials: 'include'`.

## Route Protection

### Middleware Protection

**Location:** `middleware.ts`

Next.js middleware protects routes at the edge:

```typescript
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_KEY)?.value
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = [
    "/sign-in", 
    "/sign-up", 
    "/forgot-password"
  ]

  // Redirect unauthenticated users
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  // Redirect authenticated users away from public routes
  if (sessionCookie && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }
}
```

### Component-Level Protection

**Location:** `src/components/auth-guard.tsx`

The AuthGuard component provides client-side protection:

```typescript
<AuthGuard allowedRoutes={allowedRoutes}>
  {children}
</AuthGuard>
```

**Features:**
- Checks authentication status
- Redirects unauthenticated users
- Allows bypass for specific routes

## API Integration

### Auth API Functions

**Location:** `src/api/auth.ts`

```typescript
import * as authApi from "@/api/auth"

// Login
await authApi.login({ email, password })

// Logout
await authApi.logout()

// Get current user
const user = await authApi.getCurrentUser()

// Update user
await authApi.updateUser(userData)
```

### CSRF Token Management

The API client automatically manages CSRF tokens for authenticated requests:

```typescript
// CSRF token is automatically included in requests
await api.post("/api/documents/", data)
```

## Error Handling

### 401 Unauthorized

**Behavior:**
- Session expired or invalid
- Triggers full logout
- Clears all user data and cache
- Redirects to sign-in

**Implementation:**

```typescript
if (response.status === 401) {
  const context = authManager.getAuthContext()
  if (context) {
    context.logout()  // Full logout
  }
}
```

### 403 Forbidden

**Behavior:**
- CSRF token issue or permission denied
- Clears user state (but not full logout)
- Redirects to sign-in

**Implementation:**

```typescript
if (response.status === 403) {
  const context = authManager.getAuthContext()
  if (context) {
    context.handleTokenExpiration()  // Partial clear
  }
}
```

## Allowed Routes

### Configuration

Routes that don't require authentication are defined in the root layout:

```typescript
const allowedRoutes = [
  "/sign-in", 
  "/sign-up",
  "/forgot-password",
  "/test-token-expiration",
  "/test-csrf-fix",
  ...(process.env.NODE_ENV === 'development' ? ["/sentry-example-page"] : [])
]
```

### Usage

These routes are passed to:
- `AuthProvider` - For context configuration
- `AuthGuard` - For component-level protection
- Middleware - For edge protection

## User Data Management

### User Interface

```typescript
interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  // ... more fields
}
```

### Updating User Data

```typescript
const { updateUser } = useAuth()

await updateUser({
  firstName: "John",
  lastName: "Doe"
})
```

### User Persistence

User data is:
- Stored in localStorage on login
- Retrieved from localStorage on app load
- Cleared on logout or token expiration
- Synced with backend on updates

## Session Management

### Session Cookie

- Set by Django backend on successful login
- Automatically included in requests via `credentials: 'include'`
- Cleared by backend on logout
- Validated by middleware on each request

### Session Validation

The middleware checks for session cookie:

```typescript
const sessionCookie = request.cookies.get(SESSION_COOKIE_KEY)?.value

if (!sessionCookie && !isPublicRoute) {
  // Redirect to login
}
```

## Cache Management

### Clearing Cache on Logout

On logout, the application clears:

1. **localStorage** - All stored data
2. **sessionStorage** - Session data
3. **React Query Cache** - All cached API responses
4. **Auth State** - User data in context

**Implementation:**

```typescript
const logout = async () => {
  await authApi.logout()
  
  // Clear all storage
  await clearAllStorage(queryClient)
  
  // Clear React Query cache
  if (queryClient) {
    queryClient.clear()
  }
  
  // Clear user state
  setUser(null)
  
  // Redirect
  router.push('/sign-in')
}
```

## Security Considerations

### CSRF Protection

- CSRF tokens are automatically managed by the API client
- Tokens are retrieved from cookies or Django Allauth endpoint
- Tokens are included in all non-GET requests

### Session Security

- Sessions are managed server-side by Django
- Session cookies are httpOnly (set by backend)
- Session validation happens at the edge (middleware)

### Storage Security

- User data in localStorage is not sensitive (no tokens)
- Sensitive data is stored in httpOnly cookies
- All storage is cleared on logout

## Best Practices

1. **Use Auth Context**: Always use `useAuth()` hook instead of accessing localStorage directly
2. **Handle Errors**: Always handle authentication errors in API calls
3. **Clear Cache**: Ensure cache is cleared on logout
4. **Route Protection**: Use middleware for edge protection, AuthGuard for client protection
5. **Token Expiration**: Handle token expiration gracefully
6. **Public Routes**: Define public routes in one place

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [API Layer](./api-layer.md)
- [Routing and Navigation](./routing-navigation.md)

