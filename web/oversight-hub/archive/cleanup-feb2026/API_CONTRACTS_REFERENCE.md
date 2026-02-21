# API Contracts Reference - Frontend Integration Guide

**Document Version:** 2.0  
**Last Updated:** February 10, 2026  
**Backend API Base:** `http://localhost:8000` (dev) / Environment-specific (production)

---

## Overview

This guide documents all API endpoints used by the Oversight Hub frontend, their request/response contracts, validation rules, and integration patterns. Use this as the single source of truth for API integration.

---

## 1. Cost Metrics Endpoints

### 1.1 GET `/api/cost-metrics`

**Purpose:** Retrieve current cost tracking metrics and statistics

**Response Contract:**
```javascript
// validateCostMetrics(data)
{
  total_cost: number,           // ≥ 0, e.g., 127.50
  avg_cost_per_task: number,    // ≥ 0, e.g., 12.75
  total_tasks: number,          // ≥ 0, integer count
  cost_currency: string,        // Optional: "USD", default inferred from total_cost locale
  time_period: string,          // Optional: "all_time", "this_month", "this_week"
}
```

**Validation Rules:**
- ✅ `total_cost` must be number ≥ 0
- ✅ `avg_cost_per_task` must be number ≥ 0
- ✅ `total_tasks` must be integer ≥ 0
- ❌ Missing `total_cost` → Error: "total_cost is required"
- ❌ Negative value → Error: "total_cost must be non-negative"
- ❌ Non-numeric value → Error: "total_cost must be a number"

**Example Request:**
```bash
curl http://localhost:8000/api/cost-metrics \
  -H "Authorization: Bearer $TOKEN"
```

**Example Response (200 OK):**
```json
{
  "total_cost": 127.50,
  "avg_cost_per_task": 12.75,
  "total_tasks": 10,
  "cost_currency": "USD",
  "time_period": "this_month"
}
```

**Example Error (400 Bad Request):**
```json
{
  "detail": "total_cost must be non-negative"
}
```

**Frontend Integration:**
```javascript
import { validateCostMetrics, safeValidate } from '../services/responseValidationSchemas';

const metrics = await cofounderAgentClient.makeRequest('/api/cost-metrics', 'GET');
const validated = safeValidate(validateCostMetrics, metrics);
if (!validated) {
  throw new Error('Invalid cost metrics response');
}
setCostMetrics(validated);
```

---

### 1.2 GET `/api/cost-metrics/by-phase`

**Purpose:** Breakdown of costs by project phase (research, creation, review, etc.)

**Response Contract:**
```javascript
// validateCostsByPhase(data)
{
  phases: {
    [phase_name: string]: number // e.g., "research": 25.00, "creation": 50.00
  },
  total: number,  // Sum of all phases, should equal or approximate total_cost
  period: string  // "this_month", "all_time", etc.
}
```

**Validation Rules:**
- ✅ All phase values must be numbers ≥ 0
- ✅ Can be empty object `{}`
- ❌ Negative cost in any phase → Error
- ❌ Non-numeric value → Error

**Common Phases:**
- `research` - Information gathering
- `creation` - Content generation
- `review` - QA/critique pass
- `refinement` - Updates based on feedback
- `graphics` - Image generation/selection
- `publishing` - CMS integration

**Example Response:**
```json
{
  "phases": {
    "research": 25.00,
    "creation": 50.00,
    "review": 30.00,
    "graphics": 20.00,
    "publishing": 2.50
  },
  "total": 127.50,
  "period": "this_month"
}
```

---

### 1.3 GET `/api/cost-metrics/by-model`

**Purpose:** Cost breakdown by LLM provider/model used

**Response Contract:**
```javascript
// validateCostsByModel(data)
{
  models: {
    [model_name: string]: number  // e.g., "claude-3-sonnet": 80.00
  },
  total: number,
  models_used: number,  // Count of distinct models
  period: string
}
```

**Validation Rules:**
- ✅ All model costs must be numbers ≥ 0
- ✅ Can be empty `{}`
- ✅ Model names are strings

**Common Models:**
- `gpt-4-turbo` - OpenAI GPT-4 Turbo
- `gpt-4o` - OpenAI GPT-4 Optimized
- `claude-3-opus` - Anthropic Claude Opus
- `claude-3-5-sonnet` - Anthropic Claude Sonnet
- `gemini-pro` - Google Gemini
- `ollama-local` - Local Ollama (zero cost)

**Example Response:**
```json
{
  "models": {
    "claude-3-5-sonnet": 80.00,
    "gpt-4-turbo": 35.00,
    "gemini-pro": 12.50
  },
  "total": 127.50,
  "models_used": 3,
  "period": "this_month"
}
```

---

### 1.4 GET `/api/cost-metrics/history`

**Purpose:** Historical cost data for trend visualization

**Response Contract:**
```javascript
// validateCostHistory(data)
{
  daily_data: [
    {
      date: string,        // ISO format: "2026-02-10"
      cost: number,        // ≥ 0
      tasks_completed: number,  // Optional
      avg_cost_per_task: number  // Optional
    },
    // ... more days
  ],
  period: string,           // "30_days", "all_time"
  total_cost: number,
  average_daily_cost: number
}
```

**Validation Rules:**
- ✅ `daily_data` must be array
- ✅ Each entry must have `date` (string) and `cost` (number ≥ 0)
- ✅ Can be empty array `[]`
- ❌ Missing `date` → Error
- ❌ Non-numeric `cost` → Error

**Date Format:** ISO 8601 `YYYY-MM-DD`

**Example Response:**
```json
{
  "daily_data": [
    { "date": "2026-02-08", "cost": 35.20, "tasks_completed": 3 },
    { "date": "2026-02-09", "cost": 42.10, "tasks_completed": 4 },
    { "date": "2026-02-10", "cost": 50.20, "tasks_completed": 3 }
  ],
  "period": "30_days",
  "total_cost": 127.50,
  "average_daily_cost": 42.50
}
```

---

### 1.5 GET `/api/cost-metrics/budget`

**Purpose:** Budget tracking and status

**Response Contract:**
```javascript
// validateBudgetStatus(data)
{
  monthly_budget: number,      // Max budget for period
  amount_spent: number,        // ≥ 0
  amount_remaining: number,    // monthly_budget - amount_spent
  percent_used: number,        // 0-100
  budget_period: string,       // "monthly", "quarterly"
  status: string,              // "healthy", "warning", "exceeded"
  currency: string             // "USD"
}
```

**Validation Rules:**
- ✅ All monetary fields must be numbers ≥ 0
- ✅ `percent_used` must be 0 ≤ x ≤ 100 (even if status === "exceeded")
- ✅ `monthly_budget` can be 0 (unlimited)
- ❌ `percent_used` > 100 when budget exceeded → Use `status: "exceeded"`
- ❌ Negative amounts → Error
- ❌ Non-numeric percent → Error

**Status Mapping:**
- `healthy` - Used < 70%
- `warning` - Used 70-90%
- `exceeded` - Used > 100%

**Example Response:**
```json
{
  "monthly_budget": 500.00,
  "amount_spent": 127.50,
  "amount_remaining": 372.50,
  "percent_used": 25.5,
  "budget_period": "monthly",
  "status": "healthy",
  "currency": "USD"
}
```

---

## 2. Settings Endpoints

### 2.1 GET `/api/settings`

**Purpose:** Get all user settings

**Response Contract:**
```javascript
// Response is array of setting objects
[
  {
    key: string,      // "theme", "auto_refresh", etc.
    value: string,    // Actual value, potentially stringified JSON
    description: string  // Human-readable description
  },
  // ... more settings
]
```

**Available Settings:**
- `theme` - "dark" | "light" | "auto"
- `auto_refresh` - "true" | "false" (boolean as string)
- `desktop_notifications` - "true" | "false"
- `mercury_api_key` - API key string
- `gcp_api_key` - API key string
- Future: extensible, unknown keys are allowed

**Validation Rules:**
- ✅ Returns array of {key, value, description}
- ✅ Unknown keys allowed (with warning)
- ✅ Can be empty array

**Example Request:**
```bash
curl http://localhost:8000/api/settings \
  -H "Authorization: Bearer $TOKEN"
```

**Example Response:**
```json
[
  { "key": "theme", "value": "dark", "description": "App theme preference" },
  { "key": "auto_refresh", "value": "true", "description": "Auto-refresh metrics" },
  { "key": "desktop_notifications", "value": "false", "description": "Desktop notifications" }
]
```

**Frontend Integration:**
```javascript
import { listSettings } from '../services/settingsService';

const settings = await listSettings();
const settingsMap = Object.fromEntries(
  settings.map(s => [s.key, s.value])
);
```

---

### 2.2 GET `/api/settings/{key}`

**Purpose:** Get specific setting by key

**Path Parameters:**
- `key` (string) - Setting key, e.g., "theme"

**Response Contract:**
```javascript
{
  key: string,
  value: string,           // Actual value (may be stringified)
  description: string,
  last_updated: string     // ISO timestamp
}
```

**Status Codes:**
- `200 OK` - Setting found
- `404 Not Found` - Setting does not exist
- `400 Bad Request` - Invalid key format

**Example Request:**
```bash
curl http://localhost:8000/api/settings/theme \
  -H "Authorization: Bearer $TOKEN"
```

**Example Response (200 OK):**
```json
{
  "key": "theme",
  "value": "dark",
  "description": "App theme preference",
  "last_updated": "2026-02-10T14:30:00Z"
}
```

**Example Response (404 Not Found):**
```json
{
  "detail": "Setting 'unknown_key' not found"
}
```

**Frontend Integration:**
```javascript
import { getSettingWithDefault } from '../services/settingsService';

const theme = await getSettingWithDefault('theme', 'light');
// Returns 'dark' if set, 'light' if not found
```

---

### 2.3 POST `/api/settings`

**Purpose:** Create or update a setting

**Request Body:**
```json
{
  "key": string,      // Setting name
  "value": any,       // Can be string, boolean, number, object (auto-stringified)
  "description": string  // Optional
}
```

**Validation Rules:**
- ✅ `key` must be non-empty string
- ✅ `value` can be any JSON-serializable type
- ✅ Boolean values auto-converted to strings: `true` → `"true"`
- ✅ Objects auto-converted to JSON strings: `{a:1}` → `'{"a":1}'`
- ❌ Missing `key` → Error
- ❌ `value` circular reference → Error

**Response Contract:**
```javascript
{
  key: string,
  value: string,
  created: boolean,  // true if new, false if updated
  description: string,
  timestamp: string  // ISO timestamp
}
```

**Example Request (Create):**
```bash
curl -X POST http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "key": "theme",
    "value": "dark",
    "description": "User prefers dark mode"
  }'
```

**Example Response:**
```json
{
  "key": "theme",
  "value": "dark",
  "created": true,
  "description": "User prefers dark mode",
  "timestamp": "2026-02-10T14:30:00Z"
}
```

**Example: Update with Type Conversion**
```bash
curl -X POST http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "key": "auto_refresh",
    "value": true
  }'
```

Response will have `value: "true"` (stringified)

**Frontend Integration:**
```javascript
import { createOrUpdateSetting } from '../services/settingsService';

// Boolean auto-stringified
await createOrUpdateSetting('auto_refresh', true);
// Backend receives: { key: "auto_refresh", value: "true" }

// Object auto-stringified
await createOrUpdateSetting('api_config', { timeout: 5000 });
// Backend receives: { key: "api_config", value: '{"timeout":5000}' }
```

---

### 2.4 DELETE `/api/settings/{key}`

**Purpose:** Delete a setting

**Path Parameters:**
- `key` (string) - Setting key to delete

**Response Contract:**
```javascript
{
  success: boolean,
  key: string,
  deleted_at: string  // ISO timestamp
}
```

**Status Codes:**
- `200 OK` - Setting deleted successfully
- `404 Not Found` - Setting does not exist

**Example Request:**
```bash
curl -X DELETE http://localhost:8000/api/settings/theme \
  -H "Authorization: Bearer $TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "key": "theme",
  "deleted_at": "2026-02-10T14:30:00Z"
}
```

---

## 3. Task Endpoints

### 3.1 GET `/api/tasks`

**Purpose:** Retrieve list of tasks with pagination and filtering

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `page_size` (integer, optional) - Items per page (default: 20)
- `status` (string, optional) - Filter by status
- `sort` (string, optional) - Sort field (default: created_at)
- `sort_order` (string, optional) - "asc" | "desc"

**Response Contract:**
```javascript
// validateTaskList(data)
{
  tasks: [
    {
      id: string,        // Non-empty UUID
      topic: string,     // Non-empty string, the task topic
      status: string,    // "pending" | "in_progress" | "completed" | "failed"
      created_at: string, // ISO timestamp
      updated_at: string,
      task_metadata: object  // Additional task info
    },
    // ... more tasks
  ],
  total: number,         // Total task count
  page: number,
  page_size: number
}
```

**Validation Rules for Each Task:**
- ✅ `id` must be non-empty string (UUID format preferred)
- ✅ `topic` must be non-empty string
- ✅ `status` must be one of: "pending", "in_progress", "completed", "failed"
- ✅ `created_at` must be ISO timestamp
- ❌ Missing any required field → Error
- ❌ Invalid status value → Error

**Example Request:**
```bash
curl "http://localhost:8000/api/tasks?page=1&page_size=20&status=completed" \
  -H "Authorization: Bearer $TOKEN"
```

**Example Response:**
```json
{
  "tasks": [
    {
      "id": "task-001",
      "topic": "Write blog post about AI",
      "status": "completed",
      "created_at": "2026-02-10T10:00:00Z",
      "updated_at": "2026-02-10T12:00:00Z",
      "task_metadata": {
        "content": "AI is transforming...",
        "word_count": 2500
      }
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 20
}
```

---

### 3.2 GET `/api/tasks/{id}/generate-image`

**Purpose:** Retrieve generated image for a task (historical)

**Path Parameters:**
- `id` (string) - Task ID

**Response Contract:**
```javascript
{
  image_url: string,        // Non-empty URL to image
  image_source: string,     // e.g., "openai", "anthropic", "local"
  generated_at: string,     // ISO timestamp
  task_id: string
}
```

**Validation Rules:**
- ✅ `image_url` must be non-empty string (valid URL)
- ✅ Can be HTTPs OR relative path
- ❌ Empty `image_url` → Error
- ❌ Missing `image_url` → Error

**Example Request:**
```bash
curl http://localhost:8000/api/tasks/task-001/generate-image \
  -H "Authorization: Bearer $TOKEN"
```

**Example Response:**
```json
{
  "image_url": "https://s3.amazonaws.com/glad-labs/images/task-001.png",
  "image_source": "openai",
  "generated_at": "2026-02-10T12:30:00Z",
  "task_id": "task-001"
}
```

---

### 3.3 POST `/api/tasks/{id}/generate-image`

**Purpose:** Generate new image for a task

**Path Parameters:**
- `id` (string) - Task ID

**Request Body:**
```json
{
  "source": string,              // "openai" | "anthropic" | "auto"
  "topic": string,               // Topic for image generation
  "content_summary": string      // Optional: brief content summary
}
```

**Response Contract:**
```javascript
// validateGeneratedImage(data)
{
  image_url: string,             // Generated image URL
  image_source: string,          // Which provider generated it
  generation_time_ms: number,    // How long generation took
  task_id: string,
  prompt_used: string            // The actual prompt sent to image model
}
```

**Validation Rules:**
- ✅ `image_url` must be non-empty string
- ✅ `image_source` must be string
- ✅ `generation_time_ms` must be positive number
- ❌ Empty or missing `image_url` → Error
- ❌ Generation failed (timeout/error) → 500 error

**Status Codes:**
- `200 OK` - Image generated successfully
- `400 Bad Request` - Invalid request (missing required fields)
- `500 Internal Server Error` - Image generation failed
- `408 Request Timeout` - Generation took too long

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/tasks/task-001/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "source": "openai",
    "topic": "Write blog post about AI",
    "content_summary": "Discussion of AI trends and impact on business"
  }'
```

**Example Response (200 OK):**
```json
{
  "image_url": "https://s3.amazonaws.com/glad-labs/images/gen/abc123.png",
  "image_source": "openai",
  "generation_time_ms": 2500,
  "task_id": "task-001",
  "prompt_used": "Professional blog header image about AI trends..."
}
```

**Example Error Response (500):**
```json
{
  "detail": "Image generation failed: OpenAI API rate limited"
}
```

**Frontend Integration:**
```javascript
import { generateTaskImage } from '../services/cofounderAgentClient';
import { validateGeneratedImage, safeValidate } from '../services/responseValidationSchemas';

try {
  const result = await generateTaskImage(taskId, {
    source: 'openai',
    topic: task.topic,
    content_summary: task.description
  });
  
  const validated = safeValidate(validateGeneratedImage, result);
  if (!validated) {
    throw new Error('Invalid image response');
  }
  
  // Use validated.image_url
  setImageUrl(validated.image_url);
} catch (error) {
  logError(error, { feature: 'image-generation' });
  showError('Failed to generate image');
}
```

---

## 4. Error Endpoints

### 4.1 POST `/api/errors`

**Purpose:** Log frontend errors to backend for monitoring

**Request Body:**
```json
{
  "type": string,           // "client_error", "warning", etc.
  "message": string,        // Error message
  "stack": string,          // Stack trace
  "componentStack": string, // React component stack (if from ErrorBoundary)
  "severity": string,       // "critical" | "high" | "medium" | "low"
  "userAgent": string,      // Browser info
  "timestamp": string,      // ISO timestamp
  "url": string,            // Current URL when error occurred
  "environment": string,    // "development" | "production"
  "custom_context": object  // Custom data: { userId, feature, sessionId, etc. }
}
```

**Response Contract:**
```json
{
  "success": boolean,
  "error_id": string,
  "stored_at": string  // ISO timestamp of when error was logged
}
```

**Status Codes:**
- `200 OK` - Error logged successfully
- `400 Bad Request` - Invalid request format
- `500 Internal Server Error` - Database error while logging (error is still logged)

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/errors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "client_error",
    "message": "Cannot read property of undefined",
    "stack": "at handleClick (TaskDetailModal.jsx:123)",
    "severity": "critical",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "timestamp": "2026-02-10T14:30:15Z",
    "url": "http://localhost:3001/tasks/abc123",
    "environment": "development",
    "custom_context": {
      "feature": "image-generation",
      "taskId": "abc123"
    }
  }'
```

**Example Response:**
```json
{
  "success": true,
  "error_id": "err_123abc",
  "stored_at": "2026-02-10T14:30:15Z"
}
```

**Frontend Integration:**
```javascript
import { logError } from '../services/errorLoggingService';

try {
  // Some operation
} catch (error) {
  await logError(error, {
    feature: 'image-generation',
    taskId: selectedTask.id,
    severity: 'critical'
  });
  showErrorToUser('Something went wrong');
}
```

---

## 5. Authentication & Headers

### Required Headers for All Requests

```javascript
// Automatically handled by cofounderAgentClient.makeRequest()
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`  // From localStorage or session
}
```

### Token Storage

- **Location:** `localStorage.getItem('auth_token')`
- **Format:** JWT Bearer token
- **Duration:** Set by backend (typically 24 hours)
- **Refresh:** Automatic via `/api/auth/refresh` if expired

---

## 6. Validation Schema Locations

All validators are in: `src/services/responseValidationSchemas.js`

```javascript
// Import validators
import {
  validateCostMetrics,
  validateCostsByPhase,
  validateCostsByModel,
  validateCostHistory,
  validateBudgetStatus,
  validateTask,
  validateTaskList,
  validateSettings,
  validateGeneratedImage,
  safeValidate  // Safe wrapper that returns null on error
} from '../services/responseValidationSchemas';

// Usage pattern
const result = await cofounderAgentClient.makeRequest(endpoint);
const validated = safeValidate(validator, result, 'Data Type Name');
if (!validated) {
  throw new Error('API response validation failed');
}
// Use validated data
```

---

## 7. Error Response Format

All API errors follow this format:

```json
{
  "detail": "Human-readable error message",
  "status": 400,
  "timestamp": "2026-02-10T14:30:00Z",
  "request_id": "req_abc123"  // For support tracking
}
```

**Common Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid auth token
- `403 Forbidden` - User lacks permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Maintenance or down

---

## 8. Best Practices

### ✅ DO:
1. Always use `cofounderAgentClient.makeRequest()` for HTTP calls
2. Validate all API responses with `safeValidate()`
3. Use `logError()` for all error logging
4. Include `custom_context` in error logs with feature/action
5. Handle `404 Not Found` gracefully
6. Show user-friendly error messages from `error.message`

### ❌ DON'T:
1. Direct `fetch()` calls - use API client
2. Assume response shape without validation
3. Silent errors - always log or show user message
4. Hardcoded URLs - use `cofounderAgentClient` configuration
5. Manual token handling - client handles it
6. Log sensitive data (API keys, passwords, tokens)

---

## 9. Testing Endpoints Locally

### Health Check
```bash
curl http://localhost:8000/health
# Response: { "status": "healthy" }
```

### Cost Metrics
```bash
curl http://localhost:8000/api/cost-metrics \
  -H "Authorization: Bearer test_token"
```

### Settings
```bash
curl http://localhost:8000/api/settings \
  -H "Authorization: Bearer test_token"
```

### Generate Test Error
```bash
curl -X POST http://localhost:8000/api/errors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -d '{"type":"test","message":"Test error","severity":"low"}'
```

---

## 10. Troubleshooting

### 401 Unauthorized
- **Cause:** Token missing, expired, or invalid
- **Fix:** Ensure `localStorage.getItem('auth_token')` returns valid JWT
- **Check:** `cofounderAgentClient` automatically adds auth header

### 400 Bad Request - Validation Error
- **Cause:** Request body doesn't match schema
- **Fix:** Check request body matches examples in this document
- **Check:** Use frontend validators first: `safeValidate(validator, data)`

### 500 Internal Server Error
- **Cause:** Backend error (database, external API, etc.)
- **Check:** Look in backend logs: `npm run dev:cofounder`
- **Workaround:** Retry or contact backend team

### Validation Failed
- **Cause:** API response doesn't match expected contract
- **Fix:** Check backend returned correct response (see examples above)
- **Debug:** Log response first: `console.log('API Result:', result)`

---

**Document Controls:**
- Version: 2.0
- Last Updated: 2026-02-10 by Refactoring Agent
- Next Review: 2026-03-10
- Contact: Backend API Team / #engineering-support
