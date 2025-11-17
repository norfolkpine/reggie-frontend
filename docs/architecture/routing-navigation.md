# Routing and Navigation

This document describes the routing and navigation architecture of the reggie-frontend Next.js application.

## Overview

The application uses Next.js 15 App Router for routing, with route groups for organizing authentication and dashboard routes. Navigation is handled through Next.js's built-in navigation hooks and a centralized navigation configuration.

## Route Structure

### Route Groups

The application uses Next.js route groups to organize routes:

```
src/app/
├── (auth)/              # Authentication routes (no layout)
│   ├── sign-in/
│   ├── sign-up/
│   ├── forgot-password/
│   └── account/
├── (dashboard)/         # Dashboard routes (with layout)
│   ├── layout.tsx       # Dashboard layout wrapper
│   ├── page.tsx         # Dashboard home
│   ├── chat/
│   ├── documents/
│   ├── vault/
│   ├── workflow/
│   ├── library/
│   ├── knowledge-base/
│   ├── explore-agents/
│   ├── admin/
│   ├── settings/
│   └── pricing/
└── api/                 # API route handlers
    ├── chat/
    └── sentry-example-api/
```

### Route Configuration

Routes are centrally defined in `src/lib/navigation.ts`:

```typescript
export const routes = {
  chat: {
    name: "Assistant",
    path: "/chat",
    icon: MessageSquare,
    description: "Start a new chat session"
  },
  documents: {
    name: "Documents",
    path: "/documents",
    icon: FileText,
    description: "Create and manage documents"
  },
  // ... more routes
}
```

**Benefits:**
- Single source of truth for route definitions
- Type-safe route keys
- Consistent navigation across the app
- Easy to update routes in one place

## Navigation Hooks

### `useNavigation()`

A custom hook that provides navigation utilities:

```typescript
import { useNavigation } from "@/hooks/use-navigation"

function MyComponent() {
  const { navigate, isActive, currentPath } = useNavigation()
  
  // Navigate to a route
  navigate("chat")
  
  // Check if route is active
  if (isActive("documents")) {
    // ...
  }
}
```

**Features:**
- Type-safe route navigation using route keys
- Active route detection
- Current pathname access

## Middleware

The application uses Next.js middleware for route protection and authentication checks.

**Location:** `middleware.ts`

**Key Features:**

1. **Session Validation**
   - Checks for session cookie on protected routes
   - Redirects to `/sign-in` if no session exists

2. **Public Routes**
   - Allows unauthenticated access to:
     - `/sign-in`
     - `/sign-up`
     - `/forgot-password`
     - `/otp`
     - Development-only routes

3. **Auto-redirect**
   - Redirects authenticated users away from public routes to dashboard
   - Prevents authenticated users from accessing login pages

**Example:**

```typescript
// Public routes that don't require authentication
const publicRoutes = [
  "/sign-in", 
  "/sign-up", 
  "/forgot-password", 
  "/otp"
];

// If no session cookie and not a public route, redirect to sign-in
if (!sessionCookie && !isPublicRoute) {
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
```

## Route Protection

### AuthGuard Component

The `AuthGuard` component provides client-side route protection:

**Location:** `src/components/auth-guard.tsx`

**Usage:**

```typescript
<AuthGuard allowedRoutes={allowedRoutes}>
  {children}
</AuthGuard>
```

**Features:**
- Validates authentication status
- Redirects unauthenticated users
- Allows specific routes to bypass authentication

### Layout-Level Protection

Routes are protected at the layout level in `src/app/layout.tsx`:

```typescript
<AuthProvider allowedRoutes={allowedRoutes}>
  <AuthGuard allowedRoutes={allowedRoutes}>
    {children}
  </AuthGuard>
</AuthProvider>
```

## Dynamic Routes

The application supports dynamic routes for:

- **Chat Sessions:** `/chat/[sessionId]`
- **Documents:** `/documents/[documentId]`
- **Vault Projects:** `/vault/[projectId]`

### Page Title Generation

The `getPageTitle()` function in `src/lib/navigation.ts` generates page titles based on pathname:

```typescript
export function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard"
  if (pathname.startsWith("/chat/")) return "Chat Session"
  if (pathname.startsWith("/documents/")) return "Documents"
  // ... more cases
}
```

## Navigation Patterns

### Programmatic Navigation

Use Next.js `useRouter` hook:

```typescript
import { useRouter } from "next/navigation"

function MyComponent() {
  const router = useRouter()
  
  const handleClick = () => {
    router.push("/documents")
  }
}
```

### Type-Safe Navigation

Use the `useNavigation` hook for type-safe navigation:

```typescript
import { useNavigation } from "@/hooks/use-navigation"

function MyComponent() {
  const { navigate } = useNavigation()
  
  // Type-safe - only accepts valid route keys
  navigate("documents")  // ✅ Valid
  navigate("invalid")    // ❌ TypeScript error
}
```

### Link Components

Use Next.js `Link` component for client-side navigation:

```typescript
import Link from "next/link"

<Link href="/documents">Documents</Link>
```

## Route Groups Benefits

### (auth) Group
- No shared layout
- Minimal UI for authentication flows
- Separate from main application

### (dashboard) Group
- Shared dashboard layout
- Consistent navigation and sidebar
- Protected routes requiring authentication

## Best Practices

1. **Use Route Keys**: Always use route keys from `routes` object instead of hardcoding paths
2. **Type Safety**: Leverage TypeScript route keys for compile-time safety
3. **Middleware First**: Let middleware handle authentication checks before component rendering
4. **Consistent Navigation**: Use `useNavigation` hook for consistent navigation behavior
5. **Dynamic Routes**: Use bracket notation `[param]` for dynamic route segments

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [Authentication](./authentication.md)
- [API Layer](./api-layer.md)

