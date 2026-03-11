import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import OrchestratorErrorMessage from '../OrchestratorErrorMessage';

const { mockFailExecution } = vi.hoisted(() => ({
  mockFailExecution: vi.fn(),
}));

vi.mock('../../store/useStore', () => ({
  default: vi.fn((selector) =>
    selector({ completeExecution: vi.fn(), failExecution: mockFailExecution })
  ),
}));

const baseMessage = {
  id: 'err-1',
  type: 'error',
  error: 'Database connection failed',
  errorType: 'DatabaseError',
  severity: 'error',
  details: {},
  suggestions: [],
  retryable: true,
  timestamp: Date.now(),
};

describe('OrchestratorErrorMessage', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders error message text', () => {
    render(<OrchestratorErrorMessage message={baseMessage} />);
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
  });

  it('shows "Error" as header label for error severity', () => {
    render(<OrchestratorErrorMessage message={baseMessage} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows "Warning" as header label for warning severity', () => {
    render(
      <OrchestratorErrorMessage
        message={{ ...baseMessage, severity: 'warning' }}
      />
    );
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('shows "Info" as header label for info severity', () => {
    render(
      <OrchestratorErrorMessage
        message={{ ...baseMessage, severity: 'info' }}
      />
    );
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('renders Retry button when retryable is true', () => {
    render(<OrchestratorErrorMessage message={baseMessage} />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('does not render Retry button when retryable is false', () => {
    render(
      <OrchestratorErrorMessage
        message={{ ...baseMessage, retryable: false }}
      />
    );
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('renders Cancel button regardless of retryable', () => {
    render(<OrchestratorErrorMessage message={baseMessage} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onRetry when Retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<OrchestratorErrorMessage message={baseMessage} onRetry={onRetry} />);
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel and failExecution when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<OrchestratorErrorMessage message={baseMessage} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(mockFailExecution).toHaveBeenCalledWith({ cancelled: true });
  });

  it('displays recovery suggestions in expanded content', () => {
    const msgWithSuggestions = {
      ...baseMessage,
      suggestions: ['Check database credentials', 'Verify network connectivity'],
    };
    render(<OrchestratorErrorMessage message={msgWithSuggestions} />);

    // Expand the card to reveal suggestions
    const expandButton = document.querySelector('.MuiIconButton-root');
    fireEvent.click(expandButton);

    expect(screen.getByText('Check database credentials')).toBeInTheDocument();
    expect(screen.getByText('Verify network connectivity')).toBeInTheDocument();
  });

  it('displays error phase detail when present', () => {
    const msgWithDetails = {
      ...baseMessage,
      details: { phase: 'Research', code: 'DB_TIMEOUT' },
    };
    render(<OrchestratorErrorMessage message={msgWithDetails} />);

    const expandButton = document.querySelector('.MuiIconButton-root');
    fireEvent.click(expandButton);

    expect(screen.getByText('Research')).toBeInTheDocument();
    expect(screen.getByText('DB_TIMEOUT')).toBeInTheDocument();
  });

  it('displays stack trace when present in details', () => {
    const msgWithStack = {
      ...baseMessage,
      details: { stackTrace: 'Error at line 42\n  at database.connect()' },
    };
    render(<OrchestratorErrorMessage message={msgWithStack} />);

    const expandButton = document.querySelector('.MuiIconButton-root');
    fireEvent.click(expandButton);

    expect(
      screen.getByText((content) => content.includes('Error at line 42'))
    ).toBeInTheDocument();
  });

  it('displays documentation link when present', () => {
    const msgWithDocs = {
      ...baseMessage,
      details: { documentation: 'https://docs.example.com/errors/db' },
    };
    render(<OrchestratorErrorMessage message={msgWithDocs} />);

    const expandButton = document.querySelector('.MuiIconButton-root');
    fireEvent.click(expandButton);

    const link = screen.getByText('View Documentation →');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://docs.example.com/errors/db');
  });

  it('shows errorType in metadata', () => {
    render(<OrchestratorErrorMessage message={baseMessage} />);
    expect(screen.getByText('DatabaseError')).toBeInTheDocument();
  });

  it('shows Retryable: Yes in metadata when retryable', () => {
    render(<OrchestratorErrorMessage message={baseMessage} />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('shows Retryable: No in metadata when not retryable', () => {
    render(
      <OrchestratorErrorMessage
        message={{ ...baseMessage, retryable: false }}
      />
    );
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('uses fallback error message when error field is missing', () => {
    const msgNoError = { ...baseMessage, error: undefined };
    render(<OrchestratorErrorMessage message={msgNoError} />);
    expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
  });
});
