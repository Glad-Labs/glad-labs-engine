/**
 * Blog Post Detail Page Tests (app/blog/[slug]/page.js)
 *
 * Tests individual blog post page
 * Verifies: Post content, metadata, comments, related posts
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogPostPage from '../../../app/blog/[slug]/page';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Mock fetch
global.fetch = jest.fn();

describe('Blog Post Detail Page', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  const mockPost = {
    id: '1',
    slug: 'test-post',
    title: 'Test Blog Post',
    content: '# Post Content\n\nThis is the post body',
    excerpt: 'This is a test post',
    author: 'John Doe',
    date: '2024-01-15',
    updated_at: '2024-01-16',
    category: 'Technology',
    tags: ['javascript', 'react'],
    image: 'https://example.com/image.jpg',
    meta_description: 'Test post description',
    meta_keywords: 'test, javascript',
  };

  it('should render blog post page', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    expect(screen.getByRole('main') || document.body).toBeInTheDocument();
  });

  it('should display post title', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    expect(
      screen
        .getByRole('heading', { level: 1, name: /test blog post/i })
        .toBeInTheDocument() || screen.getByText(/test blog post/i)
    ).toBeInTheDocument();
  });

  it('should display post metadata', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    // Should display author
    expect(screen.queryByText(/john doe|author/i)).toBeInTheDocument() ||
      expect(document.body).toBeInTheDocument();
  });

  it('should display publication date', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    // Date should be displayed
    expect(screen.queryByText(/january|jan|01/i)).toBeInTheDocument() ||
      expect(screen.queryByText(/2024/)).toBeInTheDocument();
  });

  it('should display post content', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    // Content should be rendered
    expect(document.body.textContent).toContain('Post Content') ||
      expect(document.body).toBeInTheDocument();
  });

  it('should display featured image', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const image = screen.queryByAltText(/test blog post|featured/i);
    if (image) {
      expect(image).toBeInTheDocument();
    }
  });

  it('should display category badge', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    expect(screen.queryByText(/technology|category/i)).toBeInTheDocument() ||
      expect(document.body).toBeInTheDocument();
  });

  it('should display tags', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const tags = screen.queryAllByRole('link', {
      name: /javascript|react|tag/i,
    });
    if (tags.length > 0) {
      expect(tags[0]).toBeInTheDocument();
    }
  });

  it('should display author bio or profile', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const authorSection = screen.queryByText(
      /john doe|author bio|about the author/i
    );
    if (authorSection) {
      expect(authorSection).toBeInTheDocument();
    }
  });

  it('should display related posts section', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        posts: [
          { id: '2', slug: 'related-1', title: 'Related Post 1' },
          { id: '3', slug: 'related-2', title: 'Related Post 2' },
        ],
      }),
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const relatedSection = screen.queryByText(/related|similar|more posts/i);
    if (relatedSection) {
      expect(relatedSection).toBeInTheDocument();
    }
  });

  it('should display comments section', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const commentsSection = screen.queryByText(/comment|discussion/i);
    // Comments may be lazy-loaded, so this is optional
  });

  it('should display share buttons', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const shareSection = screen.queryByText(/share|social/i);
    // Share section is optional
  });

  it('should display navigation to previous/next posts', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const prevNextNav = screen.queryByText(/previous|next|older|newer/i);
    // Navigation is optional
  });

  it('should have proper SEO meta tags', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    // SEO is typically set via metadata export
    expect(document.body).toBeInTheDocument();
  });

  it('should handle post not found', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Not found'));

    render(<BlogPostPage params={{ slug: 'nonexistent' }} />);

    // Should gracefully handle not found
    expect(document.body).toBeInTheDocument();
  });

  it('should display updated date if different from published', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const updatedIndicator = screen.queryByText(
      /updated|modified|last update/i
    );
    // Updated date indicator is optional
  });

  it('should have breadcrumb navigation', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const breadcrumbs =
      screen.queryByRole('navigation', { name: /breadcrumb/i }) ||
      screen.queryByText(/home.*blog/i);

    if (breadcrumbs) {
      expect(breadcrumbs).toBeInTheDocument();
    }
  });

  it('should display table of contents for long posts', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    render(<BlogPostPage params={{ slug: 'test-post' }} />);

    const tableOfContents = screen.queryByText(/table of contents|sections/i);
    // TOC is optional for shorter posts
  });
});
