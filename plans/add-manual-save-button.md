# Add Manual Save Button to Document Editor

## Current State Analysis

### **Existing Autosave Implementation**
- **Location**: `features/docs/doc-editor/hook/useSaveDoc.tsx`
- **Autosave Triggers**:
  - Every 60 seconds (`SAVE_INTERVAL = 60000`)
  - Route changes (navigation)
  - Before page unload (`beforeunload` event)
  - Document updates from collaboration
- **Save Logic**: Only saves when there are local changes (`isLocalChange` state)
- **API**: Uses `useUpdateDoc` mutation with proper query invalidation

### **Current UI Structure**
- **Main Editor**: `features/docs/doc-editor/components/DocEditor.tsx`
- **Header**: `features/docs/doc-header/components/DocHeader.tsx`
- **Toolbox**: `features/docs/doc-header/components/DocToolBox.tsx` (contains share, export, delete, etc.)
- **Editor**: `features/docs/doc-editor/components/BlockNoteEditor.tsx`

## Proposed Solution

### **Phase 1: Enhance useSaveDoc Hook**
- [ ] **Add manual save function**
  - [ ] Expose `saveDoc` function from the hook
  - [ ] Add `isSaving` state for loading indicators
  - [ ] Add `lastSaved` timestamp for user feedback
  - [ ] Add `hasUnsavedChanges` state for visual indicators

### **Phase 2: Add Save Button to UI**
- [ ] **Update DocToolBox component**
  - [ ] Add save button with save icon
  - [ ] Show loading state during save
  - [ ] Show last saved timestamp
  - [ ] Position button logically in the toolbox

### **Phase 3: Enhanced User Experience**
- [ ] **Visual feedback**
  - [ ] Save button shows "Saved" state briefly after save
  - [ ] Unsaved changes indicator (e.g., dot or asterisk)
  - [ ] Last saved time display
  - [ ] Keyboard shortcut (Ctrl+S / Cmd+S)

### **Phase 4: Advanced Features**
- [ ] **Save status indicators**
  - [ ] Show autosave vs manual save
  - [ ] Save error handling and retry
  - [ ] Offline save queue
  - [ ] Save conflict resolution

## Implementation Details

### **Enhanced useSaveDoc Hook Interface**
```typescript
interface UseSaveDocReturn {
  saveDoc: () => boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
  retrySave: () => void;
}
```

### **Save Button Design**
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={handleManualSave}
  disabled={isSaving || !hasUnsavedChanges}
>
  {isSaving ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      {hasUnsavedChanges ? 'Save' : 'Saved'}
    </>
  )}
</Button>
```

### **Save Status Display**
```tsx
<div className="text-xs text-muted-foreground">
  {lastSaved ? (
    <>Last saved: {formatRelativeTime(lastSaved)}</>
  ) : (
    <>Not saved yet</>
  )}
  {hasUnsavedChanges && (
    <span className="ml-2 text-orange-600">•</span>
  )}
</div>
```

## Benefits

### **User Experience**
- ✅ **Immediate feedback** - Users know when their work is saved
- ✅ **Control** - Users can save manually when they want
- ✅ **Confidence** - Clear indication of save status
- ✅ **Accessibility** - Keyboard shortcuts and visual indicators

### **Technical Benefits**
- ✅ **Maintains autosave** - Best of both worlds
- ✅ **Better error handling** - Users can retry failed saves
- ✅ **Offline support** - Manual save can queue for later
- ✅ **Performance** - Users can save at optimal times

## Implementation Order

1. **Enhance useSaveDoc hook** (foundation)
2. **Add save button to DocToolBox** (UI)
3. **Implement visual feedback** (UX)
4. **Add keyboard shortcuts** (accessibility)
5. **Advanced features** (error handling, offline support)

## Files to Modify

### **Primary Changes**
- `features/docs/doc-editor/hook/useSaveDoc.tsx` - Enhance hook interface
- `features/docs/doc-header/components/DocToolBox.tsx` - Add save button
- `features/docs/doc-header/components/DocHeader.tsx` - Add save status display

### **Supporting Changes**
- `features/docs/doc-editor/components/BlockNoteEditor.tsx` - Use enhanced hook
- `features/docs/doc-editor/components/DocEditor.tsx` - Pass save status to header

## Success Criteria

- [ ] Manual save button works alongside autosave
- [ ] Clear visual feedback for save status
- [ ] Keyboard shortcuts (Ctrl+S / Cmd+S) work
- [ ] Save button shows appropriate states (Save, Saving, Saved)
- [ ] Last saved time is displayed
- [ ] Unsaved changes are clearly indicated
- [ ] No breaking changes to existing autosave functionality

## Notes

- **Autosave remains primary** - Manual save is an enhancement, not replacement
- **Collaboration support** - Manual save works with real-time collaboration
- **Performance** - Manual save doesn't interfere with autosave timing
- **Accessibility** - Keyboard shortcuts and screen reader support
- **Mobile friendly** - Save button works on all device sizes
