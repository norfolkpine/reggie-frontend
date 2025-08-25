# Test CSRF Token Debugging

This directory contains tools to help debug CSRF token issues with Django.

## Quick Test

1. Open browser console
2. Run: `await fetch('http://127.0.0.1:8000/', { credentials: 'include' })`
3. Check if CSRF cookie is set: `document.cookie`
4. Try to get CSRF token: `getCSRFToken()`

## Common Issues

1. **Session not established**: Django needs a session before CSRF tokens work
2. **Token expired**: CSRF tokens can expire
3. **Domain mismatch**: Tokens are domain-specific
4. **Header format**: Django expects `X-CSRFToken` (exact case)

## Debug Steps

1. Visit Django homepage first: `http://127.0.0.1:8000/`
2. Check cookies in browser dev tools
3. Verify CSRF token is present
4. Test API call with token

## Manual Test

```javascript
// 1. Visit Django page to establish session
await fetch('http://127.0.0.1:8000/', { 
  credentials: 'include' 
});

// 2. Check cookies
console.log('Cookies:', document.cookie);

// 3. Get CSRF token
const csrfToken = document.cookie
  .split(';')
  .find(c => c.trim().startsWith('csrftoken='))
  ?.split('=')[1];

console.log('CSRF Token:', csrfToken);

// 4. Test API call
if (csrfToken) {
  const response = await fetch('http://127.0.0.1:8000/reggie/api/v1/projects/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ name: 'Test Project' })
  });
  
  console.log('Response:', response.status, response.statusText);
}
```
