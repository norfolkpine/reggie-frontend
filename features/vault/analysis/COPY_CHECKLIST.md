# Copy Checklist

Use this checklist to track your migration progress.

## Phase 1: Foundation & Types ✅

### Types
- [ ] `types/data-grid.ts`
- [ ] `types/types.ts`

### Constants & Utilities
- [ ] `lib/data-grid-constants.ts`
- [ ] `lib/utils.ts`
- [ ] `lib/compose-refs.ts`
- [ ] `lib/data-grid.ts`

**Dependencies:** None (base types and utilities)

---

## Phase 2: UI Components ✅

### Base UI Components
- [ ] `components/ui/badge.tsx`
- [ ] `components/ui/button.tsx`
- [ ] `components/ui/calendar.tsx`
- [ ] `components/ui/checkbox.tsx`
- [ ] `components/ui/command.tsx`
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/dropdown-menu.tsx`
- [ ] `components/ui/input.tsx`
- [ ] `components/ui/popover.tsx`
- [ ] `components/ui/select.tsx`
- [ ] `components/ui/separator.tsx`
- [ ] `components/ui/skeleton.tsx`
- [ ] `components/ui/tabs.tsx`
- [ ] `components/ui/textarea.tsx`
- [ ] `components/ui/tooltip.tsx`

### Icons
- [ ] `components/Icons.tsx`

**Dependencies:** Radix UI primitives, Tailwind CSS, `lib/utils.ts`

---

## Phase 3: Data Grid Core ✅

### Hooks
- [ ] `hooks/use-data-grid.tsx` ⚠️ **Large file (~2400 lines)**
- [ ] `hooks/use-badge-overflow.ts`
- [ ] `hooks/use-callback-ref.ts`
- [ ] `hooks/use-debounced-callback.ts`

### Data Grid Components (Copy in order)
- [ ] `components/data-grid/data-grid-cell-variants.tsx`
- [ ] `components/data-grid/data-grid-cell-wrapper.tsx`
- [ ] `components/data-grid/data-grid-cell.tsx`
- [ ] `components/data-grid/data-grid-column-header.tsx`
- [ ] `components/data-grid/data-grid-row.tsx`
- [ ] `components/data-grid/data-grid-search.tsx`
- [ ] `components/data-grid/data-grid-context-menu.tsx`
- [ ] `components/data-grid/data-grid-paste-dialog.tsx`
- [ ] `components/data-grid/data-grid.tsx`

**Dependencies:** `@tanstack/react-table`, `@tanstack/react-virtual`, Phase 1 & 2

---

## Phase 4: Document Processing Services ✅

### Services
- [ ] `services/documentProcessor.ts`
- [ ] `services/documentProcessingService.ts`
- [ ] `services/geminiService.ts` (Optional - only if using AI features)

**Dependencies:** 
- `documentProcessor.ts` requires backend server (see `../server/`)
- `geminiService.ts` requires `@google/genai` and `VITE_GEMINI_API_KEY`

---

## Phase 5: Feature Components ✅

- [ ] `components/AddColumnMenu.tsx`

**Dependencies:** Phase 2, 4 (if using AI features)

---

## Phase 6: Demo Component ✅

- [ ] `pages/demo.tsx`

**Dependencies:** Everything above

---

## Configuration Files

- [ ] `package.json` (reference for dependencies)
- [ ] `tsconfig.json` (reference for TypeScript config)
- [ ] Update import paths (`@/` → your project structure)
- [ ] Set environment variables (`.env` file)

---

## Testing Checklist

After each phase, verify:
- [ ] All imports resolve correctly
- [ ] No TypeScript errors
- [ ] Components render without errors
- [ ] Basic functionality works

---

## Notes

- ⚠️ **Large files:** `use-data-grid.tsx` is ~2400 lines - be patient during copy
- 🔧 **Import paths:** All files use `@/` - update to match your project
- 🌐 **Backend:** PDF/DOCX processing requires Python backend (see `../server/`)
- 🤖 **AI features:** Optional - skip `geminiService.ts` if not needed
- 📦 **Dependencies:** Install NPM packages before testing
- ❌ **No shadcn CLI:** These are custom-built components - all included here, no CLI needed

---

## Quick Copy Commands

If copying to a new project with similar structure:

```bash
# Phase 1
cp -r transfer/types/* your-project/src/types/
cp -r transfer/lib/* your-project/src/lib/

# Phase 2
cp -r transfer/components/ui/* your-project/src/components/ui/
cp transfer/components/Icons.tsx your-project/src/components/

# Phase 3
cp -r transfer/hooks/* your-project/src/hooks/
cp -r transfer/components/data-grid/* your-project/src/components/data-grid/

# Phase 4
cp -r transfer/services/* your-project/src/services/

# Phase 5
cp transfer/components/AddColumnMenu.tsx your-project/src/components/

# Phase 6
cp transfer/pages/demo.tsx your-project/src/pages/
```

**Remember:** Update all `@/` imports to match your project structure!

