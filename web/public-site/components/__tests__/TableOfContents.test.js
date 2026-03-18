/**
 * TableOfContents Component Tests
 *
 * Tests the collapsible table of contents sidebar.
 * Verifies: Heading rendering, collapse/expand, empty state, accessibility
 */
import { render, screen, fireEvent } from '@testing-library/react';
import TableOfContents from '../TableOfContents';

const mockHeadings = [
  { id: 'introduction', text: 'Introduction', level: 2 },
  { id: 'getting-started', text: 'Getting Started', level: 2 },
  { id: 'sub-section', text: 'Sub Section', level: 3 },
  { id: 'conclusion', text: 'Conclusion', level: 2 },
];

describe('TableOfContents Component', () => {
  it('should return null when headings array is empty', () => {
    const { container } = render(<TableOfContents headings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when headings is undefined', () => {
    const { container } = render(<TableOfContents headings={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render all heading links', () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Sub Section')).toBeInTheDocument();
    expect(screen.getByText('Conclusion')).toBeInTheDocument();
  });

  it('should render heading links as anchor tags with correct hrefs', () => {
    render(<TableOfContents headings={mockHeadings} />);
    const introLink = screen.getByText('Introduction');
    expect(introLink.tagName).toBe('A');
    expect(introLink).toHaveAttribute('href', '#introduction');
  });

  it('should display "On this page" label', () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('should be expanded by default', () => {
    render(<TableOfContents headings={mockHeadings} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Introduction')).toBeVisible();
  });

  it('should collapse when toggle button is clicked', () => {
    render(<TableOfContents headings={mockHeadings} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Introduction')).not.toBeInTheDocument();
  });

  it('should expand again when toggle button is clicked twice', () => {
    render(<TableOfContents headings={mockHeadings} />);
    const button = screen.getByRole('button');

    fireEvent.click(button); // collapse
    fireEvent.click(button); // expand

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });

  it('should render a nav landmark with aria-label', () => {
    render(<TableOfContents headings={mockHeadings} />);
    const nav = screen.getByRole('navigation', {
      name: /table of contents/i,
    });
    expect(nav).toBeInTheDocument();
  });

  it('should have aria-controls on the toggle button', () => {
    render(<TableOfContents headings={mockHeadings} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-controls', 'toc-list');
  });

  it('should indent level 3 headings deeper than level 2', () => {
    render(<TableOfContents headings={mockHeadings} />);
    const subItem = screen.getByText('Sub Section').closest('li');
    const topItem = screen.getByText('Introduction').closest('li');
    // level 3 gets paddingLeft of 1rem (level - 2 = 1), level 2 gets 0rem
    expect(subItem).toHaveStyle({ paddingLeft: '1rem' });
    expect(topItem).toHaveStyle({ paddingLeft: '0rem' });
  });

  it('should show screen-reader-only collapse/expand text', () => {
    render(<TableOfContents headings={mockHeadings} />);
    expect(screen.getByText(/collapse table of contents/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/expand table of contents/i)).toBeInTheDocument();
  });
});
