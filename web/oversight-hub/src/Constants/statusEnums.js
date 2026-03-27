/**
 * Status Enumerations
 *
 * This module defines both new and legacy status values for backward compatibility.
 * The system uses the new status values internally but maps to/from legacy values
 * when needed for existing code.
 */

/**
 * New Status Enum (9 states)
 * Used by Phase 5+ Status Management System
 */
export const STATUS_ENUM = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  AWAITING_APPROVAL: 'awaiting_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  FAILED: 'failed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
  FAILED_REVISIONS_REQUESTED: 'failed_revisions_requested',
};

/**
 * Legacy Status Enum (5 states)
 * Used by existing approval workflow (OrchestratorPage, TaskActions)
 * Maintained for backward compatibility
 */
export const STATUS_ENUM_LEGACY = {
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Bidirectional status mapping
 * Maps legacy statuses to new statuses
 */
export const STATUS_MAP_LEGACY_TO_NEW = {
  [STATUS_ENUM_LEGACY.PENDING_APPROVAL]: STATUS_ENUM.AWAITING_APPROVAL,
  [STATUS_ENUM_LEGACY.APPROVED]: STATUS_ENUM.APPROVED,
  [STATUS_ENUM_LEGACY.EXECUTING]: STATUS_ENUM.IN_PROGRESS,
  [STATUS_ENUM_LEGACY.COMPLETED]: STATUS_ENUM.PUBLISHED,
  [STATUS_ENUM_LEGACY.FAILED]: STATUS_ENUM.FAILED,
};

/**
 * Reverse mapping: new statuses to legacy (for backward compatibility)
 */
export const STATUS_MAP_NEW_TO_LEGACY = {
  [STATUS_ENUM.PENDING]: STATUS_ENUM_LEGACY.PENDING_APPROVAL,
  [STATUS_ENUM.IN_PROGRESS]: STATUS_ENUM_LEGACY.EXECUTING,
  [STATUS_ENUM.AWAITING_APPROVAL]: STATUS_ENUM_LEGACY.PENDING_APPROVAL,
  [STATUS_ENUM.APPROVED]: STATUS_ENUM_LEGACY.APPROVED,
  [STATUS_ENUM.REJECTED]: STATUS_ENUM_LEGACY.FAILED,
  [STATUS_ENUM.PUBLISHED]: STATUS_ENUM_LEGACY.COMPLETED,
  [STATUS_ENUM.FAILED]: STATUS_ENUM_LEGACY.FAILED,
  [STATUS_ENUM.ON_HOLD]: STATUS_ENUM_LEGACY.PENDING_APPROVAL,
  [STATUS_ENUM.CANCELLED]: STATUS_ENUM_LEGACY.FAILED,
};

/**
 * Status color mappings for UI display
 */
export const STATUS_COLORS = {
  [STATUS_ENUM.PENDING]: '#FFA500', // Orange
  [STATUS_ENUM.IN_PROGRESS]: '#1976D2', // Blue
  [STATUS_ENUM.AWAITING_APPROVAL]: '#FF9800', // Amber
  [STATUS_ENUM.APPROVED]: '#4CAF50', // Green
  [STATUS_ENUM.REJECTED]: '#F44336', // Red
  [STATUS_ENUM.PUBLISHED]: '#4CAF50', // Green
  [STATUS_ENUM.FAILED]: '#F44336', // Red
  [STATUS_ENUM.ON_HOLD]: '#9C27B0', // Purple
  [STATUS_ENUM.CANCELLED]: '#9E9E9E', // Gray
  [STATUS_ENUM.FAILED_REVISIONS_REQUESTED]: '#FF9800', // Amber — distinct from hard-failed red
};

/**
 * Status descriptions for UI tooltips
 */
export const STATUS_DESCRIPTIONS = {
  [STATUS_ENUM.PENDING]: 'Task is pending processing',
  [STATUS_ENUM.IN_PROGRESS]: 'Task is currently being processed',
  [STATUS_ENUM.AWAITING_APPROVAL]: 'Task is awaiting user approval',
  [STATUS_ENUM.APPROVED]: 'Task has been approved and is ready to execute',
  [STATUS_ENUM.REJECTED]: 'Task has been rejected by reviewer',
  [STATUS_ENUM.PUBLISHED]: 'Task has been completed and published',
  [STATUS_ENUM.FAILED]: 'Task execution failed',
  [STATUS_ENUM.ON_HOLD]: 'Task is on hold pending review or action',
  [STATUS_ENUM.CANCELLED]: 'Task has been cancelled',
  [STATUS_ENUM.FAILED_REVISIONS_REQUESTED]:
    'Task was rejected; revisions have been requested',
};

/**
 * Status transitions - which statuses can transition to which
 * Format: { from: [to1, to2, ...] }
 */
export const VALID_STATUS_TRANSITIONS = {
  [STATUS_ENUM.PENDING]: [
    STATUS_ENUM.IN_PROGRESS,
    STATUS_ENUM.AWAITING_APPROVAL,
    STATUS_ENUM.ON_HOLD,
    STATUS_ENUM.CANCELLED,
  ],
  [STATUS_ENUM.IN_PROGRESS]: [
    STATUS_ENUM.PUBLISHED,
    STATUS_ENUM.FAILED,
    STATUS_ENUM.ON_HOLD,
    STATUS_ENUM.CANCELLED,
  ],
  [STATUS_ENUM.AWAITING_APPROVAL]: [
    STATUS_ENUM.APPROVED,
    STATUS_ENUM.REJECTED,
    STATUS_ENUM.ON_HOLD,
  ],
  [STATUS_ENUM.APPROVED]: [
    STATUS_ENUM.IN_PROGRESS,
    STATUS_ENUM.ON_HOLD,
    STATUS_ENUM.CANCELLED,
  ],
  [STATUS_ENUM.REJECTED]: [STATUS_ENUM.PENDING, STATUS_ENUM.ON_HOLD],
  [STATUS_ENUM.PUBLISHED]: [STATUS_ENUM.ON_HOLD, STATUS_ENUM.CANCELLED],
  [STATUS_ENUM.FAILED]: [STATUS_ENUM.PENDING, STATUS_ENUM.ON_HOLD],
  [STATUS_ENUM.ON_HOLD]: [
    STATUS_ENUM.PENDING,
    STATUS_ENUM.IN_PROGRESS,
    STATUS_ENUM.AWAITING_APPROVAL,
    STATUS_ENUM.CANCELLED,
  ],
  [STATUS_ENUM.CANCELLED]: [],
  [STATUS_ENUM.FAILED_REVISIONS_REQUESTED]: [
    STATUS_ENUM.PENDING,
    STATUS_ENUM.ON_HOLD,
  ],
};

/**
 * Check if a status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} - True if transition is valid
 */
export const isValidStatusTransition = (fromStatus, toStatus) => {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
};

/**
 * Get all possible transitions from a status
 * @param {string} status - Current status
 * @returns {string[]} - Array of valid target statuses
 */
export const getValidTransitions = (status) => {
  return VALID_STATUS_TRANSITIONS[status] || [];
};

/**
 * Human-readable display labels for statuses.
 * Converts snake_case to Title Case with custom overrides.
 * @param {string} status - Raw status string from API
 * @returns {string} - Display-friendly label
 */
const STATUS_DISPLAY_LABELS = {
  [STATUS_ENUM.FAILED_REVISIONS_REQUESTED]: 'Revisions Requested',
  [STATUS_ENUM.AWAITING_APPROVAL]: 'Awaiting Approval',
  [STATUS_ENUM.IN_PROGRESS]: 'In Progress',
  [STATUS_ENUM.ON_HOLD]: 'On Hold',
};

export const getStatusLabel = (status) => {
  if (STATUS_DISPLAY_LABELS[status]) {
    return STATUS_DISPLAY_LABELS[status];
  }
  // Default: capitalize first letter of snake_case
  return (status || 'unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
