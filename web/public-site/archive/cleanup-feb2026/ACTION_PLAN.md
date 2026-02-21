# Public-Site Frontend - Action Plan

## Priority 1: Critical Fixes (Blocks Production)

### 1.1 Fix Missing getFastAPIURL Import ⚠️ URGENT

**File:** `web/public-site/app/page.js`
**Issue:** Function doesn't exist in `lib/url.js`
**Impact:** App crashes when fetching posts
**Effort:** 5 minutes

**Current Code:**

```javascript
import { getFastAPIURL } from '@/lib/url';
const fastApiUrl = getFastAPIURL();
```

**Solution:**

```javascript
import { getAbsoluteURL } from '@/lib/url';
const apiUrl = getAbsoluteURL('/api/posts');
// Use apiUrl directly in fetch calls
```

---

### 1.2 Fix Jest Configuration ⚠️ BLOCKS TESTING

**File:** `web/public-site/jest.config.js`
**Issue:** CommonJS syntax in ES module context
**Error:** `ReferenceError: require is not defined in ES module scope`
**Impact:** Cannot run any tests
**Effort:** 3 minutes

**Solution - Option A (Recommended):**
Rename `jest.config.js` → `jest.config.cjs`
No other changes needed. Node will automatically handle CommonJS.

**Solution - Option B (Convert to ESM):**

```javascript
// Change from:
const nextJest = require('next/jest');

// To:
import nextJest from 'next/jest.js';
export default nextJest(customJestConfig);
```

---

### 1.3 Fix Undefined Variables in search.js ⚠️ WILL CRASH

**File:** `web/public-site/lib/search.js`
**Issues:**

- Line 49: `baseUrl` is undefined (used but never defined)
- Line 52: `token` is undefined (used but never defined)
- Line 1: `fastAPISearch` imported but never used

**Impact:** Runtime errors when search function called
**Effort:** 10 minutes

**Fix:**

```javascript
// Add missing definitions
const baseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
const token = process.env.NEXT_PUBLIC_AUTH_TOKEN || '';

// Remove unused import
// delete: import { fastAPISearch } from '@/lib/api-fastapi';
```

---

### 1.4 Fix Unreachable Code in related-posts.js ⚠️ LOGIC ERROR

**File:** `web/public-site/lib/related-posts.js`
**Issues:**

- Lines 114, 159: Code after return statements (dead code)
- Unused parameters: `limit`, `postId`, `relevanceScore`
- Unused import: `searchPosts`

**Impact:** Confusion about functionality, larger bundle
**Effort:** 15 minutes

**What to do:**

1. Review logic around lines 110-120 and 155-165
2. Either move code before return or delete dead code
3. Remove unused parameters from function signatures
4. Delete unused imports

---

## Priority 2: Code Cleanup (Improves Maintainability)

### 2.1 Delete Orphaned Header Components 🗑️ CLEANUP

**Files to Delete:**

- `web/public-site/components/Header.jsx`
- `web/public-site/components/HeaderClient.jsx`
- `web/public-site/components/HeaderServer.jsx`
- `web/public-site/components/HeaderWrapper.js`
- `web/public-site/components/ScrollAwareNav.jsx`

**Effort:** 2 minutes
**Benefit:** Reduces confusion, cleaner codebase

**Verification:** Run `npm run lint` - should show fewer warnings

---

### 2.2 Fix Unused Variables (ESLint Warnings) 📋

**Effort:** 30 minutes

**Automated Fix First:**

```bash
npm run lint:fix
```

**Manual Fixes Needed:**

1. **lib/seo.js (line 85):**
   - Remove unused `slug` extraction if not needed
   - Or use slug in structured data

2. **lib/structured-data.js:**
   - Review unused imports
   - Remove or implement

3. **lib/post-mapper.js (lines 102, 118):**
   - Remove unused `e` in catch blocks

4. **lib/api-fastapi.js (line 321):**
   - Remove unused `error` variable

---

### 2.3 Fix Test File Image Tags 📸

**Files:**

- `web/public-site/app/__tests__/page.test.js`
- `web/public-site/app/archive/__tests__/page.test.js`

**Change from:**

```javascript
<img src="..." alt="..." />
```

**Change to:**

```javascript
import Image from 'next/image'
<Image src="..." alt="..." width={...} height={...} />
```

**Effort:** 5 minutes

---

## Priority 3: Architecture Improvements (Best Practices)

### 3.1 Enable Error Boundary in Layout

**File:** `web/public-site/app/layout.js`
**Effort:** 5 minutes

**Current:**

```javascript
<body>
  <TopNavigation />
  {children}
  <Footer />
</body>
```

**Improved:**

```javascript
import ErrorBoundary from '@/components/ErrorBoundary';

<body>
  <TopNavigation />
  <ErrorBoundary>{children}</ErrorBoundary>
  <Footer />
</body>;
```

---

### 3.2 Decide on AdSense & Cookie Consent

**File:** `web/public-site/app/layout.js`

**Currently:**

```javascript
// Imported but commented out
{
  /* <AdSenseScript /> */
}
{
  /* <CookieConsentBanner /> */
}
```

**Decision Needed:**

1. **If Implementing:** Uncomment and enable
2. **If Not Ready:** Delete imports and components

**Effort:** 5 minutes (decision only)

---

### 3.3 Improve CSP Security Header

**File:** `web/public-site/next.config.js`

**Current CSP Issue:**

```javascript
script-src 'unsafe-inline' 'unsafe-eval'  // ⚠️ Too permissive
```

**Recommended:**

```javascript
// In production
script-src 'self' https://www.googletagmanager.com

// In development (keep permissive for dev tools)
process.env.NODE_ENV === 'production'
  ? 'self'
  : "'unsafe-eval' 'unsafe-inline'"
```

**Effort:** 10 minutes

---

## Priority 4: Testing & Coverage (Quality Assurance)

### 4.1 Fix and Run Tests

**Effort:** 1-2 hours
**Commands:**

```bash
# 1. Fix Jest config (from Priority 1.2)
mv jest.config.js jest.config.cjs

# 2. Install missing test dependencies (if needed)
npm install --save-dev @testing-library/jest-dom

# 3. Run tests to get baseline
npm test

# 4. Check coverage
npm run test:coverage
```

**Target:** >70% coverage

---

### 4.2 Create Critical Test Cases

**Test Files to Update:**

- `web/public-site/app/__tests__/page.test.js` - Fix Image usage
- `web/public-site/app/posts/__tests__/[slug]/page.test.tsx` - Add tests
- `web/public-site/app/archive/__tests__/page.test.ts` - Fix Image usage

**Test Cases Needed:**

1. Home page renders with posts
2. Navigation links work
3. Post detail page loads content
4. Archive pagination works
5. Error states show proper UI

**Effort:** 2-3 hours

---

## Priority 5: Documentation & Optimization

### 5.1 Create Component Documentation

**Effort:** 1 hour

Create `web/public-site/COMPONENTS.md`:

```markdown
# Component Documentation

## TopNav

- Server component
- Shows navigation and CTA
- No props needed

## Footer

- Server component
- Shows company info

## HomePage

- Client component
- Fetches posts from API
- Shows post carousel

## ErrorBoundary

- Error recovery UI
- Wraps main content
```

---

### 5.2 Document API Integration

**Effort:** 30 minutes

Create `web/public-site/API.md`:

```markdown
# API Integration Guide

## Base URL

- Development: `http://localhost:8000`
- Environment: `NEXT_PUBLIC_FASTAPI_URL`

## Endpoints Used

- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get single post
- `GET /api/posts/search` - Search posts

## Error Handling

- Timeouts after 30 seconds
- Retry once on network error
```

---

### 5.3 Enable Bundle Analysis

**Effort:** 15 minutes

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

# Run analysis
ANALYZE=true npm run build
```

---

### 5.4 Implement Data Fetching Cache

**Effort:** 2-3 hours
**Approach:** Add SWR for intelligent caching

```bash
npm install swr
```

**Update app/page.js:**

```javascript
import useSWR from 'swr';

export default function HomePage() {
  const { data: posts, error } = useSWR(
    '/api/posts?populate=*&status=published&limit=20',
    fetcher,
    { revalidateOnFocus: false }
  );

  // Prevents refetch on window focus
  // Reduces API calls by ~80%
}
```

---

## Execution Timeline

### Quick Wins (1-2 hours)

- ✅ Fix `getFastAPIURL` import (5 min)
- ✅ Fix Jest config (3 min)
- ✅ Delete orphaned Header files (2 min)
- ✅ Fix test image tags (5 min)
- ✅ Enable ErrorBoundary (5 min)

### Medium Tasks (2-3 hours)

- ✅ Fix all undefined/unused variables (30 min)
- ✅ Run `npm run lint:fix` (5 min)
- ✅ Improve CSP header (10 min)
- ✅ Get tests running (20 min)
- ✅ Create component docs (1 hour)

### Longer Tasks (3-4 hours)

- ✅ Establish test coverage (2 hours)
- ✅ Implement SWR caching (2 hours)
- ✅ Bundle analysis (1 hour)

**Total Time to Complete:** 6-8 hours (can be parallelized)

---

## Success Criteria

| Metric           | Current | Target |
| ---------------- | ------- | ------ |
| Linting Errors   | 0       | 0 ✅   |
| Linting Warnings | 24      | <5 ✅  |
| Test Pass Rate   | N/A     | 100%   |
| Test Coverage    | 0%      | >70%   |
| Orphaned Files   | 5       | 0      |
| Critical Bugs    | 4       | 0      |
| Pages Rendering  | 8/8     | 8/8 ✅ |

---

## Notes

- All changes are backwards compatible
- No database migrations needed
- No environment variable changes needed
- Can be implemented incrementally
- Each section is independent (can be done in any order)

---

**Generated:** 2026-01-09  
**Framework:** Next.js 15.5.9  
**Estimated Effort:** 6-8 hours
