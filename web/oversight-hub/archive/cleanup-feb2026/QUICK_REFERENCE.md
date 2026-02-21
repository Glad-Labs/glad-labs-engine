# Quick Reference - Oversight Hub Refactoring Cheat Sheet

**Print this or save to your desk!**

---

## 🎯 Key File Locations (Phase 1-3)

### Services (New - Use These!)
```
src/services/settingsService.js            ← Settings API wrapper
src/services/errorLoggingService.js        ← Error logging (Sentry + backend)
src/services/responseValidationSchemas.js  ← API response validation (11 validators)
src/services/cofounderAgentClient.js       ← Centralized HTTP client (UPDATED)
```

### Components (Modified)
```
src/components/Settings.jsx                 ← Now API-backed (Phase 1)
src/components/CostMetricsDashboard.jsx     ← Removed mock, added validation (Phase 1-2)
src/components/ErrorBoundary.jsx            ← Centralized error logging (Phase 2)
src/components/TaskDetailModal.jsx          ← Uses cofounderAgentClient (Phase 2)
```

### Tests (New - 66+ tests)
```
src/services/__tests__/responseValidationSchemas.test.js  (35+ tests)
src/services/__tests__/errorLoggingService.test.js        (15+ tests)
src/services/__tests__/settingsService.test.js            (16+ tests)
```

### Archived Components (Available if Needed)
```
src/components/archive/WritingSampleUpload.20260210.jsx
src/components/archive/WritingSampleLibrary.20260210.jsx
```

---

## 📐 API Patterns (Use 100% of the Time)

### Pattern #1: Make API Call with Validation ✅

```javascript
import { cofounderAgentClient } from '../services/cofounderAgentClient';
import { validateCostMetrics, safeValidate } from '../services/responseValidationSchemas';

const metrics = await cofounderAgentClient.makeRequest('/api/cost-metrics', 'GET');
const validated = safeValidate(validateCostMetrics, metrics);
if (!validated) throw new Error('Invalid metrics');

// Use validated safely
```

### Pattern #2: Log Errors with Context ✅

```javascript
import { logError } from '../services/errorLoggingService';

try {
  // Something that fails
} catch (error) {
  await logError(error, {
    feature: 'image-generation',
    taskId: task.id,
    severity: 'critical'
  });
  // Show user message
}
```

### Pattern #3: Settings CRUD ✅

```javascript
import { listSettings, createOrUpdateSetting, getSetting, deleteSetting } from '../services/settingsService';

// Get all
const settings = await listSettings();

// Get specific
const theme = await getSetting('theme');

// Update (booleans auto-stringified)
await createOrUpdateSetting('auto_refresh', true);  // Stored as "true"

// Delete
await deleteSetting('theme');
```

### Pattern #4: Generate Task Image ✅

```javascript
import { generateTaskImage } from '../services/cofounderAgentClient';
import { validateGeneratedImage, safeValidate } from '../services/responseValidationSchemas';

const result = await generateTaskImage(taskId, {
  source: 'openai',
  topic: task.topic,
  content_summary: summary
});

const validated = safeValidate(validateGeneratedImage, result);
```

---

## ❌ Anti-Patterns (NEVER Do This)

```javascript
// ❌ DON'T: Direct fetch()
const response = await fetch('/api/endpoint', { ... });

// ✅ DO: Use cofounderAgentClient
import { cofounderAgentClient } from '../services/cofounderAgentClient';
await cofounderAgentClient.makeRequest('/api/endpoint', 'GET');


// ❌ DON'T: Assume API response
const cost = response.total_cost || 0;

// ✅ DO: Validate first
const validated = safeValidate(validateCostMetrics, response);
if (!validated) throw new Error('Invalid response');


// ❌ DON'T: Silent errors
try { await something(); } catch (e) { console.log(e); }

// ✅ DO: Log and notify user
try { 
  await something(); 
} catch (e) {
  await logError(e, { feature: 'xyz' });
  setError(e.message);
}


// ❌ DON'T: Direct localStorage for settings
const theme = localStorage.getItem('theme');

// ✅ DO: Use settingsService
const theme = await settingsService.getSetting('theme');
```

---

## 🔍 Validators Available

```javascript
import {
  validateCostMetrics,      // { total_cost, avg_cost, total_tasks }
  validateCostsByPhase,     // { phases: {name: cost}, total }
  validateCostsByModel,     // { models: {name: cost}, total }
  validateCostHistory,      // { daily_data: [{date, cost}] }
  validateBudgetStatus,     // { monthly_budget, spent, percent_used }
  validateTask,             // { id, topic, status, created_at }
  validateTaskList,         // { tasks: [...], total, page }
  validateSettings,         // { theme, notifications, ... }
  validateGeneratedImage,   // { image_url, source, generated_at }
  safeValidate              // Universal: (validator, data) → data | null
} from '../services/responseValidationSchemas';
```

---

## 🧪 Running Tests

```bash
# All tests
npm test

# One test file
npm test -- settingsService.test.js

# With coverage
npm test -- --coverage

# Watch mode (auto-rerun)
npm test -- --watch

# Specific test case
npm test -- --testNamePattern="validateCostMetrics"
```

---

## 🚀 Build & Deploy

```bash
# Development
npm start             # Starts on port 3001

# Testing
npm test              # Run test suite
npm run coverage      # Generate coverage report

# Production
npm run build         # Optimized build
npm run build:analyze # View bundle composition

# CI/CD (GitHub Actions)
# Runs automatically on PR and merge
```

---

## 🔧 Settings API Endpoints

| Method | Endpoint | Service Function |
|--------|----------|------------------|
| GET | `/api/settings` | `listSettings()` |
| GET | `/api/settings/{key}` | `getSetting(key)` |
| POST | `/api/settings` | `createOrUpdateSetting(key, value)` |
| DELETE | `/api/settings/{key}` | `deleteSetting(key)` |
| POST | `/api/settings/bulk` | `bulkUpdateSettings(settings)` |

---

## 📊 Cost Metrics API Endpoints

| Endpoint | Response Type | Usage |
|----------|---------------|-------|
| `/api/cost-metrics` | Cost summary | `validateCostMetrics` |
| `/api/cost-metrics/by-phase` | Phase breakdown | `validateCostsByPhase` |
| `/api/cost-metrics/by-model` | Model breakdown | `validateCostsByModel` |
| `/api/cost-metrics/history` | Historical data | `validateCostHistory` |
| `/api/cost-metrics/budget` | Budget status | `validateBudgetStatus` |

---

## 🎭 Error Types & Severity

```javascript
// Log errors with severity
await logError(error, {
  feature: 'cost-dashboard',
  severity: 'critical'    // critical | high | medium | low
});

// Common error contexts:
{
  feature: 'image-generation',     // What broke?
  taskId: 'task-001',              // What was being worked on?
  userId: 'user-123',              // Who was affected?
  action: 'upload-settings',       // What action caused it?
  apiEndpoint: '/api/settings',    // Which API?
  statusCode: 500                  // HTTP status if applicable
}
```

---

## 📱 Auth & Headers (Automatic!)

```javascript
// ✅ Automatic - cofounderAgentClient handles this:
// - Reads token from localStorage.getItem('auth_token')
// - Adds 'Authorization: Bearer {token}' header
// - Refreshes token if expired
// 
// ❌ Don't do manual:
// const token = localStorage.getItem('auth_token');
// headers['Authorization'] = `Bearer ${token}`;
```

---

## 🐛 Debugging Tips

### Check if API client is being used
```bash
grep -r "fetch(" src/ --include="*.jsx" | grep -v test | grep -v node_modules
# Should return EMPTY (no results)
```

### Check API response validation
```bash
# In browser console during API call:
window.__lastResponse = response;  // Save it
window.__lastValidation = safeValidate(validator, response);  // Validate

// If validation fails, check response structure matches docs
```

### Test API endpoints directly
```bash
# Settings
curl http://localhost:8000/api/settings -H "Authorization: Bearer test_token"

# Cost metrics
curl http://localhost:8000/api/cost-metrics -H "Authorization: Bearer test_token"

# Error logging
curl -X POST http://localhost:8000/api/errors \
  -H "Content-Type: application/json" -H "Authorization: Bearer test_token" \
  -d '{"type":"test","message":"test","severity":"low"}'
```

### View backend logs
```bash
# If running locally with npm run dev:cofounder
# Logs appear in same terminal
# Look for: [Uvicorn], [ERROR], [INFO]

# If using tmux/screen, check each pane
# Backend: port 8000
# Frontend: port 3001 (React)
```

---

## 📚 Full Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| REFACTORING_SUMMARY.md | What changed in Phases 1-3 | Same folder |
| MIGRATION_GUIDE.md | Archived components restoration | Same folder |
| API_CONTRACTS_REFERENCE.md | Complete API documentation | Same folder |
| POST_REFACTORING_VALIDATION.md | Validation checklist | Same folder |
| This cheat sheet | Quick reference | Same folder |

---

## ⚡ Common Tasks

### Replace old fetch() with client
```javascript
// BEFORE:
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(data)
});
const json = await response.json();

// AFTER:
import { cofounderAgentClient } from '../services/cofounderAgentClient';
const json = await cofounderAgentClient.makeRequest('/api/endpoint', 'POST', data);
```

### Add validation to component
```javascript
import { validateXxx, safeValidate } from '../services/responseValidationSchemas';

// In your component:
const data = await fetchData();
const validated = safeValidate(validateXxx, data);
if (!validated) {
  setError('Data validation failed');
  return;
}
setData(validated);
```

### Log error from component
```javascript
import { logError } from '../services/errorLoggingService';

try {
  // Component code
} catch (error) {
  await logError(error, {
    feature: 'my-feature',
    componentName: 'MyComponent',
    severity: 'high'
  });
  setErrorMessage(error.message);
}
```

---

## 🎓 Learning Path

1. **Day 1:** Read REFACTORING_SUMMARY.md (high-level overview)
2. **Day 2:** Study API_CONTRACTS_REFERENCE.md (endpoint details)
3. **Day 3:** Review test files in `__tests__/` (implementation examples)
4. **Day 4:** Add new API calls using patterns from tests
5. **Day 5+:** Contribute improvements and file issues

---

## ✅ Validation Checklist Before Commit

- [ ] `npm test` - All tests passing?
- [ ] `npm run build` - Build successful, 0 errors?
- [ ] Changed files use `cofounderAgentClient` for HTTP?
- [ ] Added validation for API responses?
- [ ] Added error handling with `logError`?
- [ ] No direct `fetch()` calls?
- [ ] No hardcoded URLs?
- [ ] No console.error (use logError)?
- [ ] Tests added for new code?
- [ ] Documentation updated?

---

## 🆘 Getting Help

**Quick Questions?** → Check API_CONTRACTS_REFERENCE.md  
**How to restore archived code?** → Check MIGRATION_GUIDE.md  
**What changed in the refactor?** → Check REFACTORING_SUMMARY.md  
**Is everything working?** → Run POST_REFACTORING_VALIDATION.md  
**Creating new API integration?** → Copy patterns from test files  

**Stuck?** → `git log --oneline | head -20` to see recent commits  

---

## 📞 Quick Contact

| Question | Resource |
|----------|----------|
| API format/contracts | API_CONTRACTS_REFERENCE.md |
| What's new? | REFACTORING_SUMMARY.md |
| How to write tests | See `__tests__/*.test.js` files |
| Validation failed | Add `console.log(data)` before safeValidate |
| Auth not working | Check `localStorage.getItem('auth_token')` |
| Settings not persisting | Verify `/api/settings` returns 200 |

---

**Last Updated:** February 10, 2026  
**Version:** 1.0 - Post Phase-3 Complete  
**Print & Share!** 📋
