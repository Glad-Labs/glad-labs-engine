import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskMetadataDisplay from '../tasks/TaskMetadataDisplay';

// Mock the logger to avoid noise
vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('TaskMetadataDisplay Component', () => {
  it('should return null when task is null', () => {
    const { container } = render(<TaskMetadataDisplay task={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the metadata header', () => {
    render(<TaskMetadataDisplay task={{ id: '123', status: 'completed' }} />);
    expect(screen.getByText(/Metadata & Metrics/)).toBeInTheDocument();
  });

  it('should display category from task', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', category: 'Technology' }}
      />
    );
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('should display target audience', () => {
    render(
      <TaskMetadataDisplay
        task={{
          id: '123',
          status: 'completed',
          target_audience: 'Developers',
        }}
      />
    );
    expect(screen.getByText('Developers')).toBeInTheDocument();
  });

  it('should display task status with color', () => {
    render(<TaskMetadataDisplay task={{ id: '123', status: 'completed' }} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('should display quality score when available', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', quality_score: 85.5 }}
      />
    );
    expect(screen.getByText(/85.50\/100/)).toBeInTheDocument();
    expect(screen.getByText(/Good/)).toBeInTheDocument();
  });

  it('should display Not rated when quality score is absent', () => {
    render(<TaskMetadataDisplay task={{ id: '123', status: 'completed' }} />);
    expect(screen.getByText('Not rated')).toBeInTheDocument();
  });

  it('should display model used', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', model_used: 'gpt-4' }}
      />
    );
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
  });

  it('should display task type', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', task_type: 'blog_post' }}
      />
    );
    expect(screen.getByText('blog_post')).toBeInTheDocument();
  });

  it('should display published status', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', is_published: true }}
      />
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should display Not published when is_published is false', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', is_published: false }}
      />
    );
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should display execution time when started_at and completed_at are set', () => {
    const started = new Date('2026-03-10T10:00:00Z');
    const completed = new Date('2026-03-10T10:05:00Z');

    render(
      <TaskMetadataDisplay
        task={{
          id: '123',
          status: 'completed',
          started_at: started.toISOString(),
          completed_at: completed.toISOString(),
        }}
      />
    );
    // "5 mins" — the component formats as N min or N mins
    expect(screen.getByText(/5 min/)).toBeInTheDocument();
  });

  it('should handle JSON string task_metadata', () => {
    render(
      <TaskMetadataDisplay
        task={{
          id: '123',
          status: 'completed',
          task_metadata: JSON.stringify({ category: 'Finance' }),
        }}
      />
    );
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('should display SEO metadata when available', () => {
    render(
      <TaskMetadataDisplay
        task={{
          id: '123',
          status: 'completed',
          seo_keywords: {
            title: 'My Custom SEO Title',
            description: 'SEO Desc',
            keywords: ['keyword1', 'keyword2'],
          },
        }}
      />
    );
    expect(screen.getByText(/SEO Metadata/)).toBeInTheDocument();
    expect(screen.getByText('My Custom SEO Title')).toBeInTheDocument();
    expect(screen.getByText('SEO Desc')).toBeInTheDocument();
    expect(screen.getByText('keyword1')).toBeInTheDocument();
    expect(screen.getByText('keyword2')).toBeInTheDocument();
  });

  it('should not display SEO section when no SEO data', () => {
    render(<TaskMetadataDisplay task={{ id: '123', status: 'completed' }} />);
    expect(screen.queryByText(/SEO Metadata/)).not.toBeInTheDocument();
  });

  it('should show quality badge Excellent for score >= 90', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', quality_score: 92 }}
      />
    );
    expect(screen.getByText(/Excellent/)).toBeInTheDocument();
  });

  it('should show quality badge Fair for score between 50-74', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', quality_score: 60 }}
      />
    );
    expect(screen.getByText(/Fair/)).toBeInTheDocument();
  });

  it('should show quality badge Poor for score < 50', () => {
    render(
      <TaskMetadataDisplay
        task={{ id: '123', status: 'completed', quality_score: 30 }}
      />
    );
    expect(screen.getByText(/Poor/)).toBeInTheDocument();
  });
});
