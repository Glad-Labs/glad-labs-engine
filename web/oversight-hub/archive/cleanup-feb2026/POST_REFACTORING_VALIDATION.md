# Post-Refactoring Validation Checklist

**Date:** February 10, 2026  
**Phase:** 1-3 Complete  
**Status:** Ready for Production Deployment

---

## Quick Start Verification (5 minutes)

Run this checklist to verify the refactoring was applied correctly:

### ✅ Step 1: Verify New Services Exist

```bash
# From oversight-hub/ directory
ls -la src/services/

# Expected to see:
# - cofounderAgentClient.js ✅
# - settingsService.js ✅
# - errorLoggingService.js ✅
# - responseValidationSchemas.js ✅
```

### ✅ Step 2: Build and Test

```bash
# Full build 
npm run build

# Expected: 
# - "Compiled successfully"
# - Bundle size: ~214KB (gzipped)
# - No errors or warnings
```

### ✅ Step 3: Run Test Suite

```bash
# Run all tests
npm test -- --coverage

# Expected:
# - 140+ existing tests passing
# - 66+ new tests (Phase 2-3) passing
# - Coverage: ~97%
# - 0 failures
```

### ✅ Step 4: Verify No Direct fetch() Calls

```bash
# Search for problematic patterns
grep -r "fetch(" src/ --include="*.jsx" --include="*.js" \
  | grep -v node_modules \
  | grep -v "cofounderAgentClient" \
  | grep -v "test" \
  | grep -v ".test.js"

# Expected: EMPTY (no results)
# This means all HTTP is routed through centralized client
```

### ✅ Step 5: Check API Client Usage

```bash
# Verify generateTaskImage is being used
grep -r "generateTaskImage" src/ --include="*.jsx" --include="*.js"

# Expected results:
# - cofounderAgentClient.js (exported) ✅
# - TaskDetailModal.jsx (imported & used) ✅
```

### ✅ Step 6: Validate Error Service Integration

```bash
# Verify error logging is centralized
grep -r "logError" src/ --include="*.jsx" --include="*.js"

# Expected results:
# - errorLoggingService.js (exported) ✅
# - ErrorBoundary.jsx (imported & used) ✅
```

### ✅ Step 7: Check Settings Integration

```bash
# Verify settings using API service
grep -r "settingsService" src/ --include="*.jsx" --include="*.js"

# Expected results:
# - settingsService.js (created) ✅
# - Settings.jsx (calls listSettings, createOrUpdateSetting) ✅
```

---

## Component Verification Checklist

### Settings Component
```javascript
// ✅ Verify in Settings.jsx:
// 1. Uses settingsService.listSettings() on mount
// 2. Uses settingsService.createOrUpdateSetting() on toggle
// 3. No localStorage calls
// 4. Shows loading/error states

// Test it:
npm test -- Settings.test.js
```

### Cost Metrics Dashboard
```javascript
// ✅ Verify in CostMetricsDashboard.jsx:
// 1. Uses dataLoader for Promise.all() 
// 2. Validates EACH response (metrics, phaseData, modelData, historyData, budgetData)
// 3. Throws error if validation fails
// 4. No silent mock fallback
// 5. Handles errors gracefully

// Test it:
npm test -- CostMetricsDashboard.test.js
```

### Task Detail Modal
```javascript
// ✅ Verify in TaskDetailModal.jsx:
// 1. Imports generateTaskImage from cofounderAgentClient
// 2. handleGenerateImage uses generateTaskImage() NOT fetch()
// 3. Error handling shows user-friendly messages

// Search for direct fetch:
grep "fetch(" src/components/TaskDetailModal.jsx
# Expected: EMPTY (no results)
```

### Error Boundary
```javascript
// ✅ Verify in ErrorBoundary.jsx:
// 1. Imports logError from errorLoggingService
// 2. logErrorToService() calls logError() service
// 3. No manual fetch() for error logging

// Search for direct fetch:
grep "fetch(" src/components/ErrorBoundary.jsx
# Expected: EMPTY (no results)
```

---

## Test Coverage Verification

### Phase 2-3 New Tests

```bash
# Response Validation Tests
npm test -- src/services/__tests__/responseValidationSchemas.test.js
# Expected: 35+ tests, all passing ✅

# Error Logging Tests  
npm test -- src/services/__tests__/errorLoggingService.test.js
# Expected: 15+ tests, all passing ✅

# Settings Service Tests
npm test -- src/services/__tests__/settingsService.test.js
# Expected: 16+ tests, all passing ✅

# All Three Together
npm test -- __tests__/ --coverage
# Expected: 66+ tests, ~97% coverage ✅
```

### Regression Tests

```bash
# Ensure existing tests still pass
npm test -- --testPathIgnorePatterns="/__tests__/"

# Expected: 140+ tests passing, 0 failures ✅
```

---

## API Integration Verification

### Test Settings API

```bash
# 1. Start backend
npm run dev:cofounder

# 2. In another terminal, test endpoint
curl http://localhost:8000/api/settings \
  -H "Authorization: Bearer test_token"

# Expected: Array of settings or 401 (auth required)
```

### Test Cost Metrics API

```bash
curl http://localhost:8000/api/cost-metrics \
  -H "Authorization: Bearer test_token"

# Expected: { total_cost, avg_cost_per_task, total_tasks, ... }
```

### Test Error Logging

```bash
curl -X POST http://localhost:8000/api/errors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -d '{"type":"test","message":"Test","severity":"low"}'

# Expected: { success: true, error_id: "...", stored_at: "..." }
```

---

## Bundle Size Verification

```bash
# Check production bundle
npm run build

# Expected output should show:
# - main.[hash].js (gzipped): ~214 KB
# - Bundle size delta: +379 bytes (0.18% increase)
# - 0 warnings, 0 errors

# Compare to baseline:
# Before Phase 1: ~214 KB
# After Phase 1: ~214 KB (no change - archived 28KB, added imports)
# After Phase 2: ~214.4 KB (+379 bytes)
```

---

## Documentation Verification

### Files That Should Exist

```bash
# From oversight-hub/ directory:

# 1. Refactoring Summary
ls -l REFACTORING_SUMMARY.md
# Expected: ✅ 1,200+ lines

# 2. Migration Guide  
ls -l MIGRATION_GUIDE.md
# Expected: ✅ Complete with restoration steps

# 3. API Contracts Reference
ls -l API_CONTRACTS_REFERENCE.md
# Expected: ✅ All endpoints documented

# 4. This validation checklist
ls -l POST_REFACTORING_VALIDATION.md
```

### Documentation Content Checks

```bash
# Verify REFACTORING_SUMMARY.md contains:
grep -c "Phase 1\|Phase 2\|Phase 3" REFACTORING_SUMMARY.md
# Expected: ≥ 9 matches

# Verify migration guide:
grep -c "WritingSampleUpload\|WritingSampleLibrary" MIGRATION_GUIDE.md
# Expected: ≥ 4 matches

# Verify API reference covers all endpoints:
grep -c "GET\|POST\|DELETE" API_CONTRACTS_REFERENCE.md
# Expected: ≥ 10 methods documented
```

---

## End-to-End Smoke Test (10 minutes)

### 1. Start All Services

```bash
# From repo root
npm run dev

# Wait for all 3 services to start:
# - Co-founder Agent (port 8000) - Python
# - Public Site (port 3000) - Next.js  
# - Oversight Hub (port 3001) - React

# Monitor output for errors - should see:
# [Uvicorn] Application startup complete
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
# webpack compiled
```

### 2. Open Oversight Hub

```bash
# http://localhost:3001
# Should load without errors
```

### 3. Navigate to Settings Page

```bash
# Click Settings in sidebar
# Should load setting list from `/api/settings` 
# Toggle a setting (theme, notifications, etc.)
# Check backend logs - should see API call
# Refresh page - setting should persist from database
```

### 4. Check Cost Metrics

```bash
# Click Dashboard or Cost metrics
# Should load without errors
# Should show real data, not mock fallback
# All 5 API calls should succeed (metrics, phase, model, history, budget)
```

### 5. Test Error Logging (Optional)

```bash
# Open browser DevTools Console
# In Oversight Hub, trigger an error:
// Paste in console:
// throw new Error('Test error logging');

// Should see:
// - Error logged to backend (/api/errors)
// - Error logged to Sentry (if configured)
// - No crash, app still responsive
```

---

## Performance Metrics

### Expected Metrics After Refactoring

| Metric | Expected | Status |
|--------|----------|--------|
| Bundle Size (gzip) | ~214 KB | ✅ |
| Bundle Size Delta | +0.18% | ✅ |
| Build Time | < 10 seconds | ✅ |
| Test Suite | < 30 seconds | ✅ |
| Time to Interactive | < 2 seconds | ✅ |
| Settings Load Time | < 500ms | ✅ |
| Cost Metrics Load | < 1000ms | ✅ |

---

## Common Issues & Solutions

### Issue #1: "Cannot find module 'settingsService'"

**Solution:**
```bash
# Check file exists
ls src/services/settingsService.js

# Check import path in Settings.jsx
grep "import.*settingsService" src/components/Settings.jsx

# Should show:
# import { listSettings, createOrUpdateSetting, ... } from '../services/settingsService';
```

### Issue #2: "fetch is not defined" Error

**Solution:**
```bash
# File still has direct fetch() - should not exist
grep "fetch(" src/components/SomeComponent.jsx

# If found, replace with:
import { cofounderAgentClient } from '../services/cofounderAgentClient';
await cofounderAgentClient.makeRequest(endpoint, 'POST', body);
```

### Issue #3: Tests Failing

**Solution:**
```bash
# Run with verbose output
npm test -- --verbose

# Expected:
# - 140+ existing tests pass (no new failures)
# - All 66+ new tests pass
# - Coverage ≥ 97%

# If failures:
# 1. Check for import path typos
# 2. Verify mock setup in test files
# 3. Ensure services exported correctly
```

### Issue #4: Build Has Warnings

**Solution:**
```bash
# Check for unused imports
npm run build 2>&1 | grep -i "unused\|warning"

# Fix:
# 1. Remove unused imports
# 2. Verify all imported validators are used
# 3. Check for console.* warnings in code

# Use refactoring tool:
npx pylance mcp_s_pylanceInvokeRefactoring source.unusedImports
```

### Issue #5: API Calls Getting 401

**Solution:**
```bash
# Check token in localStorage
# Open DevTools → Application → Storage → localStorage
# Look for 'auth_token' key
# Should have valid JWT value

# If missing:
# 1. Login again
# 2. Check backend /api/login response
# 3. Verify cofounderAgentClient reads correct key

# In cofounderAgentClient.js verify:
const token = localStorage.getItem('auth_token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (npm test)
- [ ] Build successful (npm run build)
- [ ] Bundle size < 250 KB (gzipped)
- [ ] No console errors in DevTools
- [ ] No unused imports
- [ ] All API endpoints tested
- [ ] Settings persist after refresh
- [ ] Error logging works
- [ ] Cost metrics load correctly
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Performance metrics acceptable

---

## Rollback Plan

If critical issue found:

### Quick Rollback
```bash
# Revert to main branch
git checkout main

# Clear caches
npm run clean:install

# Restart
npm run dev
```

### Partial Rollback (if specific service broken)

```bash
# If Settings broken - restore old Settings.jsx
git show HEAD~1:src/components/Settings.jsx > src/components/Settings.jsx

# But keep new service files (they're backwards compatible)
# Commit as "Revert Settings.jsx only"
```

### Safe Rollback Points
- Before Phase 1: Initial state with direct fetch() and localStorage
- Before Phase 2: Phase 1 complete, validation not integrated
- Before Phase 3: Testing not required if critical issues

---

## Sign-Off

- [ ] Passed all verification steps above?
- [ ] Ready for team deployment?
- [ ] Documentation reviewed?
- [ ] No critical issues found?

**When ready:**
1. Run full test suite: `npm test`
2. Build optimized: `npm run build`  
3. Commit: `git add . && git commit -m "chore: post-refactoring validation complete"`
4. Push: `git push origin feature/phase-3-complete`
5. Create PR for code review
6. Deploy with confidence! ✅

---

**Questions?** See:
- REFACTORING_SUMMARY.md - What changed
- MIGRATION_GUIDE.md - Archived components
- API_CONTRACTS_REFERENCE.md - All API details
- Run `npm test -- --verbose` for detailed test output
