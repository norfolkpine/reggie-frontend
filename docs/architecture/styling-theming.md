# Styling and Theming

This document describes the styling architecture, theming system, and design tokens used in the opie-frontend application.

## Overview

The application uses a multi-layered styling approach:

1. **Tailwind CSS** - Utility-first CSS framework
2. **Shadcn UI** - Component library built on Radix UI
3. **Cunningham** - Design system and theming
4. **CSS Modules** - Component-specific styles

## Tailwind CSS

### Configuration

**Location:** `tailwind.config.ts`

### Content Paths

Tailwind scans these paths for class usage:

```typescript
content: [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  // ... more paths
]
```

### Theme Configuration

**Color System:**

The application uses CSS variables for colors, enabling theme switching:

```typescript
colors: {
  border: "hsl(var(--border))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ... more colors
}
```

**Font Configuration:**

Multiple font families are configured:

```typescript
fontFamily: {
  sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
  serif: ["Ancizar Serif", "serif"],
  display: ["Funnel Display", "var(--font-red-hat-display)", ...],
  heading: ["var(--font-raleway)", "Raleway", ...],
  comfortaa: ["Comfortaa", ...],
}
```

**Font Loading:**

Fonts are loaded in `src/app/layout.tsx`:

```typescript
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

const raleway = Raleway({ 
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap"
})

const redHatDisplay = Red_Hat_Display({ 
  subsets: ["latin"],
  variable: "--font-red-hat-display",
  display: "swap"
})
```

### Global Styles

**Location:** `src/styles/globals.css`

Contains:
- CSS variable definitions for theming
- Base styles
- Tailwind directives
- Custom utility classes

## Shadcn UI

### Component Library

Shadcn UI components are located in `src/components/ui/`.

**Key Features:**
- Built on Radix UI primitives
- Fully customizable
- TypeScript support
- Accessible by default

### Usage

```typescript
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

### Component Configuration

**Location:** `components.json`

Configures:
- Component paths
- Style paths
- Tailwind configuration
- CSS variables

## Cunningham Design System

### Overview

Cunningham provides a comprehensive design system with theming support.

**Location:** `src/cunningham/`

### Theme Tokens

**Location:** `src/cunningham/cunningham-tokens.ts`

Defines color palettes, spacing, typography, and component tokens:

```typescript
export const tokens = {
  themes: {
    default: {
      theme: {
        colors: {
          'primary-500': '#6A6AF4',
          'secondary-400': '#e1020f',
          'info-500': '#0078F3',
          // ... more colors
        },
        spacings: {
          // ... spacing values
        },
        font: {
          sizes: {
            // ... font sizes
          }
        }
      },
      components: {
        // ... component-specific tokens
      }
    }
  }
}
```

### Theme Hook

**Location:** `src/cunningham/useCunninghamTheme.tsx`

Zustand store for theme management:

```typescript
import { useCunninghamTheme } from "@/cunningham"

function MyComponent() {
  const { theme, setTheme, colorsTokens } = useCunninghamTheme()
  
  return (
    <div style={{ color: colorsTokens['primary-500'] }}>
      Themed content
    </div>
  )
}
```

### Cunningham Provider

**Location:** `src/config/AppProvider.tsx`

Cunningham provider wraps the application:

```typescript
import { CunninghamProvider } from '@openfun/cunningham-react'

<CunninghamProvider theme={theme}>
  {children}
</CunninghamProvider>
```

## Theme Provider

### Next Themes Integration

**Location:** `src/components/theme-provider.tsx`

Uses `next-themes` for dark/light mode switching:

```typescript
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
  storageKey="theme"
>
  {children}
</ThemeProvider>
```

**Features:**
- System theme detection
- Persistent theme preference
- Smooth theme transitions
- Class-based theming

### Theme Usage

```typescript
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  )
}
```

## CSS Variables

### Color Variables

Defined in `src/styles/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... dark mode variables */
}
```

### Usage in Components

```typescript
// Using Tailwind utilities
<div className="bg-background text-foreground">

// Using CSS variables directly
<div style={{ backgroundColor: 'hsl(var(--background))' }}>
```

## Component-Specific Styles

### CSS Modules

Some components use CSS modules for component-specific styles:

**Example:** `src/components/sidebar/sidebar.css`

```css
.sidebar {
  /* Component-specific styles */
}
```

### Inline Styles

For dynamic styles, use inline styles or Tailwind's arbitrary values:

```typescript
<div className="w-[200px]" style={{ height: dynamicHeight }}>
```

## Responsive Design

### Breakpoints

Tailwind's default breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Responsive Utilities

```typescript
<div className="
  w-full 
  md:w-1/2 
  lg:w-1/3
">
  Responsive width
</div>
```

### Responsive Store

Use the responsive store for JavaScript-based responsive logic:

```typescript
import { useResponsiveStore } from "@/stores"

const { isMobile, isTablet, isDesktop } = useResponsiveStore()
```

## Typography

### Font Families

- **Sans (Default)**: Inter
- **Serif**: Ancizar Serif
- **Display**: Funnel Display, Red Hat Display
- **Heading**: Raleway
- **Comfortaa**: Comfortaa

### Usage

```typescript
// Using Tailwind classes
<p className="font-sans">Sans font</p>
<h1 className="font-heading">Heading font</h1>
<div className="font-display">Display font</div>
```

## Animation

### Framer Motion

The application uses Framer Motion for animations:

```typescript
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Animated content
</motion.div>
```

### CSS Animations

Custom animations in `src/styles/`:

- `logo-animation.css` - Logo animations
- `editor.css` - Editor-specific styles

## Best Practices

1. **Use Tailwind First**: Prefer Tailwind utilities over custom CSS
2. **CSS Variables**: Use CSS variables for themeable values
3. **Component Styles**: Keep component-specific styles in CSS modules
4. **Responsive Design**: Use Tailwind's responsive utilities
5. **Theme Consistency**: Use design tokens from Cunningham
6. **Accessibility**: Ensure color contrast meets WCAG standards
7. **Performance**: Minimize custom CSS, leverage Tailwind's purging

## Design Tokens

### Color Palette

- **Primary**: Main brand color
- **Secondary**: Accent color
- **Info**: Information color
- **Success**: Success state color
- **Warning**: Warning state color
- **Error**: Error state color
- **Greyscale**: Neutral colors

### Spacing Scale

Uses consistent spacing scale from Cunningham tokens.

### Typography Scale

Defined font sizes and line heights in Cunningham tokens.

## Related Documentation

- [Frontend Structure](./frontend-structure.md)
- [Component Guidelines](../components/README.md)

