# API Layer

This document describes the API client architecture, data fetching patterns, and error handling in the reggie-frontend application.

## Overview

The application uses a centralized API client built on the Fetch API, with automatic CSRF token management, error handling, and authentication integration.

## API Client

### Core Client

**Location:** `src/lib/api-client.ts`

The API client provides a type-safe interface for making HTTP requests to the Django backend.

### Base Configuration

```typescript
// Environment-based base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

// Smart hostname detection for development
function getSmartBaseUrl(): string {
  // Matches current hostname in development
  // Falls back to environment variable
}
```

### API Methods

The client exports a `api` object with standard HTTP methods:

```typescript
import api from "@/lib/api-client"

// GET request
const data = await api.get("/api/documents/")

// POST request
const result = await api.post("/api/documents/", {
  title: "New Document",
  content: "..."
})

// PUT request
await api.put("/api/documents/123/", updatedData)

// PATCH request
await api.patch("/api/documents/123/", partialData)

// DELETE request
await api.delete("/api/documents/123/")

// OPTIONS request
await api.options("/api/documents/")
```

### Request Configuration

All methods accept an optional config object:

```typescript
api.get("/api/documents/", {
  params: { status: "active", limit: 10 }
})
```

## CSRF Token Management

### Automatic CSRF Handling

The API client automatically manages CSRF tokens:

1. **Token Retrieval**: Gets CSRF token from cookies
2. **Token Refresh**: Fetches new token from Django Allauth endpoint if missing
3. **Header Injection**: Automatically includes `X-CSRFToken` header in requests

### CSRF Token Functions

```typescript
import { ensureCSRFToken, getCSRFToken } from "@/lib/api-client"

// Ensure CSRF token exists (for non-GET requests)
await ensureCSRFToken()

// Get current CSRF token
const token = getCSRFToken()
```

**Implementation:**

- Checks cookies first (most efficient)
- Falls back to Django Allauth config endpoint
- Logs debug information in development

## Authentication Integration

### Auth Context Integration

The API client integrates with the authentication context for error handling:

```typescript
import { setAuthContext } from "@/lib/api-client"

// Set auth context reference
setAuthContext({
  handleTokenExpiration: () => { /* ... */ },
  logout: async () => { /* ... */ }
})
```

### Error Handling

The client automatically handles authentication errors:

**401 Unauthorized:**
- Session expired
- Triggers logout
- Clears user data
- Redirects to sign-in

**403 Forbidden:**
- CSRF token issue or permission error
- Clears user state
- Redirects to sign-in (without full logout)

**Implementation:**

```typescript
async function handleResponse(response: Response) {
  if (response.status === 401) {
    // Session expired - logout
    context.logout()
  } else if (response.status === 403) {
    // CSRF or permission error
    context.handleTokenExpiration()
  }
  // ... error parsing
}
```

## API Endpoint Wrappers

### Organization

API endpoint wrappers are organized in `src/api/`:

```
src/api/
├── auth.ts                 # Authentication endpoints
├── documents.ts            # Document management
├── agents.ts              # AI agents
├── workflows.ts           # Workflows
├── vault.ts               # Vault operations
├── chat-sessions.ts       # Chat sessions
├── knowledge-bases.ts     # Knowledge bases
├── teams.ts               # Team management
├── integrations.ts        # Integrations
└── ...
```

### Pattern

Each API module exports functions that wrap the API client:

```typescript
// src/api/documents.ts
import api from "@/lib/api-client"

export interface Document {
  id: string
  title: string
  content: string
  // ...
}

export async function getDocuments(): Promise<Document[]> {
  return api.get("/api/documents/") as Promise<Document[]>
}

export async function getDocument(id: string): Promise<Document> {
  return api.get(`/api/documents/${id}/`) as Promise<Document>
}

export async function createDocument(data: Partial<Document>): Promise<Document> {
  return api.post("/api/documents/", data) as Promise<Document>
}

export async function updateDocument(
  id: string, 
  data: Partial<Document>
): Promise<Document> {
  return api.patch(`/api/documents/${id}/`, data) as Promise<Document>
}

export async function deleteDocument(id: string): Promise<void> {
  return api.delete(`/api/documents/${id}/`)
}
```

### Type Safety

API functions use TypeScript interfaces for type safety:

```typescript
import type { Document } from "@/api/documents"

const doc: Document = await getDocument("123")
```

## Error Handling

### Error Structure

API errors follow a consistent structure:

```typescript
interface APIError {
  status: number
  statusText: string
  message: string
  errors: Array<{
    message: string
    code: string
    param?: string
  }>
}
```

### Error Handling Utilities

**Location:** `src/lib/error-handler.ts`

```typescript
import { handleApiError } from "@/lib/error-handler"

try {
  await createDocument(data)
} catch (error) {
  handleApiError(error)
}
```

### APIError Class

**Location:** `src/api/APIError.ts`

Custom error class for API errors:

```typescript
import { APIError } from "@/api/APIError"

try {
  await api.get("/api/documents/")
} catch (error) {
  if (error instanceof APIError) {
    console.error(error.status, error.message)
  }
}
```

## React Query Integration

### Using API Functions with React Query

API functions are designed to work seamlessly with React Query:

```typescript
import { useQuery, useMutation } from "@tanstack/react-query"
import { getDocuments, createDocument } from "@/api/documents"

function DocumentsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  })
  
  const mutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
    },
  })
  
  // ...
}
```

## Request Deduplication

The API client includes request deduplication for authentication handlers:

```typescript
const pendingAuthHandlers = new Set<string>()

// Prevents multiple concurrent 401/403 handlers
if (!pendingAuthHandlers.has(handlerKey)) {
  pendingAuthHandlers.add(handlerKey)
  // Handle error
  pendingAuthHandlers.delete(handlerKey)
}
```

## Development Features

### Debug Logging

In development mode, the API client logs:

- API request URLs
- CSRF token status
- Response status codes
- Error details

```typescript
if (isDevelopment) {
  console.log(`Making API request to ${endpoint}`)
  console.log(`API response: ${response.status}`)
}
```

### Smart Hostname Detection

In development, the client automatically matches the frontend hostname:

```typescript
// If frontend is on localhost, backend uses localhost:8000
// If frontend is on 127.0.0.1, backend uses 127.0.0.1:8000
```

## Best Practices

1. **Use API Wrappers**: Always use functions from `src/api/` instead of calling `api` directly
2. **Type Safety**: Define TypeScript interfaces for all API responses
3. **Error Handling**: Always handle errors, especially in mutations
4. **React Query**: Use React Query for all data fetching
5. **CSRF Tokens**: Let the client handle CSRF tokens automatically
6. **Environment Variables**: Use `NEXT_PUBLIC_API_BASE_URL` for base URL configuration

## Environment Configuration

### Required Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Optional Variables

```env
NEXT_PUBLIC_NANGO_API_URL=...
NEXT_PUBLIC_NANGO_BASE_URL=...
```

## API Response Handling

### JSON Responses

The client automatically parses JSON responses:

```typescript
const data = await api.get("/api/documents/")
// data is already parsed JSON
```

### Non-JSON Responses

For non-JSON responses (e.g., 204 No Content):

```typescript
// DELETE requests return void for 204 responses
await api.delete("/api/documents/123/")
```

### Error Responses

Error responses are parsed and thrown:

```typescript
try {
  await api.post("/api/documents/", data)
} catch (error) {
  // error contains parsed error response
  console.error(error.message)
  console.error(error.errors)
}
```

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [State Management](./state-management.md)
- [Authentication](./authentication.md)

