import logger from '@/lib/logger';
import type { MetadataRoute } from 'next';

/**
 * Type definitions for sitemap content
 */
interface Post {
  slug: string;
  updated_at?: string;
  published_at?: string;
  // Legacy camelCase variants (in case API format changes)
  updatedAt?: string;
  publishedAt?: string;
}

interface Category {
  slug: string;
}

interface Tag {
  slug: string;
}

/**
 * Dynamic Sitemap Generation for Next.js 15
 *
 * This generates yourdomain.com/sitemap.xml from Postgres data.
 * Automatically indexes all published posts, categories, and tags.
 *
 * Google will crawl this immediately on deployment.
 */

// Import FastAPI client to query published posts
async function fetchPublishedContent() {
  // Note: This runs at runtime via ISR, not during the initial Vercel build.
  // The sitemap is regenerated periodically (Next.js default: every request).

  const FASTAPI_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_FASTAPI_URL ||
    'http://localhost:8000';

  // Validate that FASTAPI_URL is a valid absolute URL
  let isValidUrl = false;
  try {
    new URL(FASTAPI_URL);
    isValidUrl = true;
  } catch {
    logger.warn(
      'Invalid NEXT_PUBLIC_FASTAPI_URL during build. Using static fallback.'
    );
  }

  // If URL is invalid, return empty results (use static pages only)
  if (!isValidUrl) {
    logger.log(
      'NEXT_PUBLIC_FASTAPI_URL is invalid. Skipping dynamic content fetch.'
    );
    return { allPosts: [], allCategories: [], allTags: [] };
  }

  // Skip fetching when using the default localhost fallback (no real API configured).
  // In local dev, the homepage and archive pages fetch from localhost directly,
  // but the sitemap should only include dynamic content when a real API is available.
  const isLocalhost =
    FASTAPI_URL.includes('localhost') || FASTAPI_URL.includes('127.0.0.1');
  const hasExplicitApiUrl =
    Boolean(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    Boolean(process.env.NEXT_PUBLIC_FASTAPI_URL);
  if (isLocalhost && !hasExplicitApiUrl) {
    logger.log(
      'No API URL configured (using localhost fallback). Skipping dynamic sitemap content.'
    );
    return { allPosts: [], allCategories: [], allTags: [] };
  }

  const API_BASE = `${FASTAPI_URL}/api`;
  const FETCH_TIMEOUT = 10_000; // 10s timeout per request — avoid 60s build hangs

  try {
    // Fetch all published posts with pagination (API max limit is 100)
    let allPosts: Post[] = [];
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      const postsResponse = await fetch(
        `${API_BASE}/posts?offset=${skip}&limit=${limit}&published_only=true`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!postsResponse.ok) break;

      const pageJson = await postsResponse.json();
      const pageData = pageJson.posts || pageJson.data || [];
      if (pageData.length === 0) {
        hasMore = false;
      } else {
        allPosts = [...allPosts, ...pageData];
        skip += limit;
      }
    }

    // Fetch all categories
    const catController = new AbortController();
    const catTimeoutId = setTimeout(() => catController.abort(), FETCH_TIMEOUT);
    const categoriesResponse = await fetch(`${API_BASE}/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: catController.signal,
    });
    clearTimeout(catTimeoutId);
    const catJson = categoriesResponse.ok
      ? await categoriesResponse.json()
      : {};
    const allCategories = catJson.categories || catJson.data || [];

    // Fetch all tags
    const tagController = new AbortController();
    const tagTimeoutId = setTimeout(() => tagController.abort(), FETCH_TIMEOUT);
    const tagsResponse = await fetch(`${API_BASE}/tags`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: tagController.signal,
    });
    clearTimeout(tagTimeoutId);
    const tagJson = tagsResponse.ok ? await tagsResponse.json() : {};
    const allTags = tagJson.tags || tagJson.data || [];

    return { allPosts, allCategories, allTags };
  } catch (error) {
    logger.error('Error fetching content for sitemap:', error);
    return { allPosts: [], allCategories: [], allTags: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gladlabs.io';
  const { allPosts, allCategories, allTags } = await fetchPublishedContent();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/archive/1`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Legal pages
  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/data-requests`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Blog posts — API returns snake_case fields (updated_at, published_at)
  const postPages: MetadataRoute.Sitemap = (allPosts || []).map(
    (post: Post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified:
        post.updated_at || post.updatedAt
          ? new Date((post.updated_at || post.updatedAt)!)
          : new Date(post.published_at || post.publishedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
  );

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = (allCategories || []).map(
    (category: Category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
  );

  // Tag pages
  const tagPages: MetadataRoute.Sitemap = (allTags || []).map((tag: Tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...legalPages,
    ...postPages,
    ...categoryPages,
    ...tagPages,
  ];
}
