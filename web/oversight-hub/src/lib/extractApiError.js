/**
 * Extracts a human-readable error message from any error value thrown by API calls.
 *
 * The cofounderAgentClient already normalizes FastAPI `detail`/`message` fields
 * into `error.message`, so callers only need to handle the top-level shapes below.
 *
 * @param {unknown} err - The caught error value
 * @returns {string} Human-readable error message suitable for display
 */
export function extractApiError(err) {
  if (!err) return 'Unknown error';

  if (typeof err === 'string') return err || 'Unknown error';

  if (err instanceof Error) {
    const msg = err.message || 'Unknown error';
    if (
      msg === 'Failed to fetch' ||
      msg.includes('NetworkError') ||
      msg.includes('ERR_CONNECTION')
    ) {
      return 'Cannot reach backend service (it may be restarting). Please wait a few seconds and try again.';
    }
    return msg;
  }

  // Plain object — inspect common API error shapes
  if (typeof err === 'object') {
    const detail = err.response?.detail ?? err.detail;
    if (detail) {
      return typeof detail === 'string' ? detail : JSON.stringify(detail);
    }
    const message = err.response?.message ?? err.message;
    if (message) {
      return typeof message === 'string' ? message : JSON.stringify(message);
    }
  }

  return 'Unknown error';
}
