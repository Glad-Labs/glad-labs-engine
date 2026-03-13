/**
 * useWorkflowExecution Hook Tests
 *
 * Tests polling lifecycle, terminal state detection, and error handling.
 *
 * Note on fake timers: vi.useFakeTimers() controls setInterval but async
 * Promises still run on the microtask queue. We use vi.runAllTimersAsync()
 * (Vitest >= 1.0) which also flushes pending microtasks after advancing timers.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const {
  mockGetExecutionStatus,
  mockCreateWorkflow,
  mockUpdateWorkflow,
  mockExecuteWorkflow,
} = vi.hoisted(() => ({
  mockGetExecutionStatus: vi.fn(),
  mockCreateWorkflow: vi.fn(),
  mockUpdateWorkflow: vi.fn(),
  mockExecuteWorkflow: vi.fn(),
}));

vi.mock('../../services/workflowBuilderService', () => ({
  getExecutionStatus: mockGetExecutionStatus,
  createWorkflow: mockCreateWorkflow,
  updateWorkflow: mockUpdateWorkflow,
  executeWorkflow: mockExecuteWorkflow,
}));

import useWorkflowExecution from '../useWorkflowExecution';

describe('useWorkflowExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('returns null executionId and null executionStatus initially', () => {
      const { result } = renderHook(() => useWorkflowExecution());
      expect(result.current.executionId).toBeNull();
      expect(result.current.executionStatus).toBeNull();
      expect(result.current.executionProgress).toBe(0);
    });

    it('returns empty pollingError and errorMessage initially', () => {
      const { result } = renderHook(() => useWorkflowExecution());
      expect(result.current.executionPollingError).toBe('');
      expect(result.current.executionErrorMessage).toBe('');
    });
  });

  describe('polling lifecycle', () => {
    it('does not call getExecutionStatus when executionId is null', async () => {
      vi.useFakeTimers();
      renderHook(() => useWorkflowExecution());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      expect(mockGetExecutionStatus).not.toHaveBeenCalled();
    });

    it('polls immediately when executionId is set', async () => {
      mockGetExecutionStatus.mockResolvedValue({
        execution_status: 'running',
        progress_percent: 25,
      });
      vi.useFakeTimers();
      const { result } = renderHook(() => useWorkflowExecution());

      await act(async () => {
        result.current.setExecutionId('exec-poll-1');
        // Let the initial poll fire
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(mockGetExecutionStatus).toHaveBeenCalledWith('exec-poll-1');
    });

    it('updates status and progress from poll response', async () => {
      mockGetExecutionStatus.mockResolvedValue({
        execution_status: 'running',
        progress_percent: 50,
        phase_results: { phase1: 'done' },
      });
      vi.useFakeTimers();
      const { result } = renderHook(() => useWorkflowExecution());

      await act(async () => {
        result.current.setExecutionId('exec-poll-2');
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(result.current.executionStatus).toBe('running');
      expect(result.current.executionProgress).toBe(50);
    });

    it('stops polling when status reaches "completed"', async () => {
      mockGetExecutionStatus
        .mockResolvedValueOnce({
          execution_status: 'running',
          progress_percent: 80,
        })
        .mockResolvedValueOnce({
          execution_status: 'completed',
          progress_percent: 100,
        });

      vi.useFakeTimers();
      const { result } = renderHook(() => useWorkflowExecution());

      // Set executionId and fire the immediate poll (running)
      await act(async () => {
        result.current.setExecutionId('exec-complete');
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(result.current.executionStatus).toBe('running');

      // Advance 2 s for interval poll (completed)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(result.current.executionStatus).toBe('completed');

      const callCountAtCompletion = mockGetExecutionStatus.mock.calls.length;

      // Advance 3 more intervals — no new polls should occur
      await act(async () => {
        await vi.advanceTimersByTimeAsync(6000);
      });
      expect(mockGetExecutionStatus.mock.calls.length).toBe(
        callCountAtCompletion
      );
    });

    it('stops polling on unmount', async () => {
      mockGetExecutionStatus.mockResolvedValue({
        execution_status: 'running',
        progress_percent: 30,
      });

      vi.useFakeTimers();
      const { result, unmount } = renderHook(() => useWorkflowExecution());

      await act(async () => {
        result.current.setExecutionId('exec-unmount');
        await vi.advanceTimersByTimeAsync(50);
      });

      const callCountBeforeUnmount = mockGetExecutionStatus.mock.calls.length;
      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6000);
      });

      expect(mockGetExecutionStatus.mock.calls.length).toBe(
        callCountBeforeUnmount
      );
    });
  });

  describe('error handling during polling', () => {
    it('sets executionPollingError on network failure', async () => {
      mockGetExecutionStatus.mockRejectedValue(new Error('Connection refused'));
      vi.useFakeTimers();
      const { result } = renderHook(() => useWorkflowExecution());

      await act(async () => {
        result.current.setExecutionId('exec-err-1');
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(result.current.executionPollingError).toBe('Connection refused');
    });

    it('does NOT set pollingError for 404 (execution not found yet)', async () => {
      const notFoundErr = new Error('404 not found');
      notFoundErr.status = 404;
      mockGetExecutionStatus.mockRejectedValue(notFoundErr);

      vi.useFakeTimers();
      const { result } = renderHook(() => useWorkflowExecution());

      await act(async () => {
        result.current.setExecutionId('exec-not-found');
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(result.current.executionPollingError).toBe('');
    });
  });

  describe('startExecution', () => {
    beforeEach(() => {
      vi.useRealTimers(); // startExecution tests don't need fake timers
    });

    it('creates a new workflow when workflow has no id', async () => {
      mockCreateWorkflow.mockResolvedValue({ id: 'wf-new-1' });
      mockExecuteWorkflow.mockResolvedValue({
        execution_id: 'exec-new-1',
        status: 'pending',
      });
      // Prevent polling loop from interfering
      mockGetExecutionStatus.mockResolvedValue({
        execution_status: 'pending',
        progress_percent: 0,
      });

      const { result } = renderHook(() => useWorkflowExecution());

      await act(async () => {
        await result.current.startExecution({
          workflow: {},
          isPersistedWorkflow: false,
          definition: { name: 'Test workflow', phases: [] },
        });
      });

      expect(mockCreateWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test workflow' })
      );
      expect(mockExecuteWorkflow).toHaveBeenCalledWith(
        'wf-new-1',
        expect.objectContaining({ topic: 'Test workflow' })
      );
      expect(result.current.executionId).toBe('exec-new-1');
    });

    it('updates existing workflow when isPersistedWorkflow=true', async () => {
      mockUpdateWorkflow.mockResolvedValue({ id: 'wf-existing-1' });
      mockExecuteWorkflow.mockResolvedValue({
        execution_id: 'exec-upd-1',
        status: 'pending',
      });
      mockGetExecutionStatus.mockResolvedValue({
        execution_status: 'pending',
        progress_percent: 0,
      });

      const { result } = renderHook(() => useWorkflowExecution());

      await act(async () => {
        await result.current.startExecution({
          workflow: { id: 'wf-existing-1' },
          isPersistedWorkflow: true,
          definition: { name: 'Updated workflow', phases: [] },
        });
      });

      expect(mockUpdateWorkflow).toHaveBeenCalledWith(
        'wf-existing-1',
        expect.any(Object)
      );
      expect(result.current.executionId).toBe('exec-upd-1');
    });

    it('calls onHistoryRefresh with persisted workflow id', async () => {
      mockCreateWorkflow.mockResolvedValue({ id: 'wf-hist-1' });
      mockExecuteWorkflow.mockResolvedValue({
        execution_id: 'exec-hist-1',
        status: 'pending',
      });
      mockGetExecutionStatus.mockResolvedValue({
        execution_status: 'pending',
        progress_percent: 0,
      });

      const onHistoryRefresh = vi.fn();
      const { result } = renderHook(() =>
        useWorkflowExecution({ onHistoryRefresh })
      );

      await act(async () => {
        await result.current.startExecution({
          workflow: {},
          isPersistedWorkflow: false,
          definition: { name: 'History test' },
        });
      });

      expect(onHistoryRefresh).toHaveBeenCalledWith('wf-hist-1');
    });
  });
});
