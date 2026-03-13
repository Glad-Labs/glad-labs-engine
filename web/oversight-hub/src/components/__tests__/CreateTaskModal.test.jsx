import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
  },
}));

vi.mock('@/lib/extractApiError', () => ({
  extractApiError: (err) => err?.message || 'Unknown error',
}));

const mockCreateTask = vi.fn();
const mockMakeRequest = vi.fn();
vi.mock('../../services/cofounderAgentClient', () => ({
  createTask: (...args) => mockCreateTask(...args),
  makeRequest: (...args) => mockMakeRequest(...args),
}));

// Mock heavy child components that have their own API calls
vi.mock('../ModelSelectionPanel', () => ({
  default: ({ onSelectionChange }) => (
    <div data-testid="model-selection-panel">
      <button
        onClick={() =>
          onSelectionChange({
            modelSelections: { research: 'auto' },
            qualityPreference: 'balanced',
            estimatedCost: 0.015,
          })
        }
      >
        ModelPanel
      </button>
    </div>
  ),
}));

vi.mock('../WritingStyleSelector', () => ({
  WritingStyleSelector: ({ onChange }) => (
    <div data-testid="writing-style-selector">
      <button onClick={() => onChange('style-123')}>SelectStyle</button>
    </div>
  ),
}));

import CreateTaskModal from '../tasks/CreateTaskModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onTaskCreated: vi.fn(),
};

describe('CreateTaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <CreateTaskModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal header when open', () => {
    render(<CreateTaskModal {...defaultProps} />);
    expect(screen.getByText(/Create New Task/)).toBeInTheDocument();
  });

  it('shows task type selection by default', () => {
    render(<CreateTaskModal {...defaultProps} />);
    expect(screen.getByText('Select Task Type')).toBeInTheDocument();
  });

  it('displays all 5 task type options', () => {
    render(<CreateTaskModal {...defaultProps} />);
    // Each type shows both a title and description div — use getAllByText
    expect(screen.getAllByText(/Blog Post/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Social Media Post/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Email Campaign/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Content Brief/i).length).toBeGreaterThanOrEqual(
      1
    );
    expect(
      screen.getAllByText(/Image Generation/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('calls onClose when X button is clicked', () => {
    render(<CreateTaskModal {...defaultProps} />);
    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches to the blog post form when Blog Post is clicked', () => {
    render(<CreateTaskModal {...defaultProps} />);
    // The button contains "📝 Blog Post" in an inner div — click the first button that includes blog post text
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);

    // Should now show the blog post form fields
    expect(screen.getByText('← Back to Task Types')).toBeInTheDocument();
    expect(screen.getByLabelText(/Topic/)).toBeInTheDocument();
  });

  it('returns to task type selection when Back button is clicked', () => {
    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);
    fireEvent.click(screen.getByText('← Back to Task Types'));

    expect(screen.getByText('Select Task Type')).toBeInTheDocument();
  });

  it('shows writing style selector for blog post type', () => {
    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);

    expect(screen.getByTestId('writing-style-selector')).toBeInTheDocument();
  });

  it('shows model selection panel for blog post type', () => {
    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);

    expect(screen.getByTestId('model-selection-panel')).toBeInTheDocument();
  });

  it('shows validation error when submitting without required fields', async () => {
    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);

    // Clear topic field and submit
    const topicInput = screen.getByLabelText(/Topic/);
    fireEvent.change(topicInput, { target: { value: '' } });

    const submitBtn = screen.getByText(/Create Task/);
    fireEvent.click(submitBtn);

    // Should show validation error about required field
    await waitFor(() => {
      expect(screen.getByText(/is required/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel button is clicked from form view', () => {
    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('submits blog post successfully and calls onTaskCreated', async () => {
    const newTask = { id: 'new-task-id', task_type: 'blog_post' };
    mockCreateTask.mockResolvedValueOnce(newTask);

    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);

    // Fill required fields — use id selector since labels contain asterisk spans
    fireEvent.change(document.getElementById('topic'), {
      target: { value: 'AI trends 2026' },
    });

    // Select style (required) — native select
    fireEvent.change(document.getElementById('style'), {
      target: { value: 'technical' },
    });

    // Select tone (required)
    fireEvent.change(document.getElementById('tone'), {
      target: { value: 'professional' },
    });

    // word_count has a defaultValue of 1500 so it should already be set
    fireEvent.click(screen.getByText(/Create Task/));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task_type: 'blog_post',
          topic: 'AI trends 2026',
        })
      );
    });

    await waitFor(() => {
      expect(defaultProps.onTaskCreated).toHaveBeenCalledWith(newTask);
    });
  });

  it('shows error message when task creation fails', async () => {
    mockCreateTask.mockRejectedValueOnce(new Error('Server error'));

    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);

    fireEvent.change(document.getElementById('topic'), {
      target: { value: 'Test topic' },
    });
    fireEvent.change(document.getElementById('style'), {
      target: { value: 'technical' },
    });
    fireEvent.change(document.getElementById('tone'), {
      target: { value: 'professional' },
    });

    fireEvent.click(screen.getByText(/Create Task/));

    await waitFor(() => {
      expect(screen.getByText(/Failed to create task/i)).toBeInTheDocument();
    });
  });

  it('shows the social media form fields when Social Media Post is selected', () => {
    render(<CreateTaskModal {...defaultProps} />);
    const socialBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Social Media Post'));
    fireEvent.click(socialBtn);

    expect(screen.getByLabelText(/Topic/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Platform/)).toBeInTheDocument();
  });

  it('shows Creating... while submitting', async () => {
    let resolveCreate;
    mockCreateTask.mockReturnValueOnce(
      new Promise((res) => {
        resolveCreate = res;
      })
    );

    render(<CreateTaskModal {...defaultProps} />);
    const blogPostBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent.includes('Blog Post'));
    fireEvent.click(blogPostBtn);

    fireEvent.change(document.getElementById('topic'), {
      target: { value: 'Test topic' },
    });
    fireEvent.change(document.getElementById('style'), {
      target: { value: 'technical' },
    });
    fireEvent.change(document.getElementById('tone'), {
      target: { value: 'professional' },
    });

    fireEvent.click(screen.getByText(/Create Task/));

    expect(screen.getByText('Creating...')).toBeInTheDocument();

    resolveCreate({ id: 'new-id' });
    await waitFor(() => {
      expect(screen.queryByText('Creating...')).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// a11y — issue #761: dialog role, aria attributes, Escape close
// ---------------------------------------------------------------------------

describe('CreateTaskModal — a11y: dialog semantics (issue #761)', () => {
  const onClose = vi.fn();
  const onTaskCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('modal container has role="dialog" when open', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={onClose}
        onTaskCreated={onTaskCreated}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('modal container has aria-modal="true"', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={onClose}
        onTaskCreated={onTaskCreated}
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('modal container has aria-labelledby="create-task-dialog-title"', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={onClose}
        onTaskCreated={onTaskCreated}
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute(
      'aria-labelledby',
      'create-task-dialog-title'
    );
  });

  it('h2 heading has id="create-task-dialog-title"', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={onClose}
        onTaskCreated={onTaskCreated}
      />
    );
    const heading = document.getElementById('create-task-dialog-title');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('pressing Escape calls onClose', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={onClose}
        onTaskCreated={onTaskCreated}
      />
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('close button has aria-label="Close dialog"', () => {
    render(
      <CreateTaskModal
        isOpen={true}
        onClose={onClose}
        onTaskCreated={onTaskCreated}
      />
    );
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' });
    expect(closeBtn).toBeInTheDocument();
  });
});
