/**
 * PostNavigation Component Tests
 *
 * Tests the previous/next post navigation at the bottom of post pages.
 * Verifies: Link rendering, title display, date formatting, null handling
 */
import { render, screen } from '@testing-library/react';
import { PostNavigation } from '../PostNavigation';

jest.mock('next/link', () => {
  return ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

const makePost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  slug: 'test-post',
  content: 'Content',
  status: 'published',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  view_count: 0,
  published_at: '2024-06-15T10:00:00Z',
  ...overrides,
});

describe('PostNavigation Component', () => {
  it('should return null when both previousPost and nextPost are null', () => {
    const { container } = render(
      <PostNavigation previousPost={null} nextPost={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render previous post link when provided', () => {
    const prev = makePost({ title: 'Earlier Story', slug: 'prev-article' });
    render(<PostNavigation previousPost={prev} nextPost={null} />);

    expect(screen.getByText('Earlier Story')).toBeInTheDocument();
    expect(screen.getByText('Earlier Story').closest('a')).toHaveAttribute(
      'href',
      '/posts/prev-article'
    );
  });

  it('should render next post link when provided', () => {
    const next = makePost({ title: 'Upcoming Story', slug: 'next-article' });
    render(<PostNavigation previousPost={null} nextPost={next} />);

    expect(screen.getByText('Upcoming Story')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Story').closest('a')).toHaveAttribute(
      'href',
      '/posts/next-article'
    );
  });

  it('should render both previous and next post links', () => {
    const prev = makePost({ title: 'Older Post', slug: 'older' });
    const next = makePost({ title: 'Newer Post', slug: 'newer' });
    render(<PostNavigation previousPost={prev} nextPost={next} />);

    expect(screen.getByText('Older Post')).toBeInTheDocument();
    expect(screen.getByText('Newer Post')).toBeInTheDocument();
  });

  it('should display formatted publication dates', () => {
    const prev = makePost({
      title: 'Dated Post',
      slug: 'dated',
      published_at: '2024-06-15T10:00:00Z',
    });
    render(<PostNavigation previousPost={prev} nextPost={null} />);

    expect(screen.getByText(/Jun 15, 2024/)).toBeInTheDocument();
  });

  it('should not display date when published_at is missing', () => {
    const prev = makePost({
      title: 'No Date Post',
      slug: 'no-date',
      published_at: undefined,
    });
    render(<PostNavigation previousPost={prev} nextPost={null} />);

    expect(screen.getByText('No Date Post')).toBeInTheDocument();
    // No date element should be rendered
    const nav = screen.getByRole('navigation');
    expect(nav.querySelectorAll('.text-xs.text-slate-400')).toHaveLength(0);
  });

  it('should render nav landmark element', () => {
    const prev = makePost({ title: 'Nav Post', slug: 'nav' });
    render(<PostNavigation previousPost={prev} nextPost={null} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should show "Previous Article" and "Next Article" labels', () => {
    const prev = makePost({ title: 'P', slug: 'p' });
    const next = makePost({ title: 'N', slug: 'n' });
    render(<PostNavigation previousPost={prev} nextPost={next} />);

    expect(screen.getByText(/previous article/i)).toBeInTheDocument();
    expect(screen.getByText(/next article/i)).toBeInTheDocument();
  });
});
