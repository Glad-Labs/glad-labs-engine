import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { WritingStyleSelector } from '../WritingStyleSelector';

vi.mock('../../services/writingStyleService', () => ({
  getUserWritingSamples: vi.fn(),
  getActiveWritingSample: vi.fn(),
}));

import {
  getUserWritingSamples,
  getActiveWritingSample,
} from '../../services/writingStyleService';

const sampleList = [
  { id: 'sample-1', title: 'Blog Voice' },
  { id: 'sample-2', title: 'Newsletter Style' },
];

const makeResolvedSamples = (samples = sampleList, active = null) => {
  getUserWritingSamples.mockResolvedValue({ samples });
  getActiveWritingSample.mockResolvedValue({ sample: active });
};

describe('WritingStyleSelector', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders a disabled select while data is loading', () => {
    getUserWritingSamples.mockReturnValue(new Promise(() => {}));
    getActiveWritingSample.mockReturnValue(new Promise(() => {}));

    render(<WritingStyleSelector value="" onChange={vi.fn()} />);
    // During loading the component renders a disabled FormControl
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders dropdown options after loading', async () => {
    makeResolvedSamples();
    render(<WritingStyleSelector value="" onChange={vi.fn()} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Open the MUI Select to reveal MenuItems
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: /Blog Voice/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Newsletter Style/i })).toBeInTheDocument();
  });

  it('shows error helper text when service call fails', async () => {
    getUserWritingSamples.mockRejectedValue(new Error('Network error'));
    getActiveWritingSample.mockRejectedValue(new Error('Network error'));

    render(<WritingStyleSelector value="" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load writing samples/i)
      ).toBeInTheDocument();
    });
  });

  it('shows empty-state helper text when no samples exist', async () => {
    makeResolvedSamples([]);
    render(<WritingStyleSelector value="" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/Upload a writing sample in Settings/i)
    ).toBeInTheDocument();
  });

  it('renders "None" option when includeNone is true (default)', async () => {
    makeResolvedSamples();
    render(<WritingStyleSelector value="" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(
      screen.getByRole('option', { name: /None.*Use default style/i })
    ).toBeInTheDocument();
  });

  it('does not render "None" option when includeNone is false', async () => {
    makeResolvedSamples();
    render(<WritingStyleSelector value="" onChange={vi.fn()} includeNone={false} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(
      screen.queryByRole('option', { name: /None.*Use default style/i })
    ).not.toBeInTheDocument();
  });

  it('shows Active chip for the active sample', async () => {
    makeResolvedSamples(sampleList, sampleList[0]);
    render(<WritingStyleSelector value="sample-1" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Open dropdown to see the items with chips
    fireEvent.mouseDown(screen.getByRole('combobox'));
    // "Active" chip appears in both the selected value display and the dropdown option
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
  });

  it('auto-selects active sample when no value is provided', async () => {
    const onChange = vi.fn();
    makeResolvedSamples(sampleList, sampleList[1]);

    render(<WritingStyleSelector value="" onChange={onChange} />);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('sample-2');
    });
  });

  it('calls onChange when a different sample is selected', async () => {
    const onChange = vi.fn();
    makeResolvedSamples();
    render(<WritingStyleSelector value="sample-1" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: /Newsletter Style/i }));

    expect(onChange).toHaveBeenCalledWith('sample-2');
  });

  it('renders helper text about style matching', async () => {
    makeResolvedSamples();
    render(<WritingStyleSelector value="" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/Select a writing style to match/i)
    ).toBeInTheDocument();
  });

  it('disables the select when disabled prop is true', async () => {
    makeResolvedSamples();
    render(<WritingStyleSelector value="" onChange={vi.fn()} disabled />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders the Writing Style label', async () => {
    makeResolvedSamples();
    render(<WritingStyleSelector value="" onChange={vi.fn()} />);

    // Label is present even during loading
    expect(screen.getAllByText('Writing Style').length).toBeGreaterThan(0);
  });
});
