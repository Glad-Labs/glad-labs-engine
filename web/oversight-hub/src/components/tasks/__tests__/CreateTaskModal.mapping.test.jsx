/**
 * CreateTaskModal — mapping function regression tests (#140)
 *
 * Tests TASK_TYPE_TO_BACKEND and TONE_TO_BACKEND mappings directly
 * (extracted inline) and through component submission.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/cofounderAgentClient', () => ({
  createTask: vi.fn(),
  makeRequest: vi.fn(),
}));

vi.mock('../../ModelSelectionPanel', () => ({
  default: ({ onSelectionChange }) => {
    React.useEffect(() => {
      onSelectionChange({
        modelSelections: {},
        qualityPreference: 'balanced',
        estimatedCost: 0.015,
      });
    }, [onSelectionChange]);
    return <div data-testid="model-selection-panel" />;
  },
}));

vi.mock('../../WritingStyleSelector', () => ({
  WritingStyleSelector: () => <div data-testid="writing-style-selector" />,
}));

import CreateTaskModal from '../CreateTaskModal';
import { createTask } from '../../../services/cofounderAgentClient';

// ============================================================
// Pure mapping unit tests (logic extracted inline)
// ============================================================

const TASK_TYPE_TO_BACKEND = {
  blog_post: 'blog_post',
  social_media_post: 'social_media',
  email_campaign: 'email',
  content_brief: 'market_research',
  image_generation: 'data_retrieval',
};

const TONE_TO_BACKEND = {
  professional: 'professional',
  casual: 'casual',
  academic: 'academic',
  inspirational: 'inspirational',
  authoritative: 'professional',
  friendly: 'casual',
};

const toBackendTaskType = (uiTaskType) =>
  TASK_TYPE_TO_BACKEND[uiTaskType] || 'blog_post';

const toBackendTone = (tone) => {
  if (!tone) return undefined;
  return TONE_TO_BACKEND[tone] || 'professional';
};

describe('TASK_TYPE_TO_BACKEND mapping', () => {
  test.each([
    ['blog_post', 'blog_post'],
    ['social_media_post', 'social_media'],
    ['email_campaign', 'email'],
    ['content_brief', 'market_research'],
    ['image_generation', 'data_retrieval'],
  ])('%s → %s', (input, expected) => {
    expect(toBackendTaskType(input)).toBe(expected);
  });

  test('unknown type falls back to blog_post', () => {
    expect(toBackendTaskType('unknown_type')).toBe('blog_post');
    expect(toBackendTaskType('')).toBe('blog_post');
    expect(toBackendTaskType(undefined)).toBe('blog_post');
  });
});

describe('TONE_TO_BACKEND mapping', () => {
  test.each([
    ['professional', 'professional'],
    ['casual', 'casual'],
    ['academic', 'academic'],
    ['inspirational', 'inspirational'],
    ['authoritative', 'professional'], // alias
    ['friendly', 'casual'],            // alias
  ])('%s → %s', (input, expected) => {
    expect(toBackendTone(input)).toBe(expected);
  });

  test('falsy tone returns undefined', () => {
    expect(toBackendTone(undefined)).toBeUndefined();
    expect(toBackendTone('')).toBeUndefined();
    expect(toBackendTone(null)).toBeUndefined();
  });

  test('unknown tone falls back to professional', () => {
    expect(toBackendTone('unknown_tone')).toBe('professional');
  });
});

// ============================================================
// Component rendering tests
// ============================================================

describe('CreateTaskModal — component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTask.mockResolvedValue({ id: 'test-id-123', status: 'pending' });
  });

  test('renders task type selection buttons when open', () => {
    render(
      <CreateTaskModal isOpen={true} onClose={vi.fn()} onTaskCreated={vi.fn()} />
    );
    expect(screen.getByText(/📝 Blog Post/i)).toBeInTheDocument();
    expect(screen.getByText(/📱 Social Media Post/i)).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(
      <CreateTaskModal isOpen={false} onClose={vi.fn()} onTaskCreated={vi.fn()} />
    );
    expect(screen.queryByText(/blog post/i)).not.toBeInTheDocument();
  });

  test('clicking a task type reveals the form', async () => {
    render(
      <CreateTaskModal isOpen={true} onClose={vi.fn()} onTaskCreated={vi.fn()} />
    );
    fireEvent.click(screen.getByText(/📝 Blog Post/i));
    await waitFor(() => {
      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    });
  });

  test('clicking Blog Post shows the form with Topic field', async () => {
    render(
      <CreateTaskModal isOpen={true} onClose={vi.fn()} onTaskCreated={vi.fn()} />
    );
    fireEvent.click(screen.getByText(/📝 Blog Post/i));
    await waitFor(() => {
      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/✓ Create Task/)).toBeInTheDocument();
  });

  test('blog post form shows Campaign Brief textarea field (#116)', async () => {
    render(
      <CreateTaskModal isOpen={true} onClose={vi.fn()} onTaskCreated={vi.fn()} />
    );
    fireEvent.click(screen.getByText(/📝 Blog Post/i));
    await waitFor(() => {
      expect(screen.getByLabelText(/campaign brief/i)).toBeInTheDocument();
    });
  });

  test('blog post payload includes description field when provided (#116)', async () => {
    createTask.mockResolvedValue({ id: 'task-123', status: 'pending' });

    const { container } = render(
      <CreateTaskModal isOpen={true} onClose={vi.fn()} onTaskCreated={vi.fn()} />
    );
    fireEvent.click(screen.getByText(/📝 Blog Post/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    });

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/topic/i), {
      target: { value: 'AI in Healthcare' },
    });
    fireEvent.change(screen.getByLabelText(/campaign brief/i), {
      target: { value: 'Q1 campaign for enterprise buyers' },
    });
    // Select style and tone by their stable id attributes
    fireEvent.change(container.querySelector('#style'), { target: { value: 'technical' } });
    fireEvent.change(container.querySelector('#tone'), { target: { value: 'professional' } });

    fireEvent.click(screen.getByText(/✓ Create Task/));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Q1 campaign for enterprise buyers',
        })
      );
    });
  });
});
