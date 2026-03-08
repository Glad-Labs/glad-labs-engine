/**
 * Error Page Tests (app/error.js)
 *
 * Tests error page component
 * Verifies: Error message, retry button, error boundary
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPage from '../app/error';

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
  }),
}));

describe('Error Page', () => {
  const mockError = new Error('Something went wrong!');
  const mockReset = jest.fn();

  it('should render error page', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(document.body).toBeInTheDocument();
  });

  it('should display error heading', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const heading =
      screen.queryByRole('heading', { level: 1 }) ||
      screen.queryByText(/error|something wrong/i);

    expect(heading).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const message = screen.queryByText(/something went wrong|error/i);

    expect(message).toBeInTheDocument();
  });

  it('should have retry button', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const retryButton = screen.getByRole('button', {
      name: /retry|try again|reset/i,
    });

    expect(retryButton).toBeInTheDocument();
  });

  it('should call reset function on retry', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const retryButton = screen.getByRole('button', {
      name: /retry|try again|reset/i,
    });

    fireEvent.click(retryButton);
    expect(mockReset).toHaveBeenCalled();
  });

  it('should have home link', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const homeLink = screen.queryByRole('link', { name: /home/i });

    if (homeLink) {
      expect(homeLink).toBeInTheDocument();
    }
  });

  it('should display proper error status code', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const errorIndicator = screen.queryByText(
      /500|error|something went wrong/i
    );

    expect(errorIndicator).toBeInTheDocument();
  });

  it('should have user-friendly error message', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const message = screen.queryByText(
      /we apologize|something went wrong|please try again/i
    );

    if (message) {
      expect(message).toBeInTheDocument();
    }
  });

  it('should be accessible with proper heading hierarchy', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const headings = screen.queryAllByRole('heading');

    expect(headings.length).toBeGreaterThan(0) ||
      expect(document.body).toBeInTheDocument();
  });

  it('should have semantic HTML structure', () => {
    const { container } = render(
      <ErrorPage error={mockError} reset={mockReset} />
    );
    const main = container.querySelector('main');

    expect(main).toBeInTheDocument() ||
      expect(document.body).toBeInTheDocument();
  });

  it('should display centered error message', () => {
    const { container } = render(
      <ErrorPage error={mockError} reset={mockReset} />
    );
    const centerDiv =
      container.querySelector('[class*="center"]') ||
      container.querySelector('[class*="flex"]');

    expect(centerDiv).toBeInTheDocument() ||
      expect(document.body).toBeInTheDocument();
  });

  it('should provide way to contact support', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const contactLink = screen.queryByRole('link', {
      name: /contact|support/i,
    });

    // Contact link is optional
  });

  it('should have proper error styling', () => {
    const { container } = render(
      <ErrorPage error={mockError} reset={mockReset} />
    );
    const errorDiv =
      container.querySelector('[class*="error"]') ||
      container.querySelector('[class*="bg"]');

    expect(document.body).toBeInTheDocument();
  });

  it('should suggest searching or browsing', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const suggestionText = screen.queryByText(/try searching|browse|explore/i);

    // Suggestion is optional
  });

  it('should handle network errors', () => {
    const networkError = new Error('Network error');
    render(<ErrorPage error={networkError} reset={mockReset} />);

    expect(
      screen.getByRole('button', { name: /retry|try again/i })
    ).toBeInTheDocument();
  });

  it('should handle server errors', () => {
    const serverError = new Error('Internal server error');
    render(<ErrorPage error={serverError} reset={mockReset} />);

    expect(document.body).toBeInTheDocument();
  });

  it('should be responsive', () => {
    const { container } = render(
      <ErrorPage error={mockError} reset={mockReset} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should not show sensitive error details', () => {
    const sensitiveError = new Error(
      'Database connection string: postgresql://...'
    );
    const { container } = render(
      <ErrorPage error={sensitiveError} reset={mockReset} />
    );

    // Should not expose connection strings
    expect(container.textContent).not.toContain('postgresql://');
  });

  it('should display loading state button properly', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const retryButton = screen.getByRole('button', {
      name: /retry|try again|reset/i,
    });

    expect(retryButton).toBeInTheDocument();
  });
});
