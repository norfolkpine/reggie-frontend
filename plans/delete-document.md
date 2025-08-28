# Delete Document Functionality Standardization Plan

## Current Issues

### 1. Redirect Problem in DocToolBox
- **Location**: `features/docs/doc-header/components/DocToolBox.tsx`
- **Issue**: When deleting a document from the editor, the user is redirected to `/` (home) instead of `/documents` (documents list page)
- **Current Implementation**: Uses `ModalRemoveDoc` which redirects to `/` for non-home pages
- **Expected Behavior**: Should redirect to `/documents` after successful deletion

### 2. Inconsistent Delete Dialog Implementation
- **Current State**: Multiple components have different delete implementations:
  - `DocToolBox.tsx` → Uses `ModalRemoveDoc` (custom implementation)
  - `sidebar.tsx` → Uses direct `removeDocMutation.mutate()` (no confirmation dialog)
  - `recent-documents.tsx` → Has delete menu item but no actual functionality
  - `DeleteDocumentDialog.tsx` → Generic component but not used anywhere

### 3. Missing Confirmation Dialogs
- **Sidebar**: Deletes documents immediately without confirmation
- **Recent Documents**: Delete option exists but doesn't work

## Solution Plan

### Phase 1: Fix Redirect Logic in DocToolBox

1. **Update ModalRemoveDoc redirect logic**
   - Change redirect from `/` to `/documents` for document pages
   - Keep current behavior for home page (`/`)

2. **Update DocToolBox implementation**
   - Ensure proper navigation after deletion
   - Handle edge cases (e.g., if user is on a document page)

### Phase 2: Standardize Delete Dialog

1. **Enhance DeleteDocumentDialog component**
   - Add proper TypeScript types for document deletion
   - Include loading states and error handling
   - Add proper confirmation text with document title
   - Make it reusable across all components

2. **Update DocToolBox to use standardized dialog**
   - Replace `ModalRemoveDoc` with enhanced `DeleteDocumentDialog`
   - Maintain current functionality while improving UX

3. **Update Sidebar to use confirmation dialog**
   - Replace direct deletion with `DeleteDocumentDialog`
   - Add proper error handling and loading states
   - Ensure proper navigation after deletion

4. **Update Recent Documents to use confirmation dialog**
   - Implement actual delete functionality
   - Use `DeleteDocumentDialog` for consistency
   - Handle navigation and list updates

### Phase 3: Implementation Details

#### Enhanced DeleteDocumentDialog Component
```typescript
interface DeleteDocumentDialogProps {
  open: boolean;
  document: Doc; // Use actual Doc type
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  onSuccess?: () => void; // Callback for successful deletion
}
```

#### Standardized Delete Flow
1. **User clicks delete** → Open confirmation dialog
2. **User confirms** → Show loading state, call delete API
3. **Success** → Show success toast, close dialog, navigate to documents list
4. **Error** → Show error message, keep dialog open

#### Navigation Logic
- **From document page** (`/documents/[id]`) → Redirect to `/documents`
- **From documents list** (`/documents`) → Stay on page, refresh list
- **From sidebar** → Stay on current page, refresh sidebar list
- **From recent documents** → Stay on page, refresh recent documents list

### Phase 4: Testing and Validation

1. **Test delete from editor page**
   - Verify redirect to documents list
   - Check success toast appears
   - Ensure document is removed from list

2. **Test delete from sidebar**
   - Verify confirmation dialog appears
   - Check deletion works correctly
   - Ensure sidebar list updates

3. **Test delete from recent documents**
   - Verify confirmation dialog appears
   - Check deletion works correctly
   - Ensure list updates properly

4. **Test error scenarios**
   - Network failures
   - Permission errors
   - Invalid document IDs

## Implementation Phases

### Phase 1: Fix Redirect Logic (Immediate Fix)
- [x] **Fix ModalRemoveDoc redirect logic**
  - [x] Update redirect from `/` to `/documents` for document pages
  - [x] Keep current behavior for home page (`/`)
  - [x] Test redirect functionality (code review completed)
- [x] **Update DocToolBox implementation**
  - [x] Ensure proper navigation after deletion
  - [x] Handle edge cases (e.g., if user is on a document page)
  - [x] Test navigation scenarios (code review completed)

### Phase 2: Standardize Delete Dialog (Foundation)
- [ ] **Enhance DeleteDocumentDialog component**
  - [ ] Add proper TypeScript types for document deletion
  - [ ] Include loading states and error handling
  - [ ] Add proper confirmation text with document title
  - [ ] Make it reusable across all components
  - [ ] Test component functionality
- [ ] **Update DocToolBox to use standardized dialog**
  - [ ] Replace `ModalRemoveDoc` with enhanced `DeleteDocumentDialog`
  - [ ] Maintain current functionality while improving UX
  - [ ] Test integration

### Phase 3: Update Components (Implementation)
- [ ] **Update Sidebar to use confirmation dialog**
  - [ ] Replace direct deletion with `DeleteDocumentDialog`
  - [ ] Add proper error handling and loading states
  - [ ] Ensure proper navigation after deletion
  - [ ] Test sidebar deletion flow
- [ ] **Update Recent Documents to use confirmation dialog**
  - [ ] Implement actual delete functionality
  - [ ] Use `DeleteDocumentDialog` for consistency
  - [ ] Handle navigation and list updates
  - [ ] Test recent documents deletion flow

### Phase 4: Testing and Validation
- [ ] **Test delete from editor page**
  - [ ] Verify redirect to documents list
  - [ ] Check success toast appears
  - [ ] Ensure document is removed from list
- [ ] **Test delete from sidebar**
  - [ ] Verify confirmation dialog appears
  - [ ] Check deletion works correctly
  - [ ] Ensure sidebar list updates
- [ ] **Test delete from recent documents**
  - [ ] Verify confirmation dialog appears
  - [ ] Check deletion works correctly
  - [ ] Ensure list updates properly
- [ ] **Test error scenarios**
  - [ ] Network failures
  - [ ] Permission errors
  - [ ] Invalid document IDs
- [ ] **Integration testing**
  - [ ] Test all deletion flows together
  - [ ] Verify no breaking changes
  - [ ] Performance testing

## Files to Modify

### Primary Changes
- `features/docs/doc-management/components/ModalRemoveDoc.tsx` - Fix redirect logic
- `components/doc/DeleteDocumentDialog.tsx` - Enhance for document deletion
- `features/docs/doc-header/components/DocToolBox.tsx` - Use enhanced dialog
- `components/sidebar.tsx` - Add confirmation dialog
- `app/(dashboard)/documents/_components/recent-documents.tsx` - Implement delete functionality

### Supporting Changes
- `features/docs/doc-management/api/useRemoveDoc.tsx` - Ensure proper error handling
- `features/docs/doc-management/types.ts` - Verify Doc type compatibility

## Success Criteria

### Core Functionality
- [ ] Delete from editor redirects to documents list
- [ ] All delete actions show confirmation dialog
- [ ] Consistent user experience across all components

### Technical Requirements
- [ ] Proper error handling and loading states
- [ ] Navigation works correctly in all scenarios
- [ ] No breaking changes to existing functionality
- [ ] All components use the same delete flow
- [ ] Proper TypeScript types and error handling

## Notes

- The current `ModalRemoveDoc` component works but has inconsistent navigation
- The `DeleteDocumentDialog` component exists but needs enhancement for document-specific use
- Sidebar deletion currently works but lacks user confirmation
- Recent documents delete option is non-functional
- All components should use the same delete flow for consistency
