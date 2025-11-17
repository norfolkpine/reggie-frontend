# Architecture Documentation

This directory contains comprehensive documentation about the opie-frontend application architecture.

## Overview

The opie-frontend is a Next.js 15 application built with TypeScript, React, and modern web technologies. It follows a feature-based architecture with type-based organization for shared code.

## Documentation Index

### Core Architecture

1. **[Routing and Navigation](./routing-navigation.md)**
   - Next.js App Router structure
   - Route groups and organization
   - Navigation hooks and utilities
   - Middleware and route protection
   - Dynamic routes

2. **[State Management](./state-management.md)**
   - Zustand stores (global and feature-specific)
   - React Query (TanStack Query) for server state
   - React Context for cross-cutting concerns
   - State management patterns and best practices

3. **[API Layer](./api-layer.md)**
   - API client architecture
   - CSRF token management
   - Authentication integration
   - Error handling
   - API endpoint wrappers

4. **[Styling and Theming](./styling-theming.md)**
   - Tailwind CSS configuration
   - Shadcn UI components
   - Cunningham design system
   - Theme provider and dark mode
   - Responsive design

5. **[Authentication](./authentication.md)**
   - Authentication flow
   - Auth context and providers
   - Route protection
   - Session management
   - Token expiration handling

6. **[Feature Architecture](./features.md)**
   - Feature-based organization
   - Feature structure patterns
   - Available features
   - Feature communication
   - Development guidelines

7. **[Build and Deployment](./build-deployment.md)**
   - Build configuration
   - Docker deployment
   - Google Cloud Build
   - Vercel deployment
   - Performance optimization

## Quick Start

### For New Developers

1. Start with [Routing and Navigation](./routing-navigation.md) to understand how routes work
2. Review [State Management](./state-management.md) to understand data flow
3. Check [API Layer](./api-layer.md) for backend integration

### For Feature Development

1. Review [Feature Architecture](./features.md) for feature patterns
2. Check [State Management](./state-management.md) for feature state
3. See [Styling and Theming](./styling-theming.md) for UI development

### For Deployment

1. Read [Build and Deployment](./build-deployment.md) for deployment processes
2. Check environment variable requirements
3. Review Docker and cloud build configurations

## Architecture Principles

### 1. Type-Based Organization for Shared Code

Shared, reusable code is organized by **type** (components, hooks, contexts, etc.):

- `src/components/` - All shared UI components
- `src/hooks/` - All shared React hooks
- `src/contexts/` - All React context providers
- `src/lib/` - All utility libraries

### 2. Feature-Based Organization for Domain Logic

Feature-specific code is organized by **domain/feature**:

- `src/features/docs/` - Document management
- `src/features/chats/` - Chat functionality
- `src/features/workflows/` - Workflow automation

### 3. Separation of Concerns

- **UI Components** → `src/components/`
- **Business Logic** → `src/features/<feature>/`
- **Utilities** → `src/lib/`
- **Configuration** → `src/config/`

### 4. Type Safety

- TypeScript throughout
- Type-safe route navigation
- Type-safe API calls
- Interface definitions for all data structures

## Technology Stack

### Core Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library

### State Management

- **Zustand** - Client state management
- **React Query** - Server state and caching
- **React Context** - Cross-cutting concerns

### Key Libraries

- **BlockNote** - Rich text editor
- **Yjs + Hocuspocus** - Collaborative editing
- **React Flow** - Workflow visualization
- **Framer Motion** - Animations
- **Sentry** - Error tracking

## Related Documentation

Additional documentation may be added in the future for:
- Component Guidelines
- API Documentation
- Testing Guide
- Deployment Guide

## Contributing

When adding new features or making architectural changes:

1. Follow the established patterns
2. Update relevant documentation
3. Maintain type safety
4. Keep features self-contained
5. Extract to shared when reused by 2+ features

## Questions?

For questions about the architecture:

1. Check the relevant documentation file
2. Review existing feature implementations
3. Consult the team for architectural decisions

