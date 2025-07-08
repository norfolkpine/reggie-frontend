# Todo

## Development Tasks

### UI/UX Improvements
- [ ] **Consistent Markdown Components**: We need to have consistent markdown components between chat and docs
  - [ ] Audit current markdown rendering in chat interface
  - [ ] Audit current markdown rendering in documentation pages
  - [ ] Identify inconsistencies in styling, typography, and component behavior
  - [ ] Create shared markdown component library
  - [ ] Update both chat and docs to use the shared components
  - [ ] Test markdown rendering across different content types

## Completed Tasks

### Bug Fixes
- [x] **Fixed Markdown Hydration Error**: Resolved "In HTML, <div> cannot be a descendant of <p>" error in chat interface
  - [x] Identified issue in `MarkdownComponents` where `pre` component was returning children directly
  - [x] Updated `pre` component to properly handle code blocks and prevent invalid HTML structure
  - [x] Added fallback handling for non-code pre content
  - [x] Ensured CodeBlock component renders outside of paragraph context

## Notes

- Priority: High - Markdown consistency affects user experience across the platform
- Impact: Improves readability and maintains design consistency
- Dependencies: May require updates to existing chat and documentation components
- **Recent Fix**: Resolved hydration error by fixing pre/code component rendering in markdown components 