# Oversight Hub - FastAPI Integration Guide

**Status:** Integration Review Complete  
**Date:** December 12, 2025  
**Endpoints Reviewed:** All major task and quality endpoints

---

## 📌 Quick Status Summary

| Category               | Status       | Notes                                               |
| ---------------------- | ------------ | --------------------------------------------------- |
| **Task List**          | ✅ WORKING   | GET /api/tasks returns proper TaskListResponse      |
| **Task Creation**      | ⚠️ PARTIAL   | Works but uses hardcoded URLs instead of API client |
| **Task Details**       | ✅ WORKING   | Read-only display, no updates required              |
| **Quality Assessment** | ✅ AVAILABLE | Endpoints exist, not used in current UI             |
| **Orchestrator**       | ✅ WORKING   | Uses api.js client correctly                        |
| **API Client**         | ✅ COMPLETE  | cofounderAgentClient.js has all methods             |

---

## ✅ VERIFIED WORKING INTEGRATIONS

### 1. GET /api/tasks - Task List with Pagination

**Backend Endpoint:**

```python
@router.get("", response_model=TaskListResponse)
async def list_tasks(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db_service: DatabaseService = Depends(get_database_dependency)
):
```

**Response Schema:**

```python
class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    offset: int
    limit: int
```

**Frontend Implementation:**

```jsx
// web/oversight-hub/src/routes/TaskManagement.jsx
import { getTasks } from '../services/cofounderAgentClient';

useEffect(() => {
  const fetchTasksWrapper = async () => {
    const response = await getTasks(100, 0); // (limit, offset)
    if (response && response.tasks && Array.isArray(response.tasks)) {
      setLocalTasks(response.tasks);
      setTasks(response.tasks);
    }
  };
  fetchTasksWrapper();
}, []);
```

**API Client Method:**

```javascript
// web/oversight-hub/src/services/cofounderAgentClient.js
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

**Status:** ✅ VERIFIED WORKING - Correct parameter order, proper response handling

---

### 2. POST /api/tasks - Create Generic Task

**Backend Endpoint:**

```python
@router.post("", response_model=Dict[str, Any], status_code=201)
async def create_task(
    task_data: TaskCreateRequest,
    current_user: dict = Depends(get_current_user),
    db_service: DatabaseService = Depends(get_database_dependency),
    background_tasks: BackgroundTasks = None,
):
```

**Request Schema:**

```python
class TaskCreateRequest(BaseModel):
    task_name: str = Field(..., min_length=3, max_length=200)
    topic: str = Field(..., min_length=3, max_length=200)
    primary_keyword: Optional[str] = Field(None, max_length=100)
    target_audience: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field("general")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
```

**Response:**

```python
{
  "id": "uuid-string",
  "task_name": "Blog Post",
  "topic": "FastAPI Best Practices",
  "status": "pending",
  "created_at": "2024-01-15T10:45:00Z",
  "updated_at": "2024-01-15T10:45:00Z",
  "task_metadata": { /* merged fields */ }
}
```

**Frontend Usage (Current - Hardcoded):**

```jsx
// web/oversight-hub/src/components/tasks/CreateTaskModal.jsx
response = await fetch('http://localhost:8000/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    task_name: formData.title,
    topic: formData.topic,
    primary_keyword: formData.primary_keyword,
    target_audience: formData.target_audience,
    category: formData.category,
    metadata: { task_type: taskType, ...formData },
  }),
});

const result = await response.json();
if (onTaskCreated) onTaskCreated(result);
```

**API Client Method (Available but Not Used):**

```javascript
// web/oversight-hub/src/services/cofounderAgentClient.js
export async function createTask(taskData) {
  try {
    const response = await makeRequest(
      `/api/tasks`,
      'POST',
      taskData,
      false,
      null,
      30000
    );
    return response;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}
```

**Recommended Refactor:**

```jsx
// ✅ BETTER APPROACH
import { createTask } from '../services/cofounderAgentClient';

const handleCreateTask = async (taskData) => {
  try {
    const result = await createTask({
      task_name: taskData.title,
      topic: taskData.topic,
      primary_keyword: taskData.primary_keyword,
      target_audience: taskData.target_audience,
      category: taskData.category || 'general',
      metadata: {
        task_type: taskType,
        ...taskData,
      },
    });
    if (onTaskCreated) onTaskCreated(result);
  } catch (error) {
    setError(`Failed to create task: ${error.message}`);
  }
};
```

**Status:** ⚠️ WORKING BUT SHOULD USE API CLIENT

---

### 3. POST /api/content/tasks - Create Content Task

**Backend Endpoint:**

```python
# From content_routes.py (separate from task_routes.py)
@content_router.post(
    "",
    response_model=Dict[str, Any],
    status_code=201,
    summary="Create content generation task"
)
async def create_content_task(
    task_data: CreateBlogPostRequest,  # Specialized schema
    current_user: dict = Depends(get_current_user),
):
```

**Request Schema:**

```python
class CreateBlogPostRequest(BaseModel):
    topic: str
    style: str  # 'technical', 'narrative', etc.
    tone: Optional[str] = 'professional'
    target_length: Optional[int] = 1500
    task_type: str = 'blog_post'  # Can be 'blog_post', 'social_media', etc.
    tags: Optional[List[str]] = []
    generate_featured_image: bool = True
    publish_mode: str = 'draft'  # 'draft' or 'published'
```

**Frontend Usage:**

```jsx
// web/oversight-hub/src/components/tasks/CreateTaskModal.jsx
if (taskType === 'blog_post') {
  response = await fetch('http://localhost:8000/api/content/tasks', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      task_type: 'blog_post',
      topic: contentPayload.topic,
      style: contentPayload.style,
      tone: contentPayload.tone || 'professional',
      target_length: contentPayload.target_length || 1500,
      tags: contentPayload.tags || [],
      generate_featured_image: true,
      publish_mode: 'draft',
    }),
  });
}
```

**Status:** ✅ WORKING - Special endpoint for content tasks with specific requirements

---

### 4. GET /api/tasks/metrics/summary - Task Metrics

**Backend Endpoint:**

```python
@router.get("/metrics/summary", response_model=MetricsResponse)
async def get_metrics(
    current_user: dict = Depends(get_current_user),
    db_service: DatabaseService = Depends(get_database_dependency)
):
```

**Response Schema:**

```python
class MetricsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    failed_tasks: int
    pending_tasks: int
    success_rate: float  # 0-100
    avg_execution_time: float  # seconds
```

**Example Response:**

```json
{
  "total_tasks": 42,
  "completed_tasks": 28,
  "failed_tasks": 2,
  "pending_tasks": 12,
  "success_rate": 66.7,
  "avg_execution_time": 45.3
}
```

**Not Currently Used in UI** - Should add metrics dashboard

---

### 5. POST /api/quality/evaluate - Quality Assessment

**Backend Endpoint:**

```python
@quality_router.post(
    "/evaluate",
    response_model=QualityEvaluationResponse,
    summary="Evaluate content quality"
)
async def evaluate_quality(
    request: QualityEvaluationRequest,
    current_user: dict = Depends(get_current_user),
    quality_service: UnifiedQualityService = Depends(get_quality_service)
):
```

**Request Schema:**

```python
class QualityEvaluationRequest(BaseModel):
    content: str = Field(..., min_length=10)
    content_type: str = Field(..., description="e.g., 'blog_post', 'social_media'")
    evaluation_method: Optional[EvaluationMethod] = EvaluationMethod.COMPREHENSIVE
```

**Response Schema:**

```python
class QualityEvaluationResponse(BaseModel):
    content_id: str
    dimensions: QualityDimensionsResponse
    overall_score: float  # 0-100
    evaluated_at: datetime
    recommendations: Optional[List[str]]
```

**7-Criteria Framework:**

1. Clarity - Is content clear and easy to understand?
2. Accuracy - Is information correct and fact-checked?
3. Completeness - Does it cover the topic thoroughly?
4. Relevance - Is all content relevant to the topic?
5. SEO Quality - Keywords, meta, structure optimization?
6. Readability - Grammar, flow, formatting?
7. Engagement - Is content compelling and interesting?

**Not Currently Used in Oversight Hub** - Could add quality assessment UI

---

## 🔴 REQUIRED FIXES

### Fix 1: Replace Hardcoded URLs in CreateTaskModal

**File:** `web/oversight-hub/src/components/tasks/CreateTaskModal.jsx`

**Change:**

```jsx
// ❌ BEFORE
response = await fetch('http://localhost:8000/api/tasks', {
  method: 'POST',
  headers,
  body: JSON.stringify(taskPayload),
});

// ✅ AFTER
import { createTask } from '../../services/cofounderAgentClient';

const result = await createTask(taskPayload);
if (result && result.id) {
  if (onTaskCreated) onTaskCreated(result);
}
```

**Impact:** Uses centralized API client with proper token injection and error handling

---

### Fix 2: Implement /api/tasks/bulk Endpoint

**Option A: Backend Implementation (Recommended)**

```python
# Add to task_routes.py
@router.post("/batch", response_model=List[TaskResponse])
async def get_tasks_batch(
    task_ids: List[str],
    current_user: dict = Depends(get_current_user),
    db_service: DatabaseService = Depends(get_database_dependency)
):
    tasks = [await db_service.get_task(tid) for tid in task_ids]
    return [TaskResponse(**convert_db_row_to_dict(t)) for t in tasks]
```

**Option B: Frontend Workaround (If backend unavailable)**

```javascript
// Fetch multiple tasks in parallel
const getTasksBatch = async (taskIds) => {
  const results = await Promise.all(taskIds.map((id) => getTask(id)));
  return results.filter((t) => t !== null);
};
```

---

### Fix 3: Add Response Validation

**File:** `web/oversight-hub/src/components/tasks/CreateTaskModal.jsx`

**Change:**

```javascript
// ✅ Add validation
const result = await response.json();

if (!result || !result.id) {
  throw new Error('Invalid task response: missing task ID');
}

if (onTaskCreated) {
  onTaskCreated(result);
}
```

---

## 📋 COMPONENT REFACTORING CHECKLIST

### Components to Update

- [ ] **CreateTaskModal.jsx**
  - [ ] Replace `fetch('http://localhost:8000/api/tasks', ...)` with `createTask()`
  - [ ] Replace `fetch('http://localhost:8000/api/content/tasks', ...)` with `createTask()`
  - [ ] Add response validation for task ID

- [ ] **TaskManagement.jsx**
  - [ ] Replace hardcoded `/api/tasks/bulk` with individual `getTask()` calls
  - [ ] Test pagination with `offset` parameter
  - [ ] Verify response parsing with `response.tasks`

- [ ] **TaskQueueView.jsx**
  - [ ] Remove unused `fetch('http://localhost:8000/api/tasks')`
  - [ ] Already receives tasks as props, no fetch needed

- [ ] **BlogPostCreator.jsx**
  - [ ] Replace hardcoded URL with `createTask()` or specialized method

- [ ] **New Component: QualityAssessmentPanel**
  - [ ] Add button "Evaluate Quality"
  - [ ] Call `POST /api/quality/evaluate` with content
  - [ ] Display QualityEvaluationResponse in formatted UI
  - [ ] Show 7-criteria scores and recommendations

- [ ] **New Component: MetricsBoard**
  - [ ] Fetch `GET /api/tasks/metrics/summary`
  - [ ] Display total, completed, failed, pending counts
  - [ ] Show success rate and avg execution time
  - [ ] Add charts for visualization

---

## 🧪 Testing Plan

### Unit Tests

```javascript
// Test getTasks response parsing
describe('getTasks', () => {
  it('should return TaskListResponse with tasks array', async () => {
    const response = await getTasks(20, 0);
    expect(response).toHaveProperty('tasks');
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('offset');
    expect(response).toHaveProperty('limit');
    expect(Array.isArray(response.tasks)).toBe(true);
  });

  it('should use correct pagination parameters', async () => {
    const response = await getTasks(50, 100);
    // Verify offset and limit in response
    expect(response.offset).toBe(100);
    expect(response.limit).toBe(50);
  });
});
```

### Integration Tests

```javascript
// Test complete task creation workflow
describe('CreateTaskModal', () => {
  it('should create task and update parent component', async () => {
    const onTaskCreated = jest.fn();
    // ... render component with props
    // ... fill form
    // ... submit
    expect(onTaskCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.any(String) })
    );
  });

  it('should validate required fields', async () => {
    // ... render component
    // ... try to submit empty form
    expect(setError).toHaveBeenCalledWith(expect.stringContaining('task_name'));
  });
});
```

### Manual Testing

1. **Task List**
   - [ ] Load TaskManagement page
   - [ ] Verify tasks display with pagination
   - [ ] Try different offset/limit values
   - [ ] Filter by status

2. **Task Creation**
   - [ ] Open CreateTaskModal
   - [ ] Fill form with valid data
   - [ ] Submit
   - [ ] Verify task appears in list immediately
   - [ ] Check response has all required fields

3. **Quality Assessment**
   - [ ] Select a task
   - [ ] Click "Evaluate Quality"
   - [ ] View quality scores
   - [ ] Verify 7-criteria breakdown

4. **Metrics Dashboard**
   - [ ] Navigate to metrics page
   - [ ] Verify counts match tasks
   - [ ] Check success rate calculation
   - [ ] View execution time stats

---

## 📚 API Reference Summary

### Task Management Endpoints

```
GET  /api/tasks?offset=0&limit=20&status=pending&category=general
  Response: TaskListResponse { tasks[], total, offset, limit }

POST /api/tasks
  Request: TaskCreateRequest { task_name, topic, primary_keyword?, target_audience?, category?, metadata? }
  Response: { id, task_name, topic, status, task_metadata, ... }

GET  /api/tasks/{task_id}
  Response: TaskResponse { id, task_name, topic, status, created_at, updated_at, ... }

PATCH /api/tasks/{task_id}
  Request: TaskStatusUpdateRequest { status, metadata? }
  Response: TaskResponse { ... }

GET  /api/tasks/metrics/summary
  Response: MetricsResponse { total_tasks, completed_tasks, failed_tasks, pending_tasks, success_rate, avg_execution_time }
```

### Content Task Endpoints

```
POST /api/content/tasks
  Request: CreateBlogPostRequest { topic, style, tone?, target_length?, task_type, tags?, generate_featured_image, publish_mode }
  Response: { id, task_name, status, task_metadata, ... }

GET  /api/content/tasks/{task_id}
  Response: TaskResponse with content-specific fields

GET  /api/content/tasks
  Query: status, limit, offset
  Response: TaskListResponse { tasks[], total, offset, limit }
```

### Quality Assessment Endpoints

```
POST /api/quality/evaluate
  Request: QualityEvaluationRequest { content, content_type, evaluation_method? }
  Response: QualityEvaluationResponse { content_id, dimensions, overall_score, evaluated_at, recommendations? }

POST /api/quality/batch-evaluate
  Request: BatchQualityRequest { contents: [{content, content_type}] }
  Response: [QualityEvaluationResponse]

GET  /api/quality/statistics
  Response: Quality statistics and trends
```

---

## ✅ Verification Checklist

Before considering integration complete:

- [ ] All hardcoded `fetch()` calls replaced with API client methods
- [ ] `/api/tasks/bulk` endpoint implemented or replaced with individual calls
- [ ] Response validation added for task creation
- [ ] All required fields in TaskCreateRequest properly mapped
- [ ] Pagination works with offset/limit parameters
- [ ] Task list displays correctly with multiple pages
- [ ] Quality assessment endpoints integrated (new component)
- [ ] Metrics dashboard displays correctly (new component)
- [ ] JWT token properly injected in all requests
- [ ] Error handling shows user-friendly messages
- [ ] All tests pass (unit, integration, manual)
- [ ] No console errors or warnings
- [ ] API URLs use environment variables (not hardcoded)

---

**Next Steps:**

1. Address the "Required Fixes" section
2. Run testing plan
3. Create pull request with all changes
4. Final integration test before merge
