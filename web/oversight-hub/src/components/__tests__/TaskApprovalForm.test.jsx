import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskApprovalForm from '../tasks/TaskApprovalForm';

describe('TaskApprovalForm Component', () => {
  const defaultProps = {
    task: { status: 'awaiting_approval' },
    approvalFeedback: '',
    reviewerId: 'test_user',
    approvalLoading: false,
    publishLoading: false,
    onApprove: vi.fn(),
    onPublish: vi.fn(),
    onReject: vi.fn(),
    onReReview: vi.fn(),
    onFeedbackChange: vi.fn(),
    onReviewerIdChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when task is null', () => {
    const { container } = render(
      <TaskApprovalForm {...defaultProps} task={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  describe('Awaiting Approval state', () => {
    it('should show approval notes section', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      expect(screen.getByText(/Approval Notes/)).toBeInTheDocument();
    });

    it('should show feedback textarea', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      expect(screen.getByLabelText('Feedback for creator')).toBeInTheDocument();
    });

    it('should show reviewer ID input', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      expect(screen.getByLabelText('Reviewer ID')).toBeInTheDocument();
    });

    it('should show Approve and Reject buttons', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      expect(screen.getByText(/Approve \(Step 1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Reject/)).toBeInTheDocument();
    });

    it('should call onApprove when Approve button is clicked', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      fireEvent.click(screen.getByText(/Approve \(Step 1\)/));
      expect(defaultProps.onApprove).toHaveBeenCalledTimes(1);
    });

    it('should call onReject when Reject button is clicked', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      fireEvent.click(screen.getByText(/Reject/));
      expect(defaultProps.onReject).toHaveBeenCalledTimes(1);
    });

    it('should call onFeedbackChange when feedback text changes', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      const feedbackInput = screen.getByLabelText('Feedback for creator');
      fireEvent.change(feedbackInput, { target: { value: 'Good work' } });
      expect(defaultProps.onFeedbackChange).toHaveBeenCalledWith('Good work');
    });

    it('should call onReviewerIdChange when reviewer ID changes', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      const reviewerInput = screen.getByLabelText('Reviewer ID');
      fireEvent.change(reviewerInput, { target: { value: 'new_user' } });
      expect(defaultProps.onReviewerIdChange).toHaveBeenCalledWith('new_user');
    });

    it('should disable buttons when approvalLoading is true', () => {
      render(
        <TaskApprovalForm {...defaultProps} approvalLoading={true} />
      );
      const approveBtn = screen.getByText(/Approving/);
      expect(approveBtn.closest('button')).toBeDisabled();
      expect(screen.getByText(/Reject/).closest('button')).toBeDisabled();
    });

    it('should not show publish or re-review sections', () => {
      render(<TaskApprovalForm {...defaultProps} />);
      expect(screen.queryByText(/Publish to Site/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Re-review Rejected Task/)).not.toBeInTheDocument();
    });
  });

  describe('Approved state', () => {
    const approvedProps = {
      ...defaultProps,
      task: { status: 'approved' },
    };

    it('should show publish section', () => {
      render(<TaskApprovalForm {...approvedProps} />);
      expect(screen.getByText(/Step 2: Publish to Site/)).toBeInTheDocument();
    });

    it('should show publish button', () => {
      render(<TaskApprovalForm {...approvedProps} />);
      expect(screen.getByText(/Publish \(Step 2\)/)).toBeInTheDocument();
    });

    it('should call onPublish when Publish button is clicked', () => {
      render(<TaskApprovalForm {...approvedProps} />);
      fireEvent.click(screen.getByText(/Publish \(Step 2\)/));
      expect(approvedProps.onPublish).toHaveBeenCalledTimes(1);
    });

    it('should disable publish button when publishLoading is true', () => {
      render(
        <TaskApprovalForm {...approvedProps} publishLoading={true} />
      );
      expect(screen.getByText(/Publishing/).closest('button')).toBeDisabled();
    });

    it('should not show approval notes or approve/reject buttons', () => {
      render(<TaskApprovalForm {...approvedProps} />);
      expect(screen.queryByText(/Approval Notes/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Approve \(Step 1\)/)).not.toBeInTheDocument();
    });
  });

  describe('Rejected state', () => {
    // Component uses 'failed_revisions_requested' (not 'rejected') to show the rejection UI
    const rejectedProps = {
      ...defaultProps,
      task: { status: 'failed_revisions_requested', reviewer_feedback: 'Needs more detail' },
    };

    it('should show rejection section', () => {
      render(<TaskApprovalForm {...rejectedProps} />);
      expect(screen.getByText(/Content Rejected/)).toBeInTheDocument();
    });

    it('should display reviewer feedback', () => {
      render(<TaskApprovalForm {...rejectedProps} />);
      expect(screen.getByText('Needs more detail')).toBeInTheDocument();
      expect(screen.getByText('Reviewer feedback:')).toBeInTheDocument();
    });

    it('should show re-review button', () => {
      render(<TaskApprovalForm {...rejectedProps} />);
      expect(screen.getByText('Re-review Rejected Task')).toBeInTheDocument();
    });

    it('should call onReReview when re-review button is clicked', () => {
      render(<TaskApprovalForm {...rejectedProps} />);
      fireEvent.click(screen.getByText('Re-review Rejected Task'));
      expect(rejectedProps.onReReview).toHaveBeenCalledTimes(1);
    });

    it('should show approval notes section for rejected tasks', () => {
      render(<TaskApprovalForm {...rejectedProps} />);
      expect(screen.getByText(/Approval Notes/)).toBeInTheDocument();
    });

    it('should not show reviewer feedback if not provided', () => {
      render(
        <TaskApprovalForm
          {...rejectedProps}
          task={{ status: 'failed_revisions_requested' }}
        />
      );
      expect(screen.queryByText('Reviewer feedback:')).not.toBeInTheDocument();
    });
  });

  describe('Other statuses', () => {
    it('should not show any approval UI for pending status', () => {
      render(
        <TaskApprovalForm {...defaultProps} task={{ status: 'pending' }} />
      );
      expect(screen.queryByText(/Approval Notes/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Approve \(Step 1\)/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Publish \(Step 2\)/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Re-review Rejected Task/)).not.toBeInTheDocument();
    });

    it('should not show any approval UI for in_progress status', () => {
      render(
        <TaskApprovalForm
          {...defaultProps}
          task={{ status: 'in_progress' }}
        />
      );
      expect(screen.queryByText(/Approval Notes/)).not.toBeInTheDocument();
    });
  });
});
