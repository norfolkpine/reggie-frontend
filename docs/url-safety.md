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

## Security Notes & Snyk Warnings

### Why Snyk May Still Warn
Snyk and other security tools may still flag code that uses URLs from localStorage (or other browser storage) in DOM attributes, even if you use `isSafeUrl`. This is because:
- **localStorage is not a secure source:** Any JavaScript running in the browser (including malicious extensions or injected scripts) can modify localStorage.
- **Critical config should come from trusted sources:** If an attacker can write to localStorage, they could inject a malicious stylesheet or script.

### Best Practices
- **Do not trust localStorage for security-sensitive configuration.**
  - Always prefer config values fetched from your backend API or other trusted sources.
  - Use localStorage only as a cache, and always validate with `isSafeUrl` before using any value in the DOM.
- **Restrict allowed hostnames for stylesheets:**
  - For maximum security, only allow URLs from your own domain or CDN. Example:
    ```ts
    function isSafeUrl(url: string | undefined): boolean {
      if (!url) return false;
      try {
        const parsed = new URL(url, window.location.origin);
        return (
          parsed.protocol === 'https:' &&
          parsed.hostname.endsWith('yourdomain.com') // restrict to your domain
        );
      } catch {
        return false;
      }
    }
    ```
- **Document your validation logic and reasoning.**
  - If you suppress a Snyk warning, add a comment explaining why your validation is sufficient.

### Summary
- Snyk is warning because localStorage is not a secure config source.
- `isSafeUrl` mitigates most XSS risks, but restricting to your own domain is even safer.
- For critical config, always prefer trusted sources over browser storage.

---

**See also:** `lib/utils/url.ts` for the implementation and inline documentation. 