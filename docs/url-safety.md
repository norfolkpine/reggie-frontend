# URL Safety Utility (`isSafeUrl`)

## Purpose

The `isSafeUrl` function is a shared utility for validating URLs before using them in any DOM attribute (such as `<img src>`, `<a href>`, `<link href>`, etc.).

## Why Use This?
- **Prevent XSS:** Ensures only safe, trusted URLs are used, protecting your app from DOM-based Cross-Site Scripting (XSS) vulnerabilities.
- **Consistency:** Centralizes URL validation logic, so all parts of the codebase use the same rules.
- **Maintainability:** If you need to update your URL validation policy, you only have to do it in one place.

## How to Use

1. **Import the function:**
   ```ts
   import { isSafeUrl } from '@/lib/utils/url';
   ```
2. **Validate URLs before using them in the DOM:**
   ```tsx
   if (isSafeUrl(url)) {
     // Safe to use in DOM
     <img src={url} />
   } else {
     // Use a fallback or show an error
   }
   ```

## When to Use
- Any time you are about to use a dynamic URL in a DOM attribute.
- Especially important for URLs that may come from user input, browser storage, or external sources.

## Example
```tsx
import { isSafeUrl } from '@/lib/utils/url';

function AppIcon({ iconUrl }: { iconUrl: string }) {
  return isSafeUrl(iconUrl)
    ? <img src={iconUrl} alt="App icon" />
    : <DefaultIcon />;
}
```

## Policy
- Only URLs that pass `isSafeUrl` should be used in any dynamic DOM context.
- If a URL does not pass, use a default/fallback or show an error.

---

**See also:** `lib/utils/url.ts` for the implementation and inline documentation. 