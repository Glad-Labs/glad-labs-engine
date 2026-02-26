'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const GiscusComments = dynamic(
  () =>
    import('./GiscusComments').catch((err) => {
      console.error('Failed to load GiscusComments:', err);
      return {
        default: () => (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 my-8">
            <div className="flex gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Comments Unavailable
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  The comments system failed to load. Please refresh the page or
                  try again later.
                </p>
              </div>
            </div>
          </div>
        ),
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="text-slate-400 text-sm">Loading comments...</div>
    ),
  }
);

interface GiscusWrapperProps {
  postSlug: string;
  postTitle: string;
}

export function GiscusWrapper({ postSlug, postTitle }: GiscusWrapperProps) {
  return <GiscusComments postSlug={postSlug} postTitle={postTitle} />;
}
