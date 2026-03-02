/**
 * useTaskData.test.js - Unit tests for useTaskData hook
 *
 * Tests pagination, sorting, auto-refresh, error handling, and loading states
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskData } from './useTaskData';
import * as taskService from '../services/taskService';

vi.mock('../services/taskService');

describe('useTaskData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Initial Fetch', () => {
    it('should fetch tasks with default parameters on mount', async () => {
      const mockTasks = [
        { id: 1, name: 'Task 1', status: 'pending' },
        { id: 2, name: 'Task 2', status: 'completed' },
      ];

      taskService.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskData());

      expect(result.current.loading).toBe(true);
      expect(result.current.tasks).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tasks).toEqual(mockTasks);
      expect(taskService.getTasks).toHaveBeenCalledWith(0, 10, {
        sortBy: 'created_at',
        sortDirection: 'desc',
      });
    });

    it('should use custom pagination parameters', async () => {
      const mockTasks = [{ id: 1, name: 'Task 1' }];
      taskService.getTasks.mockResolvedValue(mockTasks);

      renderHook(() => useTaskData(2, 20, 'name', 'asc'));

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledWith(10, 20, {
          sortBy: 'name',
          sortDirection: 'asc',
        });
      });
    });
  });

  describe('Pagination', () => {
    it('should calculate correct offset for different pages', async () => {
      taskService.getTasks.mockResolvedValue([]);

      const { rerender } = renderHook(
        ({ page, limit }) => useTaskData(page, limit),
        { initialProps: { page: 1, limit: 10 } }
      );

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledWith(
          0,
          10,
          expect.any(Object)
        );
      });

      vi.clearAllMocks();
      taskService.getTasks.mockResolvedValue([]);

      // Move to page 3
      rerender({ page: 3, limit: 10 });

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledWith(
          20,
          10,
          expect.any(Object)
        );
      });
    });

    it('should handle custom limit per page', async () => {
      taskService.getTasks.mockResolvedValue([]);

      renderHook(() => useTaskData(1, 50));

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledWith(
          0,
          50,
          expect.any(Object)
        );
      });
    });

    it('should set total tasks count', async () => {
      const mockTasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
      taskService.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskData(1, 10));

      await waitFor(() => {
        expect(result.current.total).toBeGreaterThan(0);
      });
    });
  });

  describe('Sorting', () => {
    it('should fetch with specified sort field', async () => {
      taskService.getTasks.mockResolvedValue([]);

      renderHook(() => useTaskData(1, 10, 'status', 'asc'));

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledWith(0, 10, {
          sortBy: 'status',
          sortDirection: 'asc',
        });
      });
    });

    it('should refetch when sort parameters change', async () => {
      taskService.getTasks.mockResolvedValue([]);

      const { rerender } = renderHook(
        ({ sortBy }) => useTaskData(1, 10, sortBy, 'desc'),
        { initialProps: { sortBy: 'created_at' } }
      );

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledTimes(1);
      });

      vi.clearAllMocks();
      taskService.getTasks.mockResolvedValue([]);

      rerender({ sortBy: 'name' });

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledWith(0, 10, {
          sortBy: 'name',
          sortDirection: 'desc',
        });
      });
    });
  });

  describe('Auto-refresh', () => {
    it('should auto-refresh tasks every 30 seconds', async () => {
      taskService.getTasks.mockResolvedValue([{ id: 1, name: 'Task 1' }]);

      renderHook(() => useTaskData());

      // Initial fetch
      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledTimes(2);
      });
    });

    it('should not prevent manual refetch during auto-refresh', async () => {
      taskService.getTasks.mockResolvedValue([{ id: 1, name: 'Task 1' }]);

      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      // Trigger manual refresh
      act(() => {
        result.current.fetchTasks?.();
      });

      await waitFor(() => {
        expect(taskService.getTasks).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network error';
      taskService.getTasks.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error).toContain('Unable to load tasks');
      expect(result.current.tasks).toEqual([]);
    });

    it('should clear previous error on successful fetch', async () => {
      const mockTasks = [{ id: 1, name: 'Task 1' }];

      // First request fails
      taskService.getTasks.mockRejectedValueOnce(new Error('Error'));
      const { result, rerender } = renderHook(({ page }) => useTaskData(page), {
        initialProps: { page: 1 },
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // Second request succeeds
      vi.clearAllMocks();
      taskService.getTasks.mockResolvedValue(mockTasks);

      rerender({ page: 2 });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.tasks).toEqual(mockTasks);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading on initial fetch', async () => {
      taskService.getTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskData());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set isFetching during requests', async () => {
      taskService.getTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      expect(taskService.getTasks).toHaveBeenCalled();
    });
  });

  describe('Concurrent Request Prevention', () => {
    it('should prevent concurrent fetch requests', async () => {
      taskService.getTasks.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve([{ id: 1 }]), 100))
      );

      const { result } = renderHook(() => useTaskData());

      // Manually trigger fetches while one is in progress
      act(() => {
        result.current.fetchTasks?.();
      });

      act(() => {
        result.current.fetchTasks?.();
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      await waitFor(() => {
        // Should only call once despite multiple attempts
        expect(taskService.getTasks).toHaveBeenCalledTimes(2); // Initial + manual (2nd prevented)
      });
    });
  });

  describe('Return Values', () => {
    it('should expose all required properties', async () => {
      taskService.getTasks.mockResolvedValue([{ id: 1, name: 'Task 1' }]);

      const { result } = renderHook(() => useTaskData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('tasks');
      expect(result.current).toHaveProperty('allTasks');
      expect(result.current).toHaveProperty('total');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isFetching');
    });
  });
});
