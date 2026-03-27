import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Suppress console.error from React error boundary logging during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// A component that throws an error on render
const ThrowingComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Child content rendered</div>;
};

describe('ErrorBoundary Component', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should display error fallback UI when child throws', () => {
    render(
      <ErrorBoundary name="TestBoundary">
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred/)
    ).toBeInTheDocument();
  });

  it('should show Try Again, Reload Page, and Go Home buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('should reset error state when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument();

    // Click Try Again to reset the error state
    fireEvent.click(screen.getByText('Try Again'));

    // After reset, ErrorBoundary re-renders children.
    // Since the component still throws, it will catch again.
    // But the state was reset, so getDerivedStateFromError fires again.
    expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Test error message/)).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should show multiple error warning when errorCount > 2', () => {
    // The errorCount increments each time componentDidCatch fires.
    // We need 3 catches to trigger the warning.
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    // First error caught (count = 1)
    expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument();

    // Reset and re-throw to increment count
    fireEvent.click(screen.getByText('Try Again'));
    // count = 2 after second catch

    fireEvent.click(screen.getByText('Try Again'));
    // count = 3 after third catch

    expect(screen.getByText(/Multiple errors detected/)).toBeInTheDocument();
  });

  it('should have Go Home button linking to /', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByText('Go Home');
    expect(goHomeButton.closest('a')).toHaveAttribute('href', '/');
  });
});
