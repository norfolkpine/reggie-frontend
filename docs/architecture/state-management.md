# State Management

This document describes the state management architecture of the reggie-frontend application, covering Zustand stores, React Query, and React Context.

## Overview

The application uses a multi-layered state management approach:

1. **Zustand** - Global client state and feature-specific stores
2. **React Query (TanStack Query)** - Server state and data fetching
3. **React Context** - Cross-cutting concerns and provider patterns

## Zustand Stores

Zustand is used for client-side state management that doesn't require server synchronization.

### Global Stores

Located in `src/stores/`:

#### `useResponsiveStore`

Manages responsive breakpoints and screen size detection.

**Location:** `src/stores/useResponsiveStore.tsx`

**Features:**
- Screen size detection (small-mobile, mobile, tablet, desktop)
- Responsive flags (`isMobile`, `isTablet`, `isDesktop`)
- Window resize listener with debouncing
- Automatic initialization

**Usage:**

```typescript
import { useResponsiveStore } from "@/stores"

function MyComponent() {
  const { isMobile, isDesktop, screenSize } = useResponsiveStore()
  
  if (isMobile) {
    return <MobileView />
  }
  
  return <DesktopView />
}
```

#### `useBroadcastStore`

Manages collaborative editing and real-time synchronization using Yjs and Hocuspocus.

**Location:** `src/stores/useBroadcastStore.tsx`

**Features:**
- Hocuspocus provider management
- Task broadcasting for collaborative features
- Yjs document synchronization

**Usage:**

```typescript
import { useBroadcastStore } from "@/stores"

function CollaborativeEditor() {
  const { provider, setBroadcastProvider } = useBroadcastStore()
  
  // Initialize provider for collaboration
  useEffect(() => {
    const newProvider = new HocuspocusProvider({...})
    setBroadcastProvider(newProvider)
  }, [])
}
```

### Feature-Specific Stores

Each feature can have its own stores in `src/features/<feature>/stores/`:

**Example Structure:**

```
src/features/docs/
├── stores/
│   ├── useDocStore.tsx        # Document state
│   ├── useEditorStore.tsx     # Editor state
│   └── useProviderStore.tsx   # Collaboration provider
```

**Pattern:**

```typescript
import { create } from 'zustand'

interface DocStore {
  currentDoc: Doc | undefined
  setCurrentDoc: (doc: Doc | undefined) => void
}

export const useDocStore = create<DocStore>((set) => ({
  currentDoc: undefined,
  setCurrentDoc: (doc) => set({ currentDoc: doc }),
}))
```

## React Query (TanStack Query)

React Query handles all server state, caching, and data synchronization.

### Configuration

**Location:** `src/config/AppProvider.tsx`

**Default Options:**

```typescript
const defaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 3,  // 3 minutes
    retry: 1,
  },
}
```

**Key Settings:**
- **staleTime**: 3 minutes - data is considered fresh for 3 minutes
- **retry**: 1 - retry failed requests once
- Can be overridden per query

### Query Client Setup

The QueryClient is provided at the app level:

```typescript
<QueryClientProvider client={queryClient}>
  <AppProviderContent>
    {children}
  </AppProviderContent>
</QueryClientProvider>
```

### Query Client Context

A custom context provides access to the QueryClient instance:

**Location:** `src/contexts/query-client-context.tsx`

**Usage:**

```typescript
import { useQueryClientContext } from "@/contexts/query-client-context"

function MyComponent() {
  const { queryClient } = useQueryClientContext()
  
  // Access query client for manual cache operations
  queryClient.invalidateQueries(['documents'])
}
```

### Using React Query

**Basic Query:**

```typescript
import { useQuery } from "@tanstack/react-query"
import { getDocuments } from "@/api/documents"

function DocumentsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  })
  
  if (isLoading) return <Loading />
  if (error) return <Error />
  
  return <DocumentsList items={data} />
}
```

**Mutations:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createDocument } from "@/api/documents"

function CreateDocument() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['documents'])
    },
  })
  
  return (
    <button onClick={() => mutation.mutate({ title: "New Doc" })}>
      Create
    </button>
  )
}
```

### Query Key Patterns

Use consistent query key patterns:

```typescript
// List queries
['documents']
['agents']
['workflows']

// Single item queries
['documents', documentId]
['agents', agentId]

// Filtered queries
['documents', { status: 'active' }]
['agents', { type: 'assistant' }]
```

## React Context

React Context is used for cross-cutting concerns and provider patterns.

### Available Contexts

Located in `src/contexts/`:

#### `AuthContext`

Manages authentication state and user session.

**Location:** `src/contexts/auth-context.tsx`

**Features:**
- User authentication status
- Login/logout functions
- Token expiration handling
- User data management

**Usage:**

```typescript
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginPrompt />
  }
  
  return <UserDashboard user={user} />
}
```

#### `ModalContext`

Manages modal state and operations.

**Location:** `src/contexts/modal-context.tsx`

#### `SearchContext`

Manages global search state.

**Location:** `src/contexts/search-context.tsx`

#### `SidebarContext`

Manages sidebar visibility and state.

**Location:** `src/contexts/sidebar-context.tsx`

#### `QueryClientContext`

Provides access to React Query client instance.

**Location:** `src/contexts/query-client-context.tsx`

#### `AiPanelContext`

Manages AI panel state and interactions.

**Location:** `src/contexts/ai-panel-context.tsx`

#### `ChatSessionContext`

Manages chat session state.

**Location:** `src/features/chats/ChatSessionContext.tsx`

#### `GlobalPanelContext`

Manages global panel state.

**Location:** `src/contexts/global-panel-context/`

## State Management Patterns

### When to Use What

**Zustand:**
- UI state (modals, sidebars, panels)
- Client-side only data
- Feature-specific state
- Real-time collaboration state

**React Query:**
- Server data fetching
- API response caching
- Data synchronization
- Background refetching

**React Context:**
- Cross-cutting concerns
- Provider patterns
- Authentication state
- Theme configuration

### State Organization

```
src/
├── stores/              # Global Zustand stores
│   ├── useResponsiveStore.tsx
│   └── useBroadcastStore.tsx
├── contexts/            # React Context providers
│   ├── auth-context.tsx
│   ├── modal-context.tsx
│   └── ...
└── features/
    └── <feature>/
        └── stores/      # Feature-specific Zustand stores
            └── useFeatureStore.tsx
```

## Best Practices

1. **Server State → React Query**: Always use React Query for data from APIs
2. **Client State → Zustand**: Use Zustand for UI state and client-only data
3. **Cross-Cutting → Context**: Use Context for provider patterns and global concerns
4. **Feature Isolation**: Keep feature-specific state within feature directories
5. **Query Keys**: Use consistent, hierarchical query key patterns
6. **Cache Invalidation**: Invalidate related queries after mutations
7. **Type Safety**: Define TypeScript interfaces for all store state

## Cache Management

### Clearing Cache on Logout

The application clears React Query cache on logout:

```typescript
// In auth-context.tsx
const logout = async () => {
  await authApi.logout()
  
  // Clear React Query cache
  if (queryClient) {
    queryClient.clear()
  }
  
  // Clear localStorage
  await clearAllStorage()
}
```

### Manual Cache Operations

```typescript
import { useQueryClient } from "@tanstack/react-query"

const queryClient = useQueryClient()

// Invalidate specific query
queryClient.invalidateQueries(['documents'])

// Remove query from cache
queryClient.removeQueries(['documents'])

// Set query data manually
queryClient.setQueryData(['documents', id], newData)
```

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [API Layer](./api-layer.md)
- [Authentication](./authentication.md)

