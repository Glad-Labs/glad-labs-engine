/**
 * useTaskData Hook Tests
 *
 * Tests task fetching, pagination, state management, and error handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const { mockGetTasks, mockLogError } = vi.hoisted(() => ({
  mockGetTasks: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('../../services/taskService', () => ({
  getTasks: mockGetTasks,
}));

vi.mock('../../services/errorLoggingService', () => ({
  logError: mockLogError,
}));

import { useTaskData } from '../useTaskData';

const SAMPLE_TASKS = Array.from({ length: 25 }, (_, i) => ({
  id: `task-${i}`,
  task_name: `Task ${i}`,
  status: 'pending',
  created_at: new Date().toISOString(),
}));

describe('useTaskData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial fetch', () => {
    it('starts in loading state', () => {
      mockGetTasks.mockResolvedValue([]);
      const { result } = renderHook(() => useTaskData());
      expect(result.current.loading).toBe(true);
    });

    it('fetches tasks on mount and sets allTasks', async () => {
      mockGetTasks.mockResolvedValue(SAMPLE_TASKS);
      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allTasks).toHaveLength(25);
      expect(result.current.total).toBe(25);
      expect(result.current.error).toBeNull();
    });

    it('handles empty task list', async () => {
      mockGetTasks.mockResolvedValue([]);
      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allTasks).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });
  });

  describe('pagination', () => {
    it('returns first page of tasks when page=1, limit=10', async () => {
      mockGetTasks.mockResolvedValue(SAMPLE_TASKS);
      const { result } = renderHook(() => useTaskData(1, 10));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tasks).toHaveLength(10);
      expect(result.current.tasks[0].id).toBe('task-0');
      expect(result.current.tasks[9].id).toBe('task-9');
    });

    it('returns correct page for page=2, limit=10', async () => {
      mockGetTasks.mockResolvedValue(SAMPLE_TASKS);
      const { result } = renderHook(() => useTaskData(2, 10));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tasks).toHaveLength(10);
      expect(result.current.tasks[0].id).toBe('task-10');
    });

    it('returns partial last page', async () => {
      mockGetTasks.mockResolvedValue(SAMPLE_TASKS);
      const { result } = renderHook(() => useTaskData(3, 10));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 25 tasks, page 3 with limit 10 → tasks 20-24 (5 items)
      expect(result.current.tasks).toHaveLength(5);
      expect(result.current.tasks[0].id).toBe('task-20');
    });
  });

  describe('error handling', () => {
    it('sets error state on fetch failure', async () => {
      mockGetTasks.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('Network error');
      expect(result.current.allTasks).toHaveLength(0);
    });

    it('calls logError on fetch failure', async () => {
      const err = new Error('DB timeout');
      mockGetTasks.mockRejectedValue(err);
      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLogError).toHaveBeenCalledWith(
        err,
        expect.objectContaining({ severity: 'warning' })
      );
    });
  });

  describe('setTasks and setAllTasks', () => {
    it('setTasks updates tasks state', async () => {
      mockGetTasks.mockResolvedValue([]);
      const { result } = renderHook(() => useTaskData());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newTasks = [{ id: 'new-1', task_name: 'New Task' }];
      act(() => {
        result.current.setTasks(newTasks);
      });

      expect(result.current.tasks).toEqual(newTasks);
    });

    it('setAllTasks updates allTasks and total', async () => {
      mockGetTasks.mockResolvedValue([]);
      const { result } = renderHook(() => useTaskData());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const newAll = [{ id: 'a' }, { id: 'b' }];
      act(() => {
        result.current.setAllTasks(newAll);
      });

      expect(result.current.allTasks).toEqual(newAll);
      expect(result.current.total).toBe(2);
    });
  });

  describe('manual refetch', () => {
    it('fetchTasks triggers a new API call', async () => {
      mockGetTasks.mockResolvedValue(SAMPLE_TASKS);
      const { result } = renderHook(() => useTaskData());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const firstCallCount = mockGetTasks.mock.calls.length;

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(mockGetTasks.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });
});
