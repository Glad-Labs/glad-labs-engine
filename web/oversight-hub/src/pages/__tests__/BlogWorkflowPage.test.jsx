/**
 * BlogWorkflowPage.jsx tests
 *
 * Covers:
 * - Initial render: title, stepper, Design Workflow step shown
 * - Error state when loading phases fails
 * - Step navigation
 * - Execute workflow calls apiClient.executeWorkflow
 * - Execution error surfaces to user
 * - Topic field is pre-filled with default value
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BlogWorkflowPage from '../BlogWorkflowPage';

// ── mock @/lib/apiClient ─────────────────────────────────────────────────────
const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: {
    getAvailablePhases: vi.fn(),
    listWorkflowExecutions: vi.fn(),
    executeWorkflow: vi.fn(),
    getWorkflowProgress: vi.fn(),
    getWorkflowResults: vi.fn(),
    cancelWorkflowExecution: vi.fn(),
  },
}));

vi.mock('../../lib/apiClient', () => ({
  default: mockApiClient,
}));

// ── helpers ─────────────────────────────────────────────────────────────────
const SAMPLE_PHASES = [
  {
    name: 'blog_generate_content',
    label: 'Generate Content',
    description: 'Generates blog content',
    tags: ['blog'],
  },
];

function renderPage() {
  return render(<BlogWorkflowPage />);
}

// ── tests ────────────────────────────────────────────────────────────────────
describe('BlogWorkflowPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiClient.getAvailablePhases.mockResolvedValue(SAMPLE_PHASES);
    mockApiClient.listWorkflowExecutions.mockResolvedValue({ executions: [] });
    mockApiClient.executeWorkflow.mockResolvedValue({
      execution_id: 'exec-123',
    });
    mockApiClient.getWorkflowProgress.mockResolvedValue({
      status: 'running',
      progress: 50,
    });
    mockApiClient.getWorkflowResults.mockResolvedValue({
      content: 'Generated content',
    });
    mockApiClient.cancelWorkflowExecution.mockResolvedValue({
      status: 'cancelled',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial render', () => {
    it('renders the page title', async () => {
      renderPage();
      await waitFor(() => {
        expect(
          screen.getByText(/Blog Post Workflow Builder/i)
        ).toBeInTheDocument();
      });
    });

    it('calls getAvailablePhases on mount', async () => {
      renderPage();
      await waitFor(() => {
        expect(mockApiClient.getAvailablePhases).toHaveBeenCalledTimes(1);
      });
    });

    it('calls listWorkflowExecutions on mount', async () => {
      renderPage();
      await waitFor(() => {
        expect(mockApiClient.listWorkflowExecutions).toHaveBeenCalledTimes(1);
      });
    });

    it('renders the stepper with Design Workflow step', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Design Workflow')).toBeInTheDocument();
        expect(screen.getByText('Configure Parameters')).toBeInTheDocument();
      });
    });

    it('shows Select Workflow Phases card on first step', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Select Workflow Phases/i)).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('shows error when loading phases fails', async () => {
      mockApiClient.getAvailablePhases.mockRejectedValue(
        new Error('Network error')
      );
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Failed to load phases/i)).toBeInTheDocument();
      });
    });
  });

  describe('step navigation', () => {
    it('navigates to Configure Parameters step', async () => {
      renderPage();
      // Wait for phases to load
      await waitFor(() => {
        expect(screen.getByText(/Select Workflow Phases/i)).toBeInTheDocument();
      });

      // Click "Next: Configure Parameters" button
      const nextBtn = screen.getByRole('button', {
        name: /Next: Configure Parameters/i,
      });
      fireEvent.click(nextBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Configure Workflow Parameters/i)
        ).toBeInTheDocument();
      });
    });

    it('shows topic field with default value after navigating to step 1', async () => {
      renderPage();
      await waitFor(() =>
        expect(screen.getByText(/Select Workflow Phases/i)).toBeInTheDocument()
      );

      fireEvent.click(
        screen.getByRole('button', { name: /Next: Configure Parameters/i })
      );

      await waitFor(() => {
        // MUI TextField renders the value in an <input> element
        const topicInput = screen.getByDisplayValue(
          'Artificial Intelligence in Healthcare'
        );
        expect(topicInput).toBeInTheDocument();
      });
    });
  });

  describe('workflow execution', () => {
    async function navigateToExecuteStep() {
      // Step 0 → Step 1
      fireEvent.click(
        screen.getByRole('button', { name: /Next: Configure Parameters/i })
      );
      await waitFor(() =>
        expect(
          screen.getByText(/Configure Workflow Parameters/i)
        ).toBeInTheDocument()
      );
      // Step 1 → Step 2
      fireEvent.click(
        screen.getByRole('button', { name: /Execute Workflow/i })
      );
      await waitFor(() =>
        expect(screen.getByText(/Start Workflow/i)).toBeInTheDocument()
      );
    }

    it('calls executeWorkflow when Start Workflow button is clicked', async () => {
      renderPage();
      await waitFor(() =>
        expect(mockApiClient.getAvailablePhases).toHaveBeenCalled()
      );

      await navigateToExecuteStep();

      const startBtn = screen.getByRole('button', { name: /Start Workflow/i });
      fireEvent.click(startBtn);

      await waitFor(() => {
        expect(mockApiClient.executeWorkflow).toHaveBeenCalledTimes(1);
      });
    });

    it('shows error message when executeWorkflow throws', async () => {
      mockApiClient.executeWorkflow.mockRejectedValue(
        new Error('Server error')
      );
      renderPage();
      await waitFor(() =>
        expect(mockApiClient.getAvailablePhases).toHaveBeenCalled()
      );

      await navigateToExecuteStep();

      const startBtn = screen.getByRole('button', { name: /Start Workflow/i });
      fireEvent.click(startBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to execute workflow/i)
        ).toBeInTheDocument();
      });
    });
  });
});
