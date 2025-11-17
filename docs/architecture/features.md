# Feature Architecture

This document describes the feature-based architecture pattern used in the reggie-frontend application.

## Overview

Features are self-contained modules organized by domain/functionality. Each feature contains its own components, API calls, hooks, stores, and types, promoting code organization, reusability, and maintainability.

## Feature Structure

### Standard Feature Organization

Each feature follows a consistent structure:

```
src/features/<feature-name>/
├── components/          # Feature-specific UI components
│   ├── ComponentName.tsx
│   └── index.ts         # Component exports
├── api/                 # Feature-specific API calls
│   ├── useFeatureData.tsx
│   └── index.ts
├── hooks/              # Feature-specific React hooks
│   ├── useFeatureHook.tsx
│   └── index.ts
├── stores/             # Feature-specific Zustand stores
│   ├── useFeatureStore.tsx
│   └── index.ts
├── types.ts           # Feature-specific TypeScript types
├── utils.ts           # Feature-specific utility functions
└── index.ts           # Feature public API
```

## Available Features

### 1. Authentication (`auth/`)

Handles user authentication flows.

**Components:**
- Login forms
- Sign-up forms
- Password reset flows

**API:**
- Login/logout functions
- User session management

**Location:** `src/features/auth/`

### 2. Documents (`docs/`)

Comprehensive document management system with collaborative editing.

**Sub-features:**
- **doc-editor/** - BlockNote-based rich text editor
- **doc-management/** - Document CRUD operations
- **doc-share/** - Document sharing and permissions
- **doc-versioning/** - Document version control
- **doc-export/** - PDF/DOCX export functionality
- **doc-search/** - Document search and discovery
- **doc-header/** - Document header and toolbar
- **doc-table-content/** - Table of contents
- **docs-grid/** - Document grid view

**Key Features:**
- Real-time collaborative editing (Yjs + Hocuspocus)
- Version history
- Export to PDF/DOCX
- Sharing and access control
- AI-powered features (translation, transformation)

**Location:** `src/features/docs/`

### 3. Chats (`chats/`)

AI chat interface with markdown rendering and rich interactions.

**Components:**
- Chat interface
- Message rendering with markdown
- Typing indicators
- Message actions
- Feedback forms
- Editor panel

**Features:**
- Enhanced markdown rendering
- Syntax highlighting
- Code block copying
- Table editing
- File attachments

**Location:** `src/features/chats/`

### 4. Agents (`agent/`)

AI agent management and exploration.

**Components:**
- Agent cards
- Agent templates
- Agent creation forms

**Features:**
- Agent browsing
- Template library
- Agent configuration

**Location:** `src/features/agent/`

### 5. Workflows (`workflows/`)

Visual workflow builder and automation.

**Components:**
- Workflow editor (React Flow)
- Node configuration
- Workflow templates

**Features:**
- Drag-and-drop workflow builder
- Node-based automation
- Template library

**Location:** `src/features/workflows/`

### 6. Vault (`vault/`)

Project and vault management.

**Components:**
- Project cards
- Vault browser
- Project settings

**Features:**
- Project organization
- Vault-based chat
- File management

**Location:** `src/features/vault/`

### 7. Knowledge Base (`knowledge-base/`)

Knowledge base management and PDF processing.

**Components:**
- Knowledge base manager
- File manager
- PDF URL management

**Features:**
- PDF processing
- Knowledge base organization
- File upload and management

**Location:** `src/features/knowledge-base/`

### 8. Library (`library/`)

Document library and resource management.

**Components:**
- Library view
- Document collections
- Resource browser

**Features:**
- Public/private documents
- Collections
- Resource organization

**Location:** `src/features/library/`

### 9. Admin (`admin/`)

Administrative dashboard and system management.

**Components:**
- Admin dashboard
- System statistics
- User management

**Location:** `src/features/admin/`

### 10. System (`system/`)

System-level features and utilities.

**Components:**
- Token logs
- User token summary

**Location:** `src/features/system/`

### 11. Language (`language/`)

Internationalization and language management.

**Location:** `src/features/language/`

### 12. Shared (`shared/`)

Shared feature components and utilities.

**Location:** `src/features/shared/`

## Feature Patterns

### Component Organization

**Feature Components:**
- Specific to the feature domain
- Not reused across features
- Located in `features/<feature>/components/`

**Shared Components:**
- Used across multiple features
- Located in `src/components/`

**Example:**

```typescript
// Feature-specific component
// src/features/docs/components/DocEditor.tsx
export function DocEditor() {
  // Document editor specific to docs feature
}

// Shared component
// src/components/ui/button.tsx
export function Button() {
  // Reusable button used across features
}
```

### API Organization

Feature-specific API calls use React Query hooks:

```typescript
// src/features/docs/api/useDocs.tsx
import { useQuery } from "@tanstack/react-query"
import { getDocuments } from "@/api/documents"

export function useDocs() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  })
}
```

### State Management

Feature-specific state uses Zustand stores:

```typescript
// src/features/docs/stores/useDocStore.tsx
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

### Type Definitions

Feature-specific types are defined in `types.ts`:

```typescript
// src/features/docs/types.tsx
export interface Doc {
  id: string
  title: string
  content: string
  // ...
}
```

## Feature Communication

### Cross-Feature Communication

Features communicate through:

1. **Shared API Layer** - `src/api/` contains cross-feature API functions
2. **Shared Contexts** - Global contexts like `AuthContext`
3. **Shared Stores** - Global stores like `useResponsiveStore`
4. **Shared Components** - Components in `src/components/`

### Example: Document Sharing

```typescript
// Feature: docs/doc-share
import { useAuth } from "@/contexts/auth-context"  // Shared context
import { Button } from "@/components/ui/button"    // Shared component
import { getUsers } from "@/api/users"             // Shared API
```

## Feature Development Guidelines

### Creating a New Feature

1. **Create Feature Directory:**
   ```
   src/features/my-feature/
   ```

2. **Set Up Structure:**
   ```
   src/features/my-feature/
   ├── components/
   │   └── index.ts
   ├── api/
   │   └── index.ts
   ├── hooks/
   │   └── index.ts
   ├── stores/
   │   └── index.ts
   ├── types.ts
   ├── utils.ts
   └── index.ts
   ```

3. **Export Public API:**
   ```typescript
   // src/features/my-feature/index.ts
   export { MyFeatureComponent } from './components'
   export { useMyFeature } from './hooks'
   export type { MyFeatureType } from './types'
   ```

4. **Use in Routes:**
   ```typescript
   // src/app/(dashboard)/my-feature/page.tsx
   import { MyFeatureComponent } from "@/features/my-feature"
   ```

### Feature Isolation

**Keep Features Self-Contained:**
- Feature-specific code should stay within the feature directory
- Only extract to shared when used by 2+ features
- Avoid circular dependencies between features

**Example:**

```typescript
// ✅ Good - Feature-specific hook in feature
// src/features/docs/hooks/useSaveDoc.tsx

// ✅ Good - Shared hook used by multiple features
// src/hooks/use-debounce.ts

// ❌ Bad - Feature hook in shared
// src/hooks/use-save-doc.ts (only used by docs feature)
```

## Complex Features

### Documents Feature

The documents feature is the most complex, with multiple sub-features:

**Architecture:**
- Modular sub-features for different concerns
- Shared types and utilities
- Collaborative editing integration
- Export functionality

**Key Patterns:**
- Editor stores for state management
- Provider stores for collaboration
- API hooks for data fetching
- Component composition

### Chats Feature

The chats feature demonstrates:

- Markdown rendering with custom components
- Real-time message updates
- File handling
- Feedback collection

## Best Practices

1. **Feature Isolation**: Keep features self-contained
2. **Shared Extraction**: Extract to shared when reused by 2+ features
3. **Consistent Structure**: Follow the standard feature structure
4. **Type Safety**: Define types in `types.ts` for each feature
5. **Public API**: Export only what's needed via `index.ts`
6. **Documentation**: Add README files for complex features
7. **Testing**: Keep feature tests within feature directories

## Feature Dependencies

### Common Dependencies

Most features depend on:

- **React Query** - Data fetching
- **Zustand** - State management
- **Shadcn UI** - UI components
- **Next.js** - Routing and SSR
- **TypeScript** - Type safety

### Feature-Specific Dependencies

- **Documents**: BlockNote, Yjs, Hocuspocus
- **Workflows**: React Flow (@xyflow/react)
- **Chats**: Markdown rendering, syntax highlighting

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [State Management](./state-management.md)
- [API Layer](./api-layer.md)
- [Component Guidelines](../components/README.md)

