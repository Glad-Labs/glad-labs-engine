import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDetailPanel from '../tasks/ErrorDetailPanel';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('ErrorDetailPanel Component', () => {
  it('should return null when task is null', () => {
    const { container } = render(<ErrorDetailPanel task={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when task status is not failed', () => {
    const { container } = render(
      <ErrorDetailPanel task={{ status: 'completed', id: '123' }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show primary error from task_metadata.error_message', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: { error_message: 'Connection timeout' },
        }}
      />
    );
    expect(screen.getByText('Connection timeout')).toBeInTheDocument();
  });

  it('should show primary error from task.error_message', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          error_message: 'Task failed unexpectedly',
        }}
      />
    );
    expect(
      screen.getByText('Task failed unexpectedly')
    ).toBeInTheDocument();
  });

  it('should show fallback error message when no error details are available', () => {
    render(
      <ErrorDetailPanel
        task={{ status: 'failed', id: '1234567890ab' }}
      />
    );
    // When no error_message exists, it generates a primary: "Task failed (Status: failed)"
    expect(screen.getByText(/Task failed/)).toBeInTheDocument();
  });

  it('should show task ID in debug info when no detailed error', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890abcdef',
          topic: 'Test Topic',
        }}
      />
    );
    // The task ID is shown truncated in debug info section
    expect(screen.getByText('1234567890ab...')).toBeInTheDocument();
  });

  it('should show secondary errors from metadata field', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: { error_message: 'Primary error' },
          metadata: { error_message: 'Secondary error from metadata' },
        }}
      />
    );
    expect(
      screen.getByText(/Secondary error from metadata/)
    ).toBeInTheDocument();
  });

  it('should show secondary errors from result field (string JSON)', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: { error_message: 'Primary error' },
          result: JSON.stringify({ error: 'Result error' }),
        }}
      />
    );
    expect(screen.getByText(/Result error/)).toBeInTheDocument();
  });

  it('should show expandable detailed info when metadata has stage/code', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: {
            error_message: 'LLM call failed',
            stage: 'research',
            message: 'API rate limited',
            error_code: 'RATE_LIMIT',
            error_type: 'APIError',
          },
        }}
      />
    );
    expect(screen.getByText('Detailed Information')).toBeInTheDocument();
  });

  it('should expand detailed info when clicked', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: {
            error_message: 'LLM call failed',
            stage: 'research',
            error_code: 'RATE_LIMIT',
          },
        }}
      />
    );

    fireEvent.click(screen.getByText('Detailed Information'));

    expect(screen.getByText('research')).toBeInTheDocument();
    expect(screen.getByText('RATE_LIMIT')).toBeInTheDocument();
  });

  it('should show task ID (truncated)', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890abcdef',
          task_metadata: { error_message: 'Error' },
        }}
      />
    );
    expect(screen.getByText('1234567890ab...')).toBeInTheDocument();
  });

  it('should show duration when started_at and completed_at are available', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: { error_message: 'Error' },
          started_at: '2026-03-10T10:00:00Z',
          completed_at: '2026-03-10T10:00:30Z',
        }}
      />
    );
    expect(screen.getByText('30 seconds')).toBeInTheDocument();
  });

  it('should handle error_details as JSON string in task_metadata', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: {
            error_message: 'Error',
            error_details: JSON.stringify({ code: 500, context: 'DB error' }),
          },
        }}
      />
    );

    // Expand to see details
    fireEvent.click(screen.getByText('Detailed Information'));
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('DB error')).toBeInTheDocument();
  });

  it('should handle error_details as object in task_metadata', () => {
    render(
      <ErrorDetailPanel
        task={{
          status: 'failed',
          id: '1234567890ab',
          task_metadata: {
            error_message: 'Error',
            error_details: { errorType: 'ValidationError' },
          },
        }}
      />
    );

    fireEvent.click(screen.getByText('Detailed Information'));
    expect(screen.getByText('ValidationError')).toBeInTheDocument();
  });
});
