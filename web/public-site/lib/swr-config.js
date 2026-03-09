/**
 * Shared SWR configuration for the public site.
 *
 * Provides a default fetcher that handles error responses and a set of
 * sensible defaults suitable for a content-heavy public site.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_FASTAPI_URL ||
  'http://localhost:8000';

/**
 * Default SWR fetcher. Prepends API_BASE when the key is a path (starts with /).
 * Throws an error with the HTTP status code on non-OK responses.
 */
export async function fetcher(key) {
  const url = key.startsWith('/') ? `${API_BASE}${key}` : key;
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(`API error: ${res.status} ${res.statusText}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Default SWR options for public-site data fetching.
 * - revalidateOnFocus: false — avoids unnecessary re-fetches when users switch tabs
 * - dedupingInterval: 60s — deduplicate requests within 1 minute windows
 * - revalidateIfStale: true — revalidate in background when data exists in cache
 */
export const defaultSwrOptions = {
  fetcher,
  revalidateOnFocus: false,
  dedupingInterval: 60_000,
  revalidateIfStale: true,
};
