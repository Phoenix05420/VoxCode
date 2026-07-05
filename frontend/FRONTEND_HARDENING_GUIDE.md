# VoxCode Frontend Hardening Guide
**Implementation Time:** 6-8 hours (Phase 1)  
**Difficulty Level:** Intermediate  
**Prerequisites:** Node.js 18+, npm 9+, Git knowledge

---

## Table of Contents
1. [Pre-Implementation Checklist](#pre-implementation-checklist)
2. [Phase 1: Critical Security (Estimated 4 hours)](#phase-1-critical-security)
3. [Phase 2: High Priority (Estimated 3 hours)](#phase-2-high-priority)
4. [Phase 3: Medium Priority (Estimated 2 hours)](#phase-3-medium-priority)
5. [Testing & Validation](#testing--validation)
6. [Deployment Checklist](#deployment-checklist)

---

## Pre-Implementation Checklist

Before starting, ensure:
- [ ] Git is initialized and clean (`git status`)
- [ ] Current branch is `main` or feature branch
- [ ] All files are committed (no uncommitted changes)
- [ ] Backups exist of `vite.config.js`, `main.jsx`, `App.jsx`
- [ ] Development environment working (`npm run dev` starts without errors)
- [ ] Team reviewed the FRONTEND_SECURITY_AUDIT.md

---

## Phase 1: Critical Security

### Step 1.1: Implement Content Security Policy (CSP)

**Time:** 30 minutes  
**CVSS Fixed:** 8.2 (CSP vulnerability)

#### 1.1.1 Update `index.html` with CSP meta tag:

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1" />
  <!-- Content Security Policy -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://localhost:3001 https://api.clerk.com https://api.gemini.google.com;
    media-src 'self' blob:;
    frame-src https://challenges.cloudflare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  " />
  <title>VoxCode - Voice to Code Assistant</title>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>

</html>
```

**Explanation:**
- `default-src 'self'` - Only allow same-origin by default
- `script-src` includes `'wasm-unsafe-eval'` for Vite's dev mode
- `connect-src` restricted to known APIs
- `frame-ancestors 'none'` prevents clickjacking
- `upgrade-insecure-requests` forces HTTPS in production

#### 1.1.2 For production, create `vite.config.js` hardened version:

See [vite.config.hardened.js](#vite-hardened-config-section) below.

**Testing CSP:**
```bash
# In DevTools Console, verify no CSP violations:
# You should NOT see "Refused to load the script..."
# If you see CSP errors, adjust the meta tag above
```

---

### Step 1.2: Add Security Headers to Vite Config

**Time:** 30 minutes  
**CVSS Fixed:** 7.5 (Missing security headers)

#### 1.2.1 Update `vite.config.js`:

```javascript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security headers for all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.clerk.com https://api.gemini.google.com; base-uri 'self'; form-action 'self';",
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
        ws: true,
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
    middlewares: [
      {
        name: 'security-headers',
        apply: 'pre',
        handler: (req, res, next) => {
          Object.entries(securityHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
          next();
        },
      },
    ],
  },
  build: {
    // Enable source maps for security monitoring (remove in production)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-clerk': ['@clerk/react'],
          'vendor-monaco': ['@monaco-editor/react'],
        },
      },
    },
  },
});
```

**Key Changes:**
- Added `securityHeaders` object with all required headers
- Made API URL configurable via env vars
- Added middleware to inject headers
- Configured code splitting for better security posture

**Env File Update:** Add to `.env` and `.env.example`:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

### Step 1.3: Enforce HTTPS in Production

**Time:** 15 minutes  
**CVSS Fixed:** 8.9 (Unencrypted API)

#### 1.3.1 Create `.env.production`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
VITE_API_URL=https://api.voxcode.example.com
VITE_WS_URL=wss://api.voxcode.example.com
NODE_ENV=production
```

#### 1.3.2 Update main.jsx to validate HTTPS:

```jsx
// Add at the top of main.jsx
if (process.env.NODE_ENV === 'production' && location.protocol !== 'https:') {
  // Force redirect to HTTPS
  location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}
```

**Testing:**
```bash
# Development (HTTP allowed):
npm run dev
# Should work on http://localhost:5173

# Production build (HTTPS enforced):
npm run build
# Verify VITE_API_URL uses https://
```

---

### Step 1.4: Implement CSRF Protection

**Time:** 1 hour  
**CVSS Fixed:** 6.5 (No CSRF protection)

#### 1.4.1 Create `src/services/csrfTokenService.js`:

```javascript
/**
 * CSRF Token Management Service
 * Handles generation, storage, and validation of CSRF tokens
 */

let csrfToken = null;

export const csrfTokenService = {
  /**
   * Get CSRF token from server or localStorage cache
   */
  async getToken() {
    if (csrfToken) {
      return csrfToken;
    }

    // Try to get from localStorage (cached from previous session)
    const cached = sessionStorage.getItem('x-csrf-token');
    if (cached) {
      csrfToken = cached;
      return csrfToken;
    }

    // Request new token from backend
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const data = await response.json();
      csrfToken = data.token;
      
      // Cache in sessionStorage for rest of session
      sessionStorage.setItem('x-csrf-token', csrfToken);
      
      return csrfToken;
    } catch (error) {
      console.error('CSRF token fetch failed:', error);
      throw error;
    }
  },

  /**
   * Clear cached token (call on logout)
   */
  clearToken() {
    csrfToken = null;
    sessionStorage.removeItem('x-csrf-token');
  },

  /**
   * Inject CSRF token into headers
   */
  async injectToken(headers = {}) {
    const token = await this.getToken();
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  },
};
```

#### 1.4.2 Create `src/services/api_secure.js`:

```javascript
/**
 * Secure API Client
 * Wraps fetch with CSRF protection, rate limiting, and request validation
 */

import { csrfTokenService } from './csrfTokenService.js';

const API_BASE = '/api';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

// Rate limiting state
const requestLog = [];
const MAX_REQUESTS_PER_MINUTE = 30;

/**
 * Check if request is within rate limit
 */
const checkRateLimit = () => {
  const oneMinuteAgo = Date.now() - 60000;
  const recentRequests = requestLog.filter(t => t > oneMinuteAgo);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded. Max 30 requests per minute.');
  }
  
  requestLog.push(Date.now());
};

/**
 * Validate request content type
 */
const validateContentType = (body, headers) => {
  if (body && typeof body === 'object') {
    if (!headers['Content-Type'] || !headers['Content-Type'].includes('application/json')) {
      throw new Error('Invalid Content-Type for JSON body. Must be application/json');
    }
  }
};

/**
 * Fetch with retry and exponential backoff
 */
const fetchWithRetry = async (url, options, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      // Retry on server errors (5xx)
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export const secureApi = {
  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    checkRateLimit();
    
    const headers = await csrfTokenService.injectToken(options.headers || {});
    
    const response = await fetchWithRetry(
      `${API_BASE}${endpoint}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...headers,
        },
        ...options,
      }
    );

    return response.json();
  },

  /**
   * POST request with CSRF token
   */
  async post(endpoint, body, options = {}) {
    checkRateLimit();
    
    const headers = await csrfTokenService.injectToken({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    validateContentType(body, headers);

    const response = await fetchWithRetry(
      `${API_BASE}${endpoint}`,
      {
        method: 'POST',
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body),
        ...options,
      }
    );

    return response.json();
  },

  /**
   * PUT request with CSRF token
   */
  async put(endpoint, body, options = {}) {
    checkRateLimit();
    
    const headers = await csrfTokenService.injectToken({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    validateContentType(body, headers);

    const response = await fetchWithRetry(
      `${API_BASE}${endpoint}`,
      {
        method: 'PUT',
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body),
        ...options,
      }
    );

    return response.json();
  },

  /**
   * DELETE request with CSRF token
   */
  async delete(endpoint, options = {}) {
    checkRateLimit();
    
    const headers = await csrfTokenService.injectToken(options.headers || {});

    const response = await fetchWithRetry(
      `${API_BASE}${endpoint}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...headers,
        },
        ...options,
      }
    );

    return response.json().catch(() => null);
  },

  /**
   * Stream response (for server-sent events, etc.)
   */
  async *stream(endpoint, body, options = {}) {
    checkRateLimit();
    
    const headers = await csrfTokenService.injectToken({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    const response = await fetchWithRetry(
      `${API_BASE}${endpoint}`,
      {
        method: 'POST',
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body),
        ...options,
      }
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
            } catch (e) {
              console.warn('Error parsing stream line:', e);
            }
          }
        }
      }
    } finally {
      reader.cancel();
    }
  },

  /**
   * Clear auth tokens (call on logout)
   */
  clearAuth() {
    csrfTokenService.clearToken();
  },
};
```

#### 1.4.3 Update Dashboard.jsx to use secure API:

Replace the `getAuthHeaders` function with:
```jsx
import { secureApi } from '../services/api_secure';

// Remove the old getAuthHeaders function
// Replace API calls like:
// OLD: await fetch('/api/snippets', { headers: await getAuthHeaders() })
// NEW: await secureApi.get('/snippets')
```

---

### Step 1.5: Update API Calls Throughout App

**Time:** 1 hour  
**Files to Update:**
- `src/components/Dashboard.jsx`
- `src/services/geminiService.js`

#### 1.5.1 Update `src/services/geminiService.js`:

```javascript
import { secureApi } from './api_secure.js';

export const codeService = {
  /**
   * Stream AI results from secure API
   */
  async *streamResponse(response, onContent) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              onContent(data.content);
              yield data.content;
            }
          } catch (e) {
            console.warn('Error parsing stream line:', e);
          }
        }
      }
    }
  },

  /**
   * Generate new code from a prompt
   */
  async generate(prompt, language, onContent, signal) {
    try {
      let fullContent = '';
      for await (const chunk of secureApi.stream('/generate', { prompt, language }, { signal })) {
        if (chunk.content) {
          onContent(chunk.content);
          fullContent += chunk.content;
        }
      }
      return fullContent;
    } catch (error) {
      console.error('Code generation failed:', error);
      throw error;
    }
  },

  /**
   * Optimize existing code
   */
  async optimize(code, language, onContent, signal) {
    try {
      let fullContent = '';
      for await (const chunk of secureApi.stream('/optimize', { code, language }, { signal })) {
        if (chunk.content) {
          onContent(chunk.content);
          fullContent += chunk.content;
        }
      }
      return fullContent;
    } catch (error) {
      console.error('Code optimization failed:', error);
      throw error;
    }
  },

  /**
   * Explain code step-by-step
   */
  async explain(code, language, onContent, signal) {
    try {
      let fullContent = '';
      for await (const chunk of secureApi.stream('/explain', { code, language }, { signal })) {
        if (chunk.content) {
          onContent(chunk.content);
          fullContent += chunk.content;
        }
      }
      return fullContent;
    } catch (error) {
      console.error('Code explanation failed:', error);
      throw error;
    }
  },

  /**
   * Check system health
   */
  async checkHealth() {
    return secureApi.get('/health');
  }
};
```

---

## Phase 2: High Priority

### Step 2.1: Implement Token Refresh & Session Management

**Time:** 1.5 hours  
**CVSS Fixed:** 7.1 (Token refresh), 5.1 (Session timeout)

See [hooks/useSecureAuth.js](#hooks-usesecureauth-js) in the provided hardened files.

### Step 2.2: Sanitize User Input

**Time:** 45 minutes  
**CVSS Fixed:** 7.3 (XSS via user input)

Create `src/utils/sanitize.js`:
```javascript
/**
 * Input sanitization utility
 * Removes potentially dangerous characters while preserving display content
 */

export const sanitizeDisplay = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
    .slice(0, 256); // Limit length
};

export const sanitizeJSON = (input) => {
  if (typeof input !== 'object') return null;
  
  try {
    return JSON.parse(JSON.stringify(input));
  } catch {
    return null;
  }
};
```

Update Dashboard.jsx:
```jsx
import { sanitizeDisplay } from '../utils/sanitize';

// Update userLabel generation:
const userLabel = sanitizeDisplay(
  user?.firstName || user?.username || 
  user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Operator'
);
```

### Step 2.3: Update Dependencies

**Time:** 30 minutes  
**CVSS Fixed:** 7.4 (Outdated dependencies)

```bash
# Update to latest stable versions
npm update
npm install @clerk/react@latest vite@latest @monaco-editor/react@latest

# Verify no breaking changes
npm run build
npm run dev
```

---

## Phase 3: Medium Priority

### Step 3.1: Implement Subresource Integrity (SRI)

**Time:** 30 minutes  
**CVSS Fixed:** 6.5 (Missing SRI)

Update `index.html`:
```html
<!-- For modules, use integrity attribute (Vite handles this in build) -->
<!-- In production build, Vite will generate integrity hashes -->
```

Update build script to generate SRI:
```bash
# After npm run build, verify dist/index.html has integrity attributes
```

### Step 3.2: Fix Memory Leaks

**Time:** 1 hour  
**CVSS Fixed:** 4.1 (Memory leaks)

In Dashboard.jsx, optimize the keydown listener dependency array:
```jsx
useEffect(() => {
  const handleKeyDown = (e) => { /* ... */ };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []); // Empty dependency array - only set up once
```

---

## Testing & Validation

### Security Testing Checklist

- [ ] **CSP Enforcement**: Open DevTools, attempt to inject inline script → Should be blocked
- [ ] **HTTPS Redirect**: Force HTTP in production → Should redirect to HTTPS
- [ ] **CSRF Protection**: Send POST request without CSRF token → Should get 403
- [ ] **Rate Limiting**: Send 31 requests in 60 seconds → Should throttle
- [ ] **Token Refresh**: Keep page open for 30 mins → Token should refresh automatically
- [ ] **Session Timeout**: Close browser for 15 mins → Should show re-auth prompt
- [ ] **Security Headers**: Run `curl -I https://voxcode.example.com` → Should show all headers

### Browser Testing

```bash
# Chrome DevTools Console
> localStorage // Should only contain 'theme', no tokens
> sessionStorage // Should only contain CSRF token
```

### Automated Testing

```bash
# Run security audit
npm run audit

# Check for vulnerabilities
npm audit --production

# Test CSP
npm run dev
# Open DevTools > Console, check for CSP violations
```

---

## Deployment Checklist

- [ ] All Phase 1 vulnerabilities fixed
- [ ] Code reviewed by security team
- [ ] Security tests pass (see above)
- [ ] Dependencies updated and audited
- [ ] Environment variables set for production
- [ ] Backend CSRF endpoint implemented
- [ ] Backend HTTPS certificate valid
- [ ] CORS origin configured in backend
- [ ] Monitor production for security events
- [ ] Team trained on new security practices

---

## Rollback Procedure

If issues arise:
```bash
# Revert to last known good commit
git revert <commit-hash>

# Or restore from backup
cp backup/vite.config.js vite.config.js
git checkout -- index.html main.jsx

# Reinstall dependencies
npm ci
```

---

## Support & Questions

Refer to:
- `FRONTEND_SECURITY_AUDIT.md` - Detailed vulnerability descriptions
- `main_hardened.jsx` - Secure entry point example
- `vite.config.hardened.js` - Production-ready Vite config
- `services/api_secure.js` - Secure API client

---

**Implementation Status Tracking**

| Step | Task | Status | Time | Done By |
|------|------|--------|------|---------|
| 1.1 | Implement CSP | ⭕ Pending | 30 min | |
| 1.2 | Add Security Headers | ⭕ Pending | 30 min | |
| 1.3 | HTTPS Enforcement | ⭕ Pending | 15 min | |
| 1.4 | CSRF Protection | ⭕ Pending | 60 min | |
| 1.5 | Update API Calls | ⭕ Pending | 60 min | |
| 2.1 | Token Refresh | ⭕ Pending | 90 min | |
| 2.2 | Input Sanitization | ⭕ Pending | 45 min | |
| 2.3 | Update Dependencies | ⭕ Pending | 30 min | |
| 3.1 | Subresource Integrity | ⭕ Pending | 30 min | |
| 3.2 | Fix Memory Leaks | ⭕ Pending | 60 min | |

---

**Next Steps:**
1. Review this document with team
2. Create implementation tickets
3. Assign owners to each phase
4. Track progress above
5. Re-audit after Phase 1

Total Estimated Time: 6-8 hours (distributed across team members)
