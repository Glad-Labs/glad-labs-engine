# Quick Fix Guide - Oversight Hub Integration Issues

**Purpose:** Step-by-step fixes for identified integration issues  
**Estimated Time:** 2-3 hours  
**Difficulty:** Easy to Medium

---

## 🔧 Fix 1: Replace Hardcoded URLs in CreateTaskModal

**File:** `web/oversight-hub/src/components/tasks/CreateTaskModal.jsx`

**Issue:** Uses hardcoded `fetch()` instead of API client

**Change:**

```jsx
// ❌ BEFORE (Line ~234-245)
response = await fetch('http://localhost:8000/api/content/tasks', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    task_type: 'blog_post',
    topic: contentPayload.topic || '',
    style: contentPayload.style || 'technical',
    tone: contentPayload.tone || 'professional',
    target_length: contentPayload.target_length || 1500,
    tags: contentPayload.tags || [],
    generate_featured_image: true,
    publish_mode: 'draft',
    enhanced: false,
    target_environment: 'production',
  }),
});

// ✅ AFTER
import { createTask } from '../../services/cofounderAgentClient';

// Inside try block:
const result = await createTask({
  task_name: `Blog: ${contentPayload.topic}`,
  topic: contentPayload.topic || '',
  primary_keyword: contentPayload.keyword || '',
  target_audience: contentPayload.audience || '',
  category: 'blog_post',
  metadata: {
    task_type: 'blog_post',
    style: contentPayload.style || 'technical',
    tone: contentPayload.tone || 'professional',
    target_length: contentPayload.target_length || 1500,
    tags: contentPayload.tags || [],
    generate_featured_image: true,
    publish_mode: 'draft',
  },
});
```

**Change:** (Line ~268-280)

```jsx
// ❌ BEFORE
response = await fetch('http://localhost:8000/api/tasks', {
  method: 'POST',
  headers,
  body: JSON.stringify(taskPayload),
});

// ✅ AFTER
const result = await createTask(taskPayload);
```

**Update Response Handling:**

```jsx
// ❌ BEFORE (Line ~293-298)
const result = await response.json();
console.log('✅ Task created successfully:', result);

if (onTaskCreated) {
  onTaskCreated(result);
}

// ✅ AFTER
console.log('✅ Task created successfully:', result);

// Validate response has required fields
if (!result || !result.id) {
  throw new Error('Invalid response: task was created but no ID returned');
}

if (onTaskCreated) {
  onTaskCreated(result);
}
```

**Impact:**

- ✅ Removes hardcoded localhost URL
- ✅ Enables environment variable API_URL
- ✅ Centralizes JWT token injection
- ✅ Adds response validation

---

## 🔧 Fix 2: Remove or Fix /api/tasks/bulk

**File:** `web/oversight-hub/src/components/tasks/TaskManagement.jsx`

**Issue:** Uses non-existent `/api/tasks/bulk` endpoint

**Option A: Remove the bulk endpoint (Simplest)**

```jsx
// ❌ BEFORE (Line ~257)
const response = await fetch('http://localhost:8000/api/tasks/bulk', {
  method: 'POST',
  body: JSON.stringify({ task_ids: selectedTaskIds }),
});

// ✅ AFTER - Remove this entire block if not used
// Or replace with individual fetches:
```

**Option B: Implement with individual calls (Better UX)**

```jsx
// ✅ AFTER - Fetch tasks individually in parallel
import { getTask } from '../../services/cofounderAgentClient';

const getSelectedTasks = async (taskIds) => {
  try {
    const results = await Promise.all(taskIds.map((id) => getTask(id)));
    return results.filter((task) => task !== null);
  } catch (error) {
    console.error('Error fetching selected tasks:', error);
    throw error;
  }
};

// Usage:
const selectedTasks = await getSelectedTasks(selectedTaskIds);
console.log('Fetched tasks:', selectedTasks);
```

**Impact:**

- ✅ Removes call to non-existent endpoint
- ✅ Uses existing API client methods
- ✅ Parallel fetching is fast enough for most cases

---

## 🔧 Fix 3: Remove Unused fetch() in TaskQueueView

**File:** `web/oversight-hub/src/components/tasks/TaskQueueView.jsx`

**Issue:** Fetches tasks but they're passed as props

```jsx
// ❌ BEFORE (Line ~13)
const fetchTasks = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    // Tasks are passed as props, so we don't need to do anything here
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }
};

// ✅ AFTER - Remove entirely, tasks come from props
// The component already receives tasks as props, no fetch needed
useEffect(() => {
  // Component receives tasks via props, no fetching needed
  // Just process them (filter, sort, etc)
  filterTasksByStatus();
}, [tasks, statusFilter]);
```

**Impact:**

- ✅ Removes unused network call
- ✅ Simplifies component logic
- ✅ Improves performance (no unnecessary fetches)

---

## 🔧 Fix 4: Update BlogPostCreator

**File:** `web/oversight-hub/src/components/tasks/BlogPostCreator.jsx`

**Issue:** Uses hardcoded URL

```jsx
// ❌ BEFORE (Line ~75)
const response = await fetch('http://localhost:8000/api/content/tasks', {
  method: 'POST',
  body: JSON.stringify({
    // ...
  }),
});

// ✅ AFTER
import { createTask } from '../../services/cofounderAgentClient';

const response = await createTask({
  task_name: `Blog: ${title}`,
  topic: title,
  primary_keyword: keyword,
  target_audience: audience,
  category: 'blog_post',
  metadata: {
    task_type: 'blog_post',
    // ... other metadata
  },
});
```

**Impact:**

- ✅ Consistent with other components
- ✅ Uses centralized API client
- ✅ Proper token injection

---

## 🔧 Fix 5: Add Environment Variable Configuration

**File:** `.env.example` and `.env.local`

```bash
# .env.example
REACT_APP_API_URL=http://localhost:8000

# .env.local (development)
REACT_APP_API_URL=http://localhost:8000

# vercel.json or deployment config (production)
REACT_APP_API_URL=https://api.glad-labs.com
```

**Verify in cofounderAgentClient.js:**

```javascript
// This should already be there:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

**Impact:**

- ✅ Environment-specific API URLs
- ✅ No hardcoding in component code
- ✅ Easy to change per deployment

---

## 🧪 Testing Each Fix

### After Fix 1 (CreateTaskModal)

```javascript
// Test in browser console:
1. Go to Create Task Modal
2. Fill form with:
   - Task Type: "Generic Task"
   - Title: "Test Task"
   - Topic: "Testing"
   - Other fields as needed
3. Click Submit
4. Verify in console: No hardcoded URLs in Network tab
5. Verify task appears in list within 2 seconds
```

### After Fix 2 (Bulk endpoint)

```javascript
// Test in browser console:
1. Go to Task Management page
2. Select multiple tasks
3. Verify no 404 errors for /api/tasks/bulk
4. Verify selected tasks are fetched
```

### After Fix 3 (TaskQueueView)

```javascript
// Test in browser console:
1. Open any component using TaskQueueView
2. Check Network tab: no extra /api/tasks fetch
3. Verify tasks display correctly from props
```

### After Fix 4 (BlogPostCreator)

```javascript
// Test blog creation:
1. Open blog creator component
2. Create a blog post
3. Verify in Network tab: Uses consistent API calls
4. Verify task created successfully
```

### After Fix 5 (Environment Variables)

```bash
# Test environment config:
1. Set REACT_APP_API_URL=http://different-url:8000
2. Restart dev server
3. Verify API calls use new URL
4. Verify token injection works
```

---

## ✅ Verification Checklist

After all fixes:

- [ ] No hardcoded `fetch('http://localhost:8000/...')` in components
- [ ] All task creation uses `createTask()` from cofounderAgentClient
- [ ] All task listing uses `getTasks()` from cofounderAgentClient
- [ ] No console 404 errors for non-existent endpoints
- [ ] Response validation checks for task ID
- [ ] Environment variables configured properly
- [ ] Tested task creation flow end-to-end
- [ ] Tested task list loading
- [ ] All API calls include JWT token (check Network tab)
- [ ] No unused fetch calls remaining

---

## 📊 Before/After Comparison

| Aspect               | Before                | After            |
| -------------------- | --------------------- | ---------------- |
| Hardcoded URLs       | 4 locations           | 0                |
| API Client Usage     | 20%                   | 100%             |
| Environment Config   | No                    | Yes              |
| Response Validation  | Missing               | Present          |
| Bulk Operations      | Non-existent endpoint | Individual calls |
| Token Management     | Per component         | Centralized      |
| Code Maintainability | Low                   | High             |

---

## 💡 Benefits of These Fixes

1. **Easier Deployment**
   - Change API URL via environment variable
   - No code changes needed for different environments

2. **Better Security**
   - Centralized token management
   - Consistent JWT injection

3. **Easier Debugging**
   - All API calls go through one place
   - Single point for logging/monitoring
   - Consistent error handling

4. **Better Performance**
   - Removed unused fetch calls
   - Parallel bulk operations

5. **Better Maintainability**
   - Less code duplication
   - Easier to add features (reuse methods)
   - Single source of truth for API methods

---

## 📝 Files to Modify Summary

| File                | Changes                                 | Time       |
| ------------------- | --------------------------------------- | ---------- |
| CreateTaskModal.jsx | Replace 2 fetch() calls, add validation | 30 min     |
| TaskManagement.jsx  | Remove or fix /api/tasks/bulk           | 15 min     |
| TaskQueueView.jsx   | Remove unused fetch()                   | 5 min      |
| BlogPostCreator.jsx | Replace fetch() call                    | 15 min     |
| .env.example        | Add REACT_APP_API_URL                   | 5 min      |
| **Total**           |                                         | **70 min** |

---

## 🚀 Next Steps

1. **Start with Fix 1** (CreateTaskModal - most impactful)
2. **Test after each fix** (don't batch all changes)
3. **Run through testing checklist**
4. **Create PR with changes**
5. **Request code review**
6. **Merge when approved**

---

**Need Help?**

- Check ENDPOINT_AUDIT_REPORT.md for detailed audit
- Check FASTAPI_INTEGRATION_GUIDE.md for API reference
- Check cofounderAgentClient.js for all available methods
- All fixes use existing API client methods (no new code needed)
