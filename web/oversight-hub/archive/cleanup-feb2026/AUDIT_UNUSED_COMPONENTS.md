# Oversight Hub - Unused Components Audit Report

**Generated:** December 22, 2025  
**Updated:** January 18, 2026  
**Status:** ✅ COMPLETED - All unused components archived

---

## Summary

The Oversight Hub contains **11 unused/orphaned files** that are never imported or routed in the application. These files should be archived or removed to improve code maintainability.

---

## Unused Routes (Never Routed in AppRoutes.jsx)

### 1. **SocialMediaManagement.jsx**

- **Path:** `src/routes/SocialMediaManagement.jsx`
- **Size:** ~263 lines
- **Purpose:** Social media posting management (placeholder UI)
- **Status:** ✗ **NOT ROUTED** - Never imported in AppRoutes.jsx
- **CSS:** `src/routes/SocialMediaManagement.css` (also unused)

### 2. **ModelManagement.jsx**

- **Path:** `src/routes/ModelManagement.jsx`
- **Size:** ~537 lines
- **Purpose:** Model selection and management interface
- **Status:** ✗ **NOT ROUTED** - Styles reused by AIStudio but component itself never imported
- **CSS:** `src/routes/ModelManagement.css` (reused)

### 3. **Content.jsx**

- **Path:** `src/routes/Content.jsx`
- **Size:** ~225 lines
- **Purpose:** Content management interface
- **Status:** ✗ **NOT ROUTED** - Never imported in AppRoutes.jsx
- **CSS:** `src/routes/Content.css` (also unused)

### 4. **Analytics.jsx**

- **Path:** `src/routes/Analytics.jsx`
- **Size:** ~213 lines
- **Purpose:** Analytics dashboard (placeholder UI)
- **Status:** ✗ **NOT ROUTED** - Never imported in AppRoutes.jsx
- **CSS:** `src/routes/Analytics.css` (also unused)

---

## Unused Pages (Never Imported)

### 5. **OrchestratorPage.jsx**

- **Path:** `src/pages/OrchestratorPage.jsx`
- **Status:** ✗ **NOT IMPORTED** - Orphaned page, purpose unclear
- **Note:** Replaced by CommandPane component functionality

### 6. **TrainingDataDashboard.jsx**

- **Path:** `src/pages/TrainingDataDashboard.jsx`
- **Status:** ✗ **NOT IMPORTED** - Orphaned page
- **Note:** Functionality exists in AIStudio component

---

## Active Routes vs. Unused Routes

### ✓ Currently Active Routes (In AppRoutes.jsx):

- `/` → ExecutiveDashboard
- `/tasks` → TaskManagement
- `/ai` → AIStudio
- `/training` → AIStudio
- `/models` → AIStudio
- `/settings` → Settings
- `/costs` → CostMetricsDashboard
- `/login` → Login
- `/auth/callback` → AuthCallback

### ✗ Unused Routes (NOT in AppRoutes.jsx):

- No routes for: SocialMediaManagement, ModelManagement, Content, Analytics, OrchestratorPage, TrainingDataDashboard

---

## Recommended Cleanup Actions

### Phase 1: Archive (Low Risk) - ✅ COMPLETED

All unused routes and pages have been successfully moved to:

- `archive/unused-routes/` - Contains 4 unused route components + CSS files
- `archive/unused-pages/` - Contains 2 unused page components

**Files Archived:**

1. SocialMediaManagement.jsx + SocialMediaManagement.css
2. Content.jsx + Content.css
3. Analytics.jsx + Analytics.css
4. OrchestratorPage.jsx
5. TrainingDataDashboard.jsx

### Phase 2: Verify No External References - ✅ COMPLETED

All references checked - no active imports from archived components confirmed.

### Phase 3: Update index.js Exports - ✅ COMPLETED

Modified `src/routes/index.js`:

- Removed unused Dashboard export
- Removed Content export
- Removed Analytics export
- Kept only active exports:
  - Settings
  - TaskManagement
  - CostMetricsDashboard
  - AIStudio

---

## Impact Assessment

- **Lines of Dead Code:** ~1,700+ lines
- **Unused CSS Files:** 3 files (~500+ lines)
- **Risk Level:** LOW - These files are isolated, no dependencies
- **Maintenance Burden:** MODERATE - Future developers might waste time investigating

---

## File Status Reference

| File                      | Type  | Status     | Action               |
| ------------------------- | ----- | ---------- | -------------------- |
| SocialMediaManagement.jsx | Route | ✗ Orphaned | Archive              |
| ModelManagement.jsx       | Route | ⚠ Partial  | Document/Archive     |
| Content.jsx               | Route | ✗ Orphaned | Archive              |
| Analytics.jsx             | Route | ✗ Orphaned | Archive              |
| OrchestratorPage.jsx      | Page  | ✗ Orphaned | Archive              |
| TrainingDataDashboard.jsx | Page  | ✗ Orphaned | Archive              |
| Dashboard.jsx             | Route | ⚠ Exported | Keep (might be used) |

---

## Notes

- **Dashboard.jsx** is exported from index.js but also not used - verify if intentional
- **ModelManagement.css** is referenced by AIStudio, so keep the CSS file
- **CommandPane component** appears to replace OrchestratorPage functionality
- **ExecutiveDashboard** is the actual dashboard component being used
- AIStudio consolidates model, training, and AI features into one unified interface

---

## Next Steps

1. Run audit verification command
2. Archive unused components to `web/oversight-hub/archive/`
3. Update routes/index.js to remove unused exports
4. Document decision in DEVELOPMENT_NOTES.md
5. Run full test suite to ensure no breaking changes
