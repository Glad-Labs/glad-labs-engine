/**
 * AuthorCard Component Tests
 *
 * Tests the author bio card rendered on post detail pages.
 * Verifies: Author name display, bio text, profile link, fallback behavior
 */
import { render, screen } from '@testing-library/react';
import { AuthorCard } from '../AuthorCard';

jest.mock('next/link', () => {
  return ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('AuthorCard Component', () => {
  it('should render the "About the Author" heading', () => {
    render(<AuthorCard authorId="poindexter-ai" authorName="Poindexter AI" />);
    expect(screen.getByText('About the Author')).toBeInTheDocument();
  });

  it('should display the provided author name', () => {
    render(<AuthorCard authorId="poindexter-ai" authorName="Poindexter AI" />);
    expect(screen.getByText('Poindexter AI')).toBeInTheDocument();
  });

  it('should display poindexter bio when authorId contains poindexter', () => {
    render(<AuthorCard authorId="poindexter-ai" authorName="Poindexter AI" />);
    expect(
      screen.getByText('AI Content Generation Engine')
    ).toBeInTheDocument();
  });

  it('should display default bio when authorId does not match poindexter', () => {
    render(<AuthorCard authorId="some-author" authorName="Some Author" />);
    expect(
      screen.getByText('Where AI meets thoughtful content creation')
    ).toBeInTheDocument();
  });

  it('should fall back to "Glad Labs" when authorName is not provided', () => {
    render(<AuthorCard authorId="some-author" />);
    expect(screen.getByText('Glad Labs')).toBeInTheDocument();
  });

  it('should render a link to the author page using authorId', () => {
    render(<AuthorCard authorId="poindexter-ai" authorName="Poindexter AI" />);
    const link = screen.getByRole('link', {
      name: /view more articles by poindexter ai/i,
    });
    expect(link).toHaveAttribute('href', '/author/poindexter-ai');
  });

  it('should link to /author/default when no authorId is provided', () => {
    render(<AuthorCard />);
    const link = screen.getByRole('link', {
      name: /view more articles/i,
    });
    expect(link).toHaveAttribute('href', '/author/default');
  });

  it('should render "View more articles" call-to-action text', () => {
    render(<AuthorCard authorId="test" authorName="Test" />);
    expect(screen.getByText(/view more articles/i)).toBeInTheDocument();
  });

  it('should render with no props without crashing', () => {
    const { container } = render(<AuthorCard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
