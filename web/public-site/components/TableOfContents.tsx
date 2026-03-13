'use client';

import { useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

/**
 * Collapsible table of contents for blog post pages.
 * Renders a nested list of anchor links derived from the post headings.
 *
 * Accessibility:
 * - Toggle button exposes aria-expanded state to assistive technology (WCAG 4.1.2).
 * - focus-visible:ring-2 provides a visible focus ring for keyboard users (WCAG 2.4.7).
 *   focus:outline-none removes the default browser outline only when it would overlap
 *   the custom ring; the ring itself satisfies the visibility requirement.
 * - id="toc-list" on the list and aria-controls="toc-list" on the button allow ATs to
 *   identify the controlled region.
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 rounded-lg border border-slate-700 bg-slate-800/50 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          On this page
        </span>
        {/* focus:outline-none removes default browser outline; focus-visible:ring-2
            replaces it with a custom ring only when navigated by keyboard (WCAG 2.4.7). */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="toc-list"
          className="hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:rounded"
        >
          <svg
            className={`h-4 w-4 transform transition-transform text-slate-400 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="sr-only">
            {isOpen ? 'Collapse' : 'Expand'} table of contents
          </span>
        </button>
      </div>

      {isOpen && (
        <ol id="toc-list" className="mt-3 space-y-1">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
            >
              <a
                href={`#${heading.id}`}
                className="block text-sm text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:rounded"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
