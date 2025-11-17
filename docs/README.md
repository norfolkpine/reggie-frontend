# Documentation

Welcome to the reggie-frontend documentation. This directory contains comprehensive documentation about the application architecture, development practices, and deployment.

## Overview

This documentation is organized by topic to help you quickly find what you need. Each folder contains a README.md file that serves as an index and summary for that section.

## Documentation Sections

### [Architecture](./architecture/)

Comprehensive documentation about the application architecture, including:

- **[Architecture Overview](./architecture/README.md)** - Start here for a comprehensive overview and index
- **Routing and Navigation** - Next.js App Router patterns
- **State Management** - Zustand, React Query, and Context patterns
- **API Layer** - API client and data fetching
- **Styling and Theming** - Tailwind, Shadcn UI, and design system
- **Authentication** - Auth flows and security
- **Feature Architecture** - Feature-based organization patterns
- **Build and Deployment** - Build configuration and deployment processes

See the [Architecture README](./architecture/README.md) for the complete index and detailed descriptions.

## Quick Start

### For New Developers
1. Start with the [Architecture Overview](./architecture/README.md)
2. Read [Routing and Navigation](./architecture/routing-navigation.md) to understand routing
3. Learn about [State Management](./architecture/state-management.md) for data flow

### For Feature Development
1. Review [Feature Architecture](./architecture/features.md) for patterns
2. Check [Styling and Theming](./architecture/styling-theming.md) for UI development
3. Understand [API Layer](./architecture/api-layer.md) for backend integration

### For Deployment
1. Read [Build and Deployment](./architecture/build-deployment.md) for deployment processes
2. Review environment variable requirements
3. Check Docker and cloud build configurations

## Documentation Structure

```
docs/
├── README.md            # Main documentation index
└── architecture/        # Architecture documentation
    ├── README.md        # Architecture overview and index
    ├── routing-navigation.md
    ├── state-management.md
    ├── api-layer.md
    ├── styling-theming.md
    ├── authentication.md
    ├── features.md
    └── build-deployment.md
```

## Contributing

When adding or updating documentation:

1. Follow the existing structure and format
2. Keep documentation up-to-date with code changes
3. Use clear examples and code snippets
4. Cross-reference related documentation
5. Update the README files when adding new sections

