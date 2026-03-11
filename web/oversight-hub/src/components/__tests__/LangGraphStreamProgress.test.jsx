import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LangGraphStreamProgress from '../LangGraphStreamProgress';

vi.mock('../../hooks/useLangGraphStream', () => ({
  useLangGraphStream: vi.fn(),
}));

import { useLangGraphStream } from '../../hooks/useLangGraphStream';

const defaultProgress = {
  phase: 'pending',
  progress: 0,
  status: 'waiting',
  content: '',
  quality: 0,
  refinements: 0,
  error: null,
  phases: [
    { name: 'Research', completed: false },
    { name: 'Outline', completed: false },
    { name: 'Draft', completed: false },
    { name: 'Quality Check', completed: false },
    { name: 'Finalization', completed: false },
  ],
};

describe('LangGraphStreamProgress', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders a stepper with all pipeline phases', () => {
    useLangGraphStream.mockReturnValue(defaultProgress);
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(screen.getByText('Research')).toBeInTheDocument();
    expect(screen.getByText('Outline')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Quality Check')).toBeInTheDocument();
    expect(screen.getByText('Finalization')).toBeInTheDocument();
  });

  it('displays "Starting..." when phase is pending', () => {
    useLangGraphStream.mockReturnValue({ ...defaultProgress, phase: 'pending' });
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(screen.getByText('Starting...')).toBeInTheDocument();
  });

  it('displays the current phase name when not pending', () => {
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      phase: 'Research',
      progress: 20,
    });
    render(<LangGraphStreamProgress requestId="req-1" />);

    // Phase label appears in the progress text area
    const researchElements = screen.getAllByText('Research');
    expect(researchElements.length).toBeGreaterThan(0);
  });

  it('displays progress percentage', () => {
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      progress: 45,
      phase: 'Draft',
    });
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('renders error alert when status is error', () => {
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      status: 'error',
      error: 'Pipeline timed out',
    });
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(screen.getByText('Pipeline Failed')).toBeInTheDocument();
    expect(screen.getByText('Pipeline timed out')).toBeInTheDocument();
  });

  it('calls onError callback when status becomes error', () => {
    const onError = vi.fn();
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      status: 'error',
      error: 'Something went wrong',
    });
    render(<LangGraphStreamProgress requestId="req-1" onError={onError} />);

    expect(onError).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows quality score card when quality > 0', () => {
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      quality: 82,
      refinements: 2,
      status: 'in_progress',
    });
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(screen.getByText('Quality Assessment')).toBeInTheDocument();
    expect(screen.getByText('82/100')).toBeInTheDocument();
  });

  it('does not show quality card when quality is 0', () => {
    useLangGraphStream.mockReturnValue(defaultProgress);
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(screen.queryByText('Quality Assessment')).not.toBeInTheDocument();
  });

  it('shows content preview when content is present', () => {
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      content: 'This is a draft blog post about AI.',
    });
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(screen.getByText('Current Preview')).toBeInTheDocument();
    expect(screen.getByText('This is a draft blog post about AI.')).toBeInTheDocument();
  });

  it('shows completion alert when status is completed', () => {
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      status: 'completed',
      quality: 91,
    });
    render(<LangGraphStreamProgress requestId="req-1" />);

    expect(
      screen.getByText(/Pipeline completed successfully/i)
    ).toBeInTheDocument();
    // Quality score appears in both the quality card and the completion alert
    expect(screen.getAllByText(/91\/100/).length).toBeGreaterThan(0);
  });

  it('calls onComplete callback when status becomes completed', () => {
    const onComplete = vi.fn();
    useLangGraphStream.mockReturnValue({
      ...defaultProgress,
      status: 'completed',
      quality: 88,
      refinements: 1,
    });
    render(
      <LangGraphStreamProgress
        requestId="req-42"
        onComplete={onComplete}
      />
    );

    expect(onComplete).toHaveBeenCalledWith({
      requestId: 'req-42',
      quality: 88,
      refinements: 1,
    });
  });

  it('passes requestId to the useLangGraphStream hook', () => {
    useLangGraphStream.mockReturnValue(defaultProgress);
    render(<LangGraphStreamProgress requestId="my-unique-id" />);

    expect(useLangGraphStream).toHaveBeenCalledWith('my-unique-id');
  });
});
