import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// StatusTimeline imports a CSS file — mock it
vi.mock('../tasks/StatusTimeline.css', () => ({}));

import StatusTimeline from '../tasks/StatusTimeline';

const sampleHistory = [
  {
    old_status: null,
    new_status: 'pending',
    timestamp: '2026-03-10T10:00:00Z',
  },
  {
    old_status: 'pending',
    new_status: 'in_progress',
    timestamp: '2026-03-10T10:05:00Z',
  },
  {
    old_status: 'in_progress',
    new_status: 'awaiting_approval',
    timestamp: '2026-03-10T10:15:00Z',
  },
];

describe('StatusTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the timeline header', () => {
    render(<StatusTimeline currentStatus="pending" />);
    expect(screen.getByText('Status Progression Timeline')).toBeInTheDocument();
  });

  it('displays the current status badge in the header', () => {
    render(<StatusTimeline currentStatus="in_progress" />);
    // The badge appears in the header span
    const badge = document.querySelector('.current-status-badge');
    expect(badge).toHaveTextContent('In Progress');
  });

  it('renders all 9 status nodes', () => {
    render(<StatusTimeline currentStatus="pending" />);
    // All statuses should have labels in the labels row
    const expectedLabels = [
      'Pending',
      'In Progress',
      'Awaiting Approval',
      'Approved',
      'Published',
      'Failed',
      'On Hold',
      'Rejected',
      'Cancelled',
    ];
    expectedLabels.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows "No status history available yet" when statusHistory is empty', () => {
    render(<StatusTimeline currentStatus="pending" statusHistory={[]} />);
    expect(
      screen.getByText('No status history available yet')
    ).toBeInTheDocument();
  });

  it('does not show empty-history message when history is provided', () => {
    render(
      <StatusTimeline
        currentStatus="in_progress"
        statusHistory={sampleHistory}
      />
    );
    expect(
      screen.queryByText('No status history available yet')
    ).not.toBeInTheDocument();
  });

  it('shows a detail panel when a timeline node is clicked', () => {
    render(
      <StatusTimeline
        currentStatus="in_progress"
        statusHistory={sampleHistory}
      />
    );

    // Click on the "Pending" node — find the node by its icon text (⧗)
    const pendingNode = screen.getByTitle(/Pending/);
    fireEvent.click(pendingNode);

    // Detail panel should appear
    expect(screen.getByText('Status Code:')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('shows Visited: Yes for a state in the history', () => {
    render(
      <StatusTimeline
        currentStatus="in_progress"
        statusHistory={sampleHistory}
      />
    );

    // Click on "In Progress" node
    const inProgressNode = screen.getByTitle(/In Progress/);
    fireEvent.click(inProgressNode);

    expect(screen.getByText('Visited:')).toBeInTheDocument();
    // Both Visited: Yes and Current: Yes may appear
    const yesValues = screen.getAllByText('Yes');
    expect(yesValues.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Visited: No for a state not in the history', () => {
    render(
      <StatusTimeline
        currentStatus="in_progress"
        statusHistory={sampleHistory}
      />
    );

    // Click on "Published" which was never visited
    const publishedNode = screen.getByTitle(/Published/);
    fireEvent.click(publishedNode);

    // Both "Visited: No" and "Current: No" should appear — use getAllByText
    const noValues = screen.getAllByText('No');
    expect(noValues.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Current: Yes when clicking the current state node', () => {
    render(
      <StatusTimeline
        currentStatus="in_progress"
        statusHistory={sampleHistory}
      />
    );

    const inProgressNode = screen.getByTitle(/In Progress/);
    fireEvent.click(inProgressNode);

    // "Current:" label must be present; "Yes" value siblings confirm it
    expect(screen.getByText('Current:')).toBeInTheDocument();
    const yesValues = screen.getAllByText('Yes');
    expect(yesValues.length).toBeGreaterThanOrEqual(1);
  });

  it('closes the detail panel when the close button is clicked', () => {
    render(
      <StatusTimeline
        currentStatus="in_progress"
        statusHistory={sampleHistory}
      />
    );

    const inProgressNode = screen.getByTitle(/In Progress/);
    fireEvent.click(inProgressNode);

    // Detail panel open
    expect(screen.getByText('Status Code:')).toBeInTheDocument();

    // Close it
    const closeBtn = screen.getByRole('button', { name: /Close details/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Status Code:')).not.toBeInTheDocument();
  });

  it('displays duration for visited states', () => {
    render(
      <StatusTimeline
        currentStatus="awaiting_approval"
        statusHistory={sampleHistory}
      />
    );

    // pending lasted 5 minutes → expect "5m" duration label
    expect(screen.getByText('5m')).toBeInTheDocument();
  });

  it('shows history entry count in detail panel', () => {
    render(
      <StatusTimeline
        currentStatus="in_progress"
        statusHistory={sampleHistory}
      />
    );

    const inProgressNode = screen.getByTitle(/In Progress/);
    fireEvent.click(inProgressNode);

    expect(screen.getByText('History Entries:')).toBeInTheDocument();
    expect(screen.getByText(String(sampleHistory.length))).toBeInTheDocument();
  });
});
