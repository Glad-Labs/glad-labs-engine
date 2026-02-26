'use client';

import { useEffect, useRef } from 'react';

interface GiscusCommentsProps {
  postSlug: string;
  postTitle: string;
}

/**
 * Giscus Comments Component
 *
 * GitHub Discussions-powered comments system using pathname mapping
 * (comments are tied to the URL path, not individual posts)
 *
 * Configuration:
 * - Repo: Glad-Labs/glad-labs-codebase
 * - Category: Announcements (for categorizing discussions)
 * - Mapping: pathname (uses URL path to organize comments)
 * - Theme: Auto-detects user's system theme preference
 */
export default function GiscusComments({
  postSlug,
  postTitle,
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if Giscus is configured
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    if (!repo || !repoId || !categoryId || !containerRef.current) {
      console.warn('❌ Giscus not configured. Check .env.local for:');
      console.warn('  - NEXT_PUBLIC_GISCUS_REPO');
      console.warn('  - NEXT_PUBLIC_GISCUS_REPO_ID');
      console.warn('  - NEXT_PUBLIC_GISCUS_CATEGORY_ID');
      return;
    }

    const container = containerRef.current;
    // Clear any previous Giscus instance
    container.innerHTML = '';

    // Create and configure Giscus script
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    // GitHub repository configuration
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', categoryId);

    // Mapping strategy: pathname means comments are tied to URL path
    // e.g., /posts/my-blog-post will share comments across visits
    script.setAttribute('data-mapping', 'pathname');

    // UI Configuration
    script.setAttribute('data-strict', '0'); // Allow all origins
    script.setAttribute('data-reactions-enabled', '1'); // Enable reactions/emojis
    script.setAttribute('data-emit-metadata', '1'); // Send metadata events
    script.setAttribute('data-input-position', 'top'); // Comment box at top
    script.setAttribute('data-theme', 'preferred_color_scheme'); // Auto Dark/Light
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy'); // Load only when visible

    // Add error and load handlers
    script.onerror = () => {
      console.error('❌ Failed to load Giscus comments script from CDN');
      if (container) {
        container.innerHTML = `
          <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 my-8">
            <p class="text-sm text-red-800 dark:text-red-200">
              Comments failed to load. Please check your internet connection and refresh the page.
            </p>
          </div>
        `;
      }
    };

    script.onload = () => {
      console.log('✅ Giscus script loaded successfully');
    };

    // Append script to trigger Giscus initialization
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup on unmount if needed
      if (container) {
        const giscusFrame = container.querySelector('iframe.giscus-frame');
        if (giscusFrame) {
          giscusFrame.remove();
        }
      }
    };
  };, [repo, repoId, categoryId, postSlug]);

  // Show configuration hint if not set up
  if (!repo || !repoId || !categoryId) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 my-8">
        <div className="flex gap-3">
          <div className="text-2xl">💬</div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Comments Not Configured
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Giscus comments are ready to use! Complete the setup:
            </p>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-decimal">
              <li>
                GitHub discussions are enabled in Glad-Labs/glad-labs-codebase
              </li>
              <li>Giscus app is installed on the repo</li>
              <li>
                Environment variables are set in{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  .env.local
                </code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-12">
      {/* Comments Section Header */}
      <div className="border-t border-slate-700 pt-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Comments</h2>
        <p className="text-slate-400 text-sm mb-6">
          Powered by GitHub Discussions. Sign in with your GitHub account to
          comment.
        </p>

        {/* Giscus will load here */}
        <div ref={containerRef} className="giscus-container" />
      </div>
    </div>
  );
}
