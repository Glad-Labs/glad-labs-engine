import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import OrchestratorResultMessage from '../OrchestratorResultMessage';

// Mock OrchestratorMessageCard to avoid icon rendering issues with MUI Button startIcon
vi.mock('../OrchestratorMessageCard', () => ({
  default: ({
    children,
    headerLabel,
    metadata,
    expandedContent,
    footerActions,
  }) => (
    <div data-testid="orchestrator-card">
      <div data-testid="header-label">{headerLabel}</div>
      {metadata &&
        metadata.map((m, i) => (
          <span key={i} data-testid={`meta-${m.label}`}>
            {m.value}
          </span>
        ))}
      <div data-testid="card-content">{children}</div>
      {expandedContent && (
        <div data-testid="expanded-content">{expandedContent}</div>
      )}
      {footerActions &&
        footerActions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            data-testid={`action-${action.label}`}
          >
            {action.label}
          </button>
        ))}
    </div>
  ),
}));

const mockState = {
  completeExecution: vi.fn(),
  failExecution: vi.fn(),
};

vi.mock('../../store/useStore', () => ({
  default: vi.fn((selector) => selector(mockState)),
}));

const baseMessage = {
  id: 'msg-1',
  type: 'result',
  result: 'This is the generated blog post content.',
  metadata: {
    wordCount: 500,
    qualityScore: 8,
    cost: 0.025,
    executionTime: 12,
    model: 'claude-3-5-sonnet',
    provider: 'Anthropic',
  },
  timestamp: 1737032400000, // 2026-01-15T10:00:00.000Z — fixed for determinism
};

describe('OrchestratorResultMessage', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockState.completeExecution.mockClear();
    mockState.failExecution.mockClear();
  });

  it('renders "Result Ready" header label', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    expect(screen.getByTestId('header-label')).toHaveTextContent(
      'Result Ready'
    );
  });

  it('displays result preview text', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    // The result text appears in both preview and expandedContent sections
    expect(
      screen.getAllByText('This is the generated blog post content.').length
    ).toBeGreaterThan(0);
  });

  it('truncates long results at 500 characters with ellipsis', () => {
    const longResult = 'A'.repeat(600);
    render(
      <OrchestratorResultMessage
        message={{ ...baseMessage, result: longResult }}
      />
    );
    expect(screen.getByText(`${'A'.repeat(500)}...`)).toBeInTheDocument();
  });

  it('displays word count in metadata', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    expect(screen.getByTestId('meta-Words')).toHaveTextContent('500');
  });

  it('displays quality score as score/10 format', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    expect(screen.getByTestId('meta-Quality')).toHaveTextContent('8/10');
  });

  it('displays cost formatted to 3 decimal places', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    expect(screen.getByTestId('meta-Cost')).toHaveTextContent('$0.025');
  });

  it('shows N/A quality when qualityScore is absent', () => {
    const msg = { ...baseMessage, metadata: { wordCount: 300 } };
    render(<OrchestratorResultMessage message={msg} />);
    expect(screen.getByTestId('meta-Quality')).toHaveTextContent('N/A');
  });

  it('shows N/A cost when cost is absent', () => {
    const msg = { ...baseMessage, metadata: { wordCount: 300 } };
    render(<OrchestratorResultMessage message={msg} />);
    expect(screen.getByTestId('meta-Cost')).toHaveTextContent('N/A');
  });

  it('renders Approve, Reject, Copy, Export, Edit action buttons', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    expect(screen.getByTestId('action-Approve')).toBeInTheDocument();
    expect(screen.getByTestId('action-Reject')).toBeInTheDocument();
    expect(screen.getByTestId('action-Copy')).toBeInTheDocument();
    expect(screen.getByTestId('action-Export')).toBeInTheDocument();
    expect(screen.getByTestId('action-Edit')).toBeInTheDocument();
  });

  it('opens approve feedback dialog when Approve is clicked', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    fireEvent.click(screen.getByTestId('action-Approve'));
    expect(screen.getByText(/Approve Result/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Are you satisfied with this result/i)
    ).toBeInTheDocument();
  });

  it('opens reject feedback dialog when Reject is clicked', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    fireEvent.click(screen.getByTestId('action-Reject'));
    expect(screen.getByText(/Reject Result/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Why are you rejecting this result/i)
    ).toBeInTheDocument();
  });

  it('calls onApprove when feedback is submitted in approve dialog', () => {
    const onApprove = vi.fn();
    render(
      <OrchestratorResultMessage message={baseMessage} onApprove={onApprove} />
    );
    fireEvent.click(screen.getByTestId('action-Approve'));

    const textarea = screen.getByPlaceholderText(
      'Enter your feedback (optional)'
    );
    fireEvent.change(textarea, { target: { value: 'Great work!' } });

    // Submit button in dialog
    const approveButtons = screen.getAllByText('Approve');
    // Click the dialog submit button (not the card action button)
    fireEvent.click(approveButtons[approveButtons.length - 1]);

    expect(onApprove).toHaveBeenCalledWith({ feedback: 'Great work!' });
  });

  it('calls onReject when feedback is submitted in reject dialog', () => {
    const onReject = vi.fn();
    render(
      <OrchestratorResultMessage message={baseMessage} onReject={onReject} />
    );
    fireEvent.click(screen.getByTestId('action-Reject'));

    const textarea = screen.getByPlaceholderText(
      'Enter your feedback (optional)'
    );
    fireEvent.change(textarea, { target: { value: 'Not relevant enough.' } });

    const rejectButtons = screen.getAllByText('Reject');
    fireEvent.click(rejectButtons[rejectButtons.length - 1]);

    expect(onReject).toHaveBeenCalledWith({ feedback: 'Not relevant enough.' });
  });

  it('calls onEdit with result content when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<OrchestratorResultMessage message={baseMessage} onEdit={onEdit} />);
    fireEvent.click(screen.getByTestId('action-Edit'));
    expect(onEdit).toHaveBeenCalledWith(baseMessage.result);
  });

  it('copies result to clipboard when Copy is clicked', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    fireEvent.click(screen.getByTestId('action-Copy'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      baseMessage.result
    );
  });

  it('shows "Copied!" temporarily after copying', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<OrchestratorResultMessage message={baseMessage} />);
    fireEvent.click(screen.getByTestId('action-Copy'));
    expect(screen.getByTestId('action-Copied!')).toBeInTheDocument();
    await vi.runAllTimersAsync();
    expect(screen.getByTestId('action-Copy')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('closes feedback dialog when Cancel is clicked', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    fireEvent.click(screen.getByTestId('action-Approve'));
    expect(screen.getByText(/Approve Result/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText(/Approve Result/i)).not.toBeInTheDocument();
  });

  it('completeExecution is called with approved=true when approved', () => {
    render(<OrchestratorResultMessage message={baseMessage} />);
    // Open approve dialog
    fireEvent.click(screen.getByTestId('action-Approve'));
    // Dialog opens — click the "Approve" button inside the dialog (MUI DialogActions)
    // The dialog has "Cancel" and "Approve" buttons
    const dialogSubmitButton = screen.getAllByRole('button', {
      name: 'Approve',
    });
    // Click the last Approve button (in dialog, not in card)
    fireEvent.click(dialogSubmitButton[dialogSubmitButton.length - 1]);
    expect(mockState.completeExecution).toHaveBeenCalledWith({
      approved: true,
      feedback: '',
    });
  });
});
