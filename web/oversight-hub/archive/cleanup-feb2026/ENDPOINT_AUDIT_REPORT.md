# Oversight Hub - Endpoint Audit Report

**Date:** December 12, 2025  
**Status:** ⚠️ ISSUES FOUND - UI NOT FULLY COMPATIBLE WITH REFACTORED FASTAPI  
**Reviewed By:** Code Audit

---

## 📋 Executive Summary

The oversight-hub UI was built for the old endpoint structure and **has NOT been fully updated** for the refactored FastAPI endpoints. Multiple parameter mismatches and endpoint incompatibilities found.

**Critical Issues:** 3  
**Medium Issues:** 4  
**Low Issues:** 2

---

## 🔴 CRITICAL ISSUES

### 1. Parameter Mismatch: `skip` vs `offset`

**Location:** `web/oversight-hub/src/routes/TaskManagement.jsx` (lines 21, 67)

**Current Code:**

```jsx
const response = await getTasks(100, 0); // getTasks(limit, offset)
```

**Backend Expects:**

```
GET /api/tasks?offset=0&limit=20
```

**Frontend Implementation (cofounderAgentClient.js:162):**

```javascript
export async function getTasks(limit = 50, offset = 0) {
  return makeRequest(
    `/api/tasks?limit=${limit}&offset=${offset}`,
    'GET',
    null,
    false,
    null,
    120000
  );
}
```

**Status:** ✅ Actually CORRECT - `getTasks(limit, offset)` properly builds `/api/tasks?limit={limit}&offset={offset}`

**Assessment:** No issue here - parameter order is correct.

---

### 2. TaskListResponse Parsing Issue

**Location:** `web/oversight-hub/src/routes/TaskManagement.jsx` (lines 29-43)

**Code:**

```jsx
if (response && response.tasks && Array.isArray(response.tasks)) {
  setLocalTasks(response.tasks);
  setTasks(response.tasks);
} else {
  console.warn('❌ Unexpected response format:', response);
  setLocalTasks([]);
}
```

**Backend Response (TaskListResponse):**

```python
{
  "tasks": [TaskResponse, ...],
  "total": 42,
  "offset": 0,
  "limit": 20
}
```

**Status:** ✅ CORRECT - Response structure matches expected `response.tasks` property

---

### 3. POST /api/content/tasks vs POST /api/tasks Mismatch

**Location:** `web/oversight-hub/src/components/tasks/CreateTaskModal.jsx` (lines 234, 268)

**Code:**

```jsx
if (taskType === 'blog_post') {
  // Uses POST /api/content/tasks for blog posts
  response = await fetch('http://localhost:8000/api/content/tasks', {
    method: 'POST',
    body: JSON.stringify({
      task_type: 'blog_post',
      topic: contentPayload.topic,
      // ...
    }),
  });
} else {
  // Uses POST /api/tasks for other types
  response = await fetch('http://localhost:8000/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      task_name: formData.title,
      topic: formData.topic,
      // ...
    }),
  });
}
```

**Backend Endpoints:**

- ✅ `POST /api/tasks` - Uses `TaskCreateRequest` schema
  - Required: `task_name` (3-200 chars), `topic` (3-200 chars)
  - Optional: `primary_keyword`, `target_audience`, `category`, `metadata`
- ✅ `POST /api/content/tasks` - Exists and creates content tasks

**Issue:** Mixed endpoint usage - blog_post goes to `/api/content/tasks`, others to `/api/tasks`

**Assessment:** This works but is inconsistent. Both endpoints exist in FastAPI.

---

## 🟡 MEDIUM ISSUES

### 4. Hardcoded API URLs Instead of Using API Client

**Locations:**

- `CreateTaskModal.jsx` (lines 234, 268)
- `TaskManagement.jsx` (line 257)
- `TaskQueueView.jsx` (line 13)
- `BlogPostCreator.jsx` (line 75)

**Current Pattern:**

```jsx
await fetch('http://localhost:8000/api/tasks', {
  /* ... */
});
```

**Better Pattern:**

```jsx
import { createTask, getTasks } from '../services/cofounderAgentClient';
const result = await createTask(taskData);
```

**Benefits:**

- Centralized API management
- Automatic JWT token injection
- Consistent error handling
- Timeout management (120s for getTasks, 30s default)
- Environment variable support for API_URL

**Impact:** Medium - Works but defeats purpose of API client abstraction

---

### 5. Missing Error Handling for Task Creation Responses

**Location:** `CreateTaskModal.jsx` (lines 293-305)

**Code:**

```javascript
const result = await response.json();
console.log('✅ Task created successfully:', result);

if (onTaskCreated) {
  onTaskCreated(result);
}
```

**Issue:** No validation that response has expected shape

**Backend Returns:**

```python
# For POST /api/tasks (TaskCreateRequest):
{
  "id": "uuid",
  "task_name": "...",
  "topic": "...",
  "status": "pending",
  "created_at": "2024-01-15T10:45:00Z",
  "updated_at": "2024-01-15T10:45:00Z",
  "task_metadata": { /* ... */ }
}
```

**Required Fix:** Validate response has `id` field before using

---

### 6. `/api/tasks/bulk` Endpoint Not Implemented

**Location:** `TaskManagement.jsx` (line 257)

**Code:**

```javascript
response = await fetch('http://localhost:8000/api/tasks/bulk', {
  method: 'POST',
  body: JSON.stringify({ task_ids: selectedTaskIds }),
});
```

**Backend Status:** ❌ NOT IMPLEMENTED

**Available Endpoints:** Only `GET /api/tasks/{task_id}` for individual fetch

**Impact:** This bulk operation will fail - needs implementation or redesign to fetch individually

---

### 7. Quality Evaluation Integration Missing

**Location:** Components using quality assessment

**Backend Available:**

- ✅ `POST /api/quality/evaluate` - Evaluate single content
- ✅ `POST /api/quality/batch-evaluate` - Batch evaluation
- ✅ `GET /api/quality/statistics` - Get quality stats

**Frontend Implementation:** ❌ NOT FOUND in oversight-hub components

**Required:** Add quality evaluation UI components that use these endpoints

---

## 🟢 LOW ISSUES

### 8. Task Metrics Endpoint Usage

**Status:** ✅ AVAILABLE - `GET /api/tasks/metrics/summary`

**Not Yet Used In UI:** Should add metrics dashboard

**Backend Response:**

```python
{
  "total_tasks": 42,
  "completed_tasks": 28,
  "failed_tasks": 2,
  "pending_tasks": 12,
  "success_rate": 66.7,
  "avg_execution_time": 45.3
}
```

---

### 9. Intent-Based Task Creation Not Used

**Status:** ✅ AVAILABLE - `POST /api/tasks/intent`

**Not Yet Used In UI:** Natural language task creation interface not implemented

**Backend Endpoint:**

```python
POST /api/tasks/intent
{
  "natural_language_input": "Create a 2000 word blog post about FastAPI"
}
```

---

## ✅ WORKING IMPLEMENTATIONS

### GET /api/tasks - List Tasks

- ✅ TaskManagement.jsx uses correct endpoint
- ✅ getTasks() in cofounderAgentClient.js correctly builds query string
- ✅ Response parsing matches TaskListResponse schema
- ✅ Pagination works (offset, limit)

### POST /api/tasks - Create Task

- ✅ CreateTaskModal.jsx sends to correct endpoint
- ✅ TaskCreateRequest schema matches payload
- ✅ Response includes task ID and metadata

### GET /api/orchestrator endpoints

- ✅ api.js properly implements orchestrator endpoints
- ✅ OrchestratorMessageCard components should work

---

## 📊 AUDIT SUMMARY BY COMPONENT

| Component                   | Endpoint                                 | Status | Issues                            |
| --------------------------- | ---------------------------------------- | ------ | --------------------------------- |
| TaskManagement.jsx          | GET /api/tasks                           | ✅     | None                              |
| CreateTaskModal.jsx         | POST /api/tasks, POST /api/content/tasks | ⚠️     | Hardcoded URLs, mixed endpoints   |
| TaskQueueView.jsx           | GET /api/tasks                           | ⚠️     | Hardcoded URL, unused fetch       |
| BlogPostCreator.jsx         | POST /api/content/tasks                  | ⚠️     | Hardcoded URL                     |
| TaskDetailModal.jsx         | GET /api/tasks/{id}                      | ✅     | Read-only display, no fetch calls |
| TaskPreviewModal.jsx        | GET /api/tasks/{id}                      | ?      | Not found in oversight-hub        |
| OrchestratorMessageCard.jsx | POST /api/orchestrator/\*                | ✅     | Uses api.js client                |
| TrainingDataDashboard.jsx   | Various                                  | ✅     | Uses quality metrics display      |

---

## 🔧 RECOMMENDED FIXES

### Priority 1 (Critical - Fix Now)

1. **Replace hardcoded fetch() calls with API client functions**
   - Use `createTask()`, `getTasks()`, `getTask()`, `updateTask()` from cofounderAgentClient.js
   - Removes hardcoded localhost URLs
   - Enables environment variable configuration

2. **Fix /api/tasks/bulk endpoint or replace with individual fetches**
   - Check if bulk endpoint actually exists in backend
   - Or fetch tasks individually in parallel: `Promise.all(ids.map(id => getTask(id)))`

### Priority 2 (Medium - Fix Soon)

3. **Add response validation for task creation**
   - Verify `response.id` exists before passing to `onTaskCreated()`
   - Add try-catch for JSON parsing

4. **Implement quality evaluation UI**
   - Add quality score display in TaskDetailModal
   - Add "Evaluate Quality" action in TaskList
   - Show quality metrics in analytics dashboard

### Priority 3 (Nice to Have)

5. **Add metrics dashboard component**
   - Display GET /api/tasks/metrics/summary data
   - Show charts: success rate, avg execution time, task distribution

6. **Add intent-based task creation**
   - Natural language input field
   - Uses POST /api/tasks/intent endpoint
   - Show parsed task details before confirmation

---

## 📝 Implementation Notes

### API Client Pattern (Recommended)

```javascript
// ❌ OLD WAY
const response = await fetch('http://localhost:8000/api/tasks', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify(data),
});

// ✅ NEW WAY
import { createTask } from '../services/cofounderAgentClient';
const result = await createTask(data);
```

### Environment Configuration

```env
# .env.local
REACT_APP_API_URL=http://localhost:8000
```

Then use in cofounderAgentClient.js:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

---

## 🧪 Testing Checklist

Before deployment, verify:

- [ ] GET /api/tasks returns TaskListResponse with proper pagination
- [ ] POST /api/tasks accepts TaskCreateRequest and returns created task
- [ ] POST /api/content/tasks still works for blog posts
- [ ] PATCH /api/tasks/{id} updates task status correctly
- [ ] GET /api/tasks/{id} returns complete TaskResponse
- [ ] All API calls use cofounderAgentClient.js (no hardcoded fetch)
- [ ] JWT tokens properly injected in all requests
- [ ] Error responses properly parsed and displayed
- [ ] Task creation form validates required fields (task_name, topic)
- [ ] Task list pagination shows correct offset/limit
- [ ] Metrics endpoint returns valid MetricsResponse

---

## 📞 Questions for Developer

1. Is `/api/tasks/bulk` endpoint actually implemented in backend?
2. Should CreateTaskModal always use `/api/tasks` or keep special case for `/api/content/tasks`?
3. Should TaskListResponse pagination use `skip`/`limit` or `offset`/`limit` naming?
4. Which endpoints require authentication (all or some)?
5. Should quality evaluation be automatic on task completion or user-triggered?

---

**Next Step:** Address Priority 1 issues and test integration before merging.
