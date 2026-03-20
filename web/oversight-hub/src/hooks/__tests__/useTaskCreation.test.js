/**
 * useTaskCreation Hook Tests
 *
 * Tests task creation, form validation, API integration, and error handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { mockMakeRequest } = vi.hoisted(() => ({
  mockMakeRequest: vi.fn(),
}));

vi.mock('../../services/cofounderAgentClient', () => ({
  makeRequest: mockMakeRequest,
}));

import useTaskCreation from '../useTaskCreation';

describe('useTaskCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with isSubmitting=false and no error', () => {
      const { result } = renderHook(() => useTaskCreation());
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('validation', () => {
    it('sets error when taskType is missing', async () => {
      const { result } = renderHook(() => useTaskCreation());
      await act(async () => {
        await expect(
          result.current.submit({
            taskType: '',
            formData: { topic: 'AI' },
            modelSelection: {},
          })
        ).rejects.toThrow('Please select a task type');
      });
      expect(result.current.error).toBe('Please select a task type');
      expect(result.current.isSubmitting).toBe(false);
    });

    it('sets error when formData is empty', async () => {
      const { result } = renderHook(() => useTaskCreation());
      await act(async () => {
        await expect(
          result.current.submit({
            taskType: 'blog_post',
            formData: {},
            modelSelection: {},
          })
        ).rejects.toThrow('Please fill in the required fields');
      });
      expect(result.current.error).toBe('Please fill in the required fields');
    });
  });

  describe('successful blog_post creation', () => {
    it('calls makeRequest with correct payload and invokes onSuccess', async () => {
      mockMakeRequest.mockResolvedValueOnce({
        success: true,
        id: 'task-abc123',
        task_id: 'task-abc123',
      });
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskCreation(onSuccess));

      await act(async () => {
        await result.current.submit({
          taskType: 'blog_post',
          formData: { topic: 'AI trends', task_name: 'My Article' },
          modelSelection: { qualityPreference: 'balanced' },
        });
      });

      expect(mockMakeRequest).toHaveBeenCalledWith(
        '/api/tasks/create',
        'POST',
        expect.objectContaining({
          task_type: 'blog_post',
          quality_preference: 'balanced',
        }),
        false,
        null,
        30000
      );
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('sets error and does NOT call onSuccess when API returns success=false', async () => {
      mockMakeRequest.mockResolvedValueOnce({
        success: false,
        error: 'Quota exceeded',
      });
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskCreation(onSuccess));

      await act(async () => {
        await expect(
          result.current.submit({
            taskType: 'blog_post',
            formData: { topic: 'AI' },
            modelSelection: {},
          })
        ).rejects.toThrow('Quota exceeded');
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Quota exceeded');
    });
  });

  describe('image_generation task type', () => {
    it('calls image endpoint first, then task creation endpoint', async () => {
      mockMakeRequest
        .mockResolvedValueOnce({ success: true, images: ['http://img.jpg'] })
        .mockResolvedValueOnce({ success: true, id: 'task-img-1' });
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTaskCreation(onSuccess));

      await act(async () => {
        await result.current.submit({
          taskType: 'image_generation',
          formData: { description: 'A robot', count: 2, style: 'cartoon' },
          modelSelection: {},
        });
      });

      // First call: image generation
      expect(mockMakeRequest).toHaveBeenNthCalledWith(
        1,
        '/api/media/generate-image',
        'POST',
        { prompt: 'A robot', count: 2, style: 'cartoon' },
        false,
        null,
        120000
      );
      // Second call: task creation with image_urls
      expect(mockMakeRequest).toHaveBeenNthCalledWith(
        2,
        '/api/tasks/create',
        'POST',
        expect.objectContaining({ image_urls: ['http://img.jpg'] }),
        false,
        null,
        30000
      );
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('throws when image generation fails', async () => {
      mockMakeRequest.mockResolvedValueOnce({
        success: false,
        error: 'Image service unavailable',
      });
      const { result } = renderHook(() => useTaskCreation());

      await act(async () => {
        await expect(
          result.current.submit({
            taskType: 'image_generation',
            formData: { description: 'A cat' },
            modelSelection: {},
          })
        ).rejects.toThrow('Image service unavailable');
      });

      // Task creation endpoint should NOT be called
      expect(mockMakeRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('API error handling', () => {
    it('sets error from thrown Error object', async () => {
      mockMakeRequest.mockRejectedValueOnce(new Error('Network timeout'));
      const { result } = renderHook(() => useTaskCreation());

      await act(async () => {
        await expect(
          result.current.submit({
            taskType: 'blog_post',
            formData: { topic: 'AI' },
            modelSelection: {},
          })
        ).rejects.toThrow('Network timeout');
      });

      expect(result.current.error).toBe('Network timeout');
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('clearError', () => {
    it('clears existing error', async () => {
      mockMakeRequest.mockRejectedValueOnce(new Error('fail'));
      const { result } = renderHook(() => useTaskCreation());

      await act(async () => {
        await result.current
          .submit({
            taskType: 'blog_post',
            formData: { topic: 'AI' },
            modelSelection: {},
          })
          .catch(() => {});
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
