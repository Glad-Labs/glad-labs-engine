/**
 * PostCategories Component Tests
 *
 * Tests the category badge/link displayed on post pages.
 * Verifies: Category rendering, link generation, null handling
 */
import { render, screen } from '@testing-library/react';
import { PostCategories } from '../PostCategories';

jest.mock('next/link', () => {
  return ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('PostCategories Component', () => {
  it('should return null when neither categoryId nor categoryName is provided', () => {
    const { container } = render(<PostCategories />);
    expect(container.firstChild).toBeNull();
  });

  it('should render category name as a link', () => {
    render(<PostCategories categoryId="tech" categoryName="Technology" />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/category/tech');
  });

  it('should generate slug from category name when categoryId is missing', () => {
    render(<PostCategories categoryName="AI & Machine Learning" />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/category/ai-&-machine-learning'
    );
  });

  it('should display "Category:" label', () => {
    render(<PostCategories categoryId="tech" categoryName="Technology" />);
    expect(screen.getByText('Category:')).toBeInTheDocument();
  });

  it('should not render link when categoryName is missing but categoryId is present', () => {
    // Component only renders the Link when categoryName is truthy
    render(<PostCategories categoryId="tech" />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('should handle category name with spaces by converting to slug', () => {
    render(<PostCategories categoryName="Web Development" />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/category/web-development'
    );
  });
});
