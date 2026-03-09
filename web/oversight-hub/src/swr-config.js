/**
 * Shared SWR configuration for the Oversight Hub.
 *
 * Provides an auth-aware fetcher and sensible defaults for the admin dashboard.
 */

import { getAuthHeaders } from './lib/authClient';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_FASTAPI_URL ||
  'http://localhost:8000';

/**
 * Auth-aware SWR fetcher. Prepends API_BASE for path-style keys.
 * Throws on non-OK responses with the HTTP status code attached.
 */
export async function fetcher(key) {
  const url = key.startsWith('/') ? `${API_BASE}${key}` : key;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const error = new Error(`API error: ${res.status} ${res.statusText}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Default SWR options for the oversight dashboard.
 * - refreshInterval: 30s — dashboard data auto-refreshes
 * - revalidateOnFocus: true — refresh when user returns to tab
 * - dedupingInterval: 10s — short window since dashboard is real-time
 */
export const defaultSwrOptions = {
  fetcher,
  refreshInterval: 30_000,
  revalidateOnFocus: true,
  dedupingInterval: 10_000,
};
