# Frontend Structure

This document describes the folder structure and organization conventions for the reggie-frontend Next.js application.

## Overview

The frontend follows a **type-based structure** at the top level of `src/`, with feature-specific code organized under `src/features/`. This structure promotes code reusability, maintainability, and clear separation of concerns.

## Directory Structure

```
src/
├── app/                    # Next.js App Router routes and layouts
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API route handlers
│   ├── layout.tsx         # Root layout
│   └── global-error.tsx   # Global error boundary
│
├── components/            # Shared, reusable UI components
│   ├── ui/               # Shadcn UI component library
│   ├── layout/           # Layout components (header, main, etc.)
│   ├── sidebar/          # Sidebar components
│   ├── team/             # Team-related components
│   ├── pricing/          # Pricing components
│   └── ...               # Other shared components
│
├── features/              # Feature-based modules (domain logic)
│   ├── admin/            # Admin feature
│   ├── agent/            # Agent feature
│   ├── auth/             # Authentication feature
│   ├── chats/            # Chat feature
│   ├── docs/             # Document management feature
│   ├── knowledge-base/   # Knowledge base feature
│   ├── library/          # Library feature
│   ├── vault/            # Vault feature
│   ├── workflows/        # Workflow feature
│   └── ...               # Each feature contains:
│       ├── components/   # Feature-specific components
│       ├── api/          # Feature-specific API calls
│       ├── hooks/        # Feature-specific hooks
│       ├── stores/       # Feature-specific state stores
│       └── types.ts      # Feature-specific types
│
├── hooks/                 # Cross-cutting React hooks
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   └── ...               # Shared hooks not tied to a single feature
│
├── contexts/              # React context providers
│   ├── auth-context.tsx
│   ├── modal-context.tsx
│   ├── search-context.tsx
│   └── ...               # Global context providers
│
├── config/                # App-level configuration
│   ├── AppProvider.tsx
│   ├── ConfigProvider.tsx
│   └── hooks/            # Config-related hooks
│
├── lib/                   # General-purpose libraries and utilities
│   ├── api-client.ts     # API client setup
│   ├── navigation.ts     # Navigation helpers
│   ├── constants.ts      # App constants
│   ├── error-handler.ts  # Error handling utilities
│   └── utils/            # Utility functions
│
├── api/                   # Cross-feature API helper layer
│   ├── auth.ts
│   ├── documents.ts
│   ├── agents.ts
│   └── ...               # API endpoint wrappers
│
├── services/              # Third-party service integrations
│   ├── Crisp.tsx         # Crisp chat integration
│   └── index.ts
│
├── stores/                # Cross-feature state stores (Zustand)
│   ├── useBroadcastStore.tsx
│   └── useResponsiveStore.tsx
│
├── styles/                # Application-level CSS and design tokens
│   ├── styles/           # CSS files
│   │   └── globals.css   # Global styles
│   ├── tokens/           # Design tokens
│   └── ...               # Other style-related files
│
├── types/                 # Shared TypeScript types and interfaces
│   ├── api.ts
│   ├── message.ts
│   └── ...
│
├── i18n/                  # Internationalization
│   ├── initI18n.ts
│   └── translations.json
│
└── cunningham/            # Cunningham theming system
    ├── cunningham-tokens.ts
    └── useCunninghamTheme.tsx
```

## Key Principles

### 1. Type-Based Organization for Shared Code

Shared, reusable code is organized by **type** (components, hooks, contexts, etc.) rather than by feature. This makes it easy to find and reuse code across the application.

- **`src/components/`** - All shared UI components
- **`src/hooks/`** - All shared React hooks
- **`src/contexts/`** - All React context providers
- **`src/lib/`** - All utility libraries and helpers

### 2. Feature-Based Organization for Domain Logic

Feature-specific code is organized by **domain/feature** under `src/features/`. Each feature is self-contained with its own components, API calls, hooks, and stores.

- **`src/features/docs/`** - Document management feature
- **`src/features/vault/`** - Vault feature
- **`src/features/chats/`** - Chat feature

Each feature can have its own internal structure:
```
features/docs/
├── components/      # Feature-specific components
├── api/            # Feature-specific API calls
├── hooks/          # Feature-specific hooks
├── stores/         # Feature-specific state
└── types.ts        # Feature-specific types
```

### 3. Path Aliases

All imports use the `@/` alias which resolves to `src/`:

```typescript
// ✅ Good - using path alias
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { DocEditor } from "@/features/docs/components/DocEditor"

// ❌ Bad - relative paths for src/ code
import { Button } from "../../components/ui/button"
```

### 4. Component Placement Guidelines

**Shared Components** → `src/components/`
- Components used across multiple features
- UI primitives (buttons, inputs, modals, etc.)
- Layout components

**Feature Components** → `src/features/<feature>/components/`
- Components specific to a single feature
- Business logic components tied to a domain

**Example:**
- `src/components/ui/button.tsx` - Shared button component
- `src/features/docs/components/DocEditor.tsx` - Document editor (docs-specific)

### 5. File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `doc-editor.tsx`, `user-profile.tsx`)
- **Hooks**: `use-kebab-case.ts` or `use-kebab-case.tsx` (e.g., `use-debounce.ts`, `use-media-query.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `date-formatter.ts`, `error-handler.ts`)
- **Types**: `kebab-case.ts` (e.g., `api-types.ts`, `user-types.ts`)

## Migration Notes

This structure was migrated from a root-level organization where directories like `app/`, `components/`, `features/`, etc. were at the repository root. All code has been moved under `src/` to follow Next.js best practices and improve project organization.

### Configuration Updates

- **`tsconfig.json`**: Path alias `@/*` now resolves to `./src/*`
- **`tailwind.config.ts`**: Content paths updated to include `./src/**/*.{ts,tsx}`
- **`components.json`**: CSS path updated to reflect new structure

## Best Practices

1. **Keep features self-contained**: Feature-specific code should live within the feature directory
2. **Extract to shared when reused**: If code is used by 2+ features, consider moving it to a shared location
3. **Use path aliases**: Always use `@/` for imports from `src/`
4. **Maintain consistent structure**: Follow the established patterns within features
5. **Document complex features**: Add README files in feature directories for complex features

## Related Documentation

- [Component Guidelines](../components/README.md)
- [API Documentation](../api/README.md)
- [Testing Guide](../testing/README.md)

