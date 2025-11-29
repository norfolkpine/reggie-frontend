# Installation Guide

## ✅ What's Included

This transfer directory contains **complete, custom-built components**. All components are ready to use - no additional installation needed beyond NPM dependencies.

## 📦 Step 1: Install NPM Dependencies

Install the required packages:

```bash
# Using npm
npm install @tanstack/react-table @tanstack/react-virtual
npm install @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-direction
npm install @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tooltip
npm install lucide-react class-variance-authority clsx cmdk
npm install date-fns react-day-picker sonner tailwind-merge tailwindcss-animate

# Optional - only if using AI features
npm install @google/genai
```

Or using pnpm:

```bash
pnpm add @tanstack/react-table @tanstack/react-virtual
pnpm add @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-direction
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select
pnpm add @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tooltip
pnpm add lucide-react class-variance-authority clsx cmdk
pnpm add date-fns react-day-picker sonner tailwind-merge tailwindcss-animate

# Optional - only if using AI features
pnpm add @google/genai
```

Or using yarn:

```bash
yarn add @tanstack/react-table @tanstack/react-virtual
yarn add @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-direction
yarn add @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select
yarn add @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tooltip
yarn add lucide-react class-variance-authority clsx cmdk
yarn add date-fns react-day-picker sonner tailwind-merge tailwindcss-animate

# Optional - only if using AI features
yarn add @google/genai
```

## ❌ Do NOT Use shadcn CLI

**Important:** These are **custom-built components**, not shadcn components. 

**Do NOT run these commands:**
```bash
# ❌ Don't use - components are already included
pnpm dlx shadcn@2.4.0-canary.12 add "https://diceui.com/r/data-grid"
pnpm dlx shadcn@2.4.0-canary.12 add "https://diceui.com/r/data-grid-sort-menu"
pnpm dlx shadcn@2.4.0-canary.12 add "https://diceui.com/r/data-grid-row-height-menu"
pnpm dlx shadcn@2.4.0-canary.12 add "https://diceui.com/r/data-grid-view-menu"
pnpm dlx shadcn@2.4.0-canary.12 add "https://diceui.com/r/data-grid-keyboard-shortcuts"
```

The shadcn commands above are for a **different component library** (diceui.com) and are **not compatible** with this codebase.

**All components are already included** in this transfer directory - just copy them!

## 📋 What's Included vs. What's Not

### ✅ Included (Custom Components)
- Complete data grid implementation (`components/data-grid/`)
- All UI components (`components/ui/`)
- All hooks (`hooks/`)
- All utilities (`lib/`)
- All types (`types/`)
- Document processing services (`services/`)
- Demo component (`pages/demo.tsx`)

### ❌ Not Included (Use shadcn CLI if needed)
- Nothing! Everything is included.

### 🔧 Optional Setup
- Python backend for PDF/DOCX processing (see `../server/`)
- Environment variables for AI features (see Configuration section)

## 🎯 Features Included

The custom data grid components provide:

- ✅ **High Performance:** Virtualized rows and columns for handling large datasets
- ✅ **Cell Editing:** In-place editing with various cell types (text, number, select, date, etc.)
- ✅ **Cell Selection:** Single and multi-cell selection
- ✅ **Cell Copying:** Copy selected cells to clipboard
- ✅ **Keyboard Navigation:** Full keyboard support with Excel-like shortcuts
- ✅ **Context Menu:** Right-click actions for rows and cells
- ✅ **Sorting:** Multi-column sorting with drag-and-drop reordering
- ✅ **Search:** Find and navigate to matching cells with keyboard shortcuts
- ✅ **Row Management:** Add, delete, and reorder rows
- ✅ **Column Resizing:** Adjustable column widths
- ✅ **Paste Support:** Paste from clipboard with automatic row expansion
- ✅ **File Upload:** Drag-and-drop file support in cells

## 🔧 Configuration

### TypeScript Path Aliases

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Environment Variables

Create `.env` or `.env.local`:

```env
# Backend API URL (for PDF/DOCX processing)
VITE_API_URL=http://localhost:8000

# Google Gemini API Key (for AI features - optional)
VITE_GEMINI_API_KEY=your_api_key_here
```

### Tailwind CSS

Ensure Tailwind is configured with the `tailwindcss-animate` plugin:

```js
// tailwind.config.js
module.exports = {
  plugins: [require('tailwindcss-animate')],
  // ... rest of config
}
```

## 📝 Next Steps

1. ✅ Install NPM dependencies (see above)
2. ✅ Copy components in order (see `COPY_CHECKLIST.md`)
3. ✅ Configure TypeScript paths
4. ✅ Set environment variables
5. ✅ Update import paths (`@/` → your project structure)
6. ✅ Test each phase

See `MIGRATION_GUIDE.md` for detailed migration instructions.

