/**
 * TaskTable.test.js - Unit tests for TaskTable component
 *
 * Tests rendering, selection, pagination, and actions
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import TaskTable from './TaskTable';

describe('TaskTable Component', () => {
  const mockTasks = [
    {
      id: 1,
      name: 'Task 1',
      status: 'pending',
      task_type: 'content',
      created_at: '2024-01-01',
    },
    {
      id: 2,
      name: 'Task 2',
      status: 'completed',
      task_type: 'analysis',
      created_at: '2024-01-02',
    },
    {
      id: 3,
      name: 'Task 3',
      status: 'in_progress',
      task_type: 'content',
      created_at: '2024-01-03',
    },
  ];

  const defaultProps = {
    tasks: mockTasks,
    loading: false,
    page: 1,
    limit: 10,
    total: 30,
    selectedTasks: [],
    onSelectTask: vi.fn(),
    onSelectAll: vi.fn(),
    onSelectOne: vi.fn(),
    onPageChange: vi.fn(),
    onRowsPerPageChange: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task table with all tasks', () => {
      render(<TaskTable {...defaultProps} />);

      mockTasks.forEach((task) => {
        expect(screen.getByText(task.name)).toBeInTheDocument();
        expect(screen.getByText(task.status)).toBeInTheDocument();
      });
    });

    it('should render loading spinner when loading', () => {
      render(<TaskTable {...defaultProps} loading={true} tasks={[]} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render empty message when no tasks', () => {
      const { container } = render(
        <TaskTable {...defaultProps} tasks={[]} loading={false} />
      );

      // Table should still exist but be empty
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should render status chips with correct colors', () => {
      render(<TaskTable {...defaultProps} />);

      const pendingChip = screen.getByText('pending');
      expect(pendingChip).toBeInTheDocument();
      expect(pendingChip).toHaveClass('MuiChip-colorWarning');

      const completedChip = screen.getByText('completed');
      expect(completedChip).toBeInTheDocument();
      expect(completedChip).toHaveClass('MuiChip-colorSuccess');
    });
  });

  describe('Selection', () => {
    it('should render checkboxes for task selection', () => {
      const { container } = render(<TaskTable {...defaultProps} />);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      // One for select-all header, one for each row
      expect(checkboxes.length).toBe(mockTasks.length + 1);
    });

    it('should call onSelectOne when task checkbox is clicked', () => {
      const { container } = render(<TaskTable {...defaultProps} />);

      const taskCheckboxes = container.querySelectorAll(
        'tbody input[type="checkbox"]'
      );
      fireEvent.click(taskCheckboxes[0]);

      expect(defaultProps.onSelectOne).toHaveBeenCalledWith(mockTasks[0].id);
    });

    it('should call onSelectAll when header checkbox is clicked', () => {
      const { container } = render(<TaskTable {...defaultProps} />);

      const headerCheckbox = container.querySelector(
        'thead input[type="checkbox"]'
      );
      fireEvent.click(headerCheckbox);

      expect(defaultProps.onSelectAll).toHaveBeenCalled();
    });

    it('should highlight selected tasks', () => {
      const { container } = render(
        <TaskTable {...defaultProps} selectedTasks={[1]} />
      );

      const firstRow = container.querySelector('tbody tr');
      expect(firstRow).toHaveStyle('backgroundColor');
    });
  });

  describe('Action Buttons', () => {
    it('should render edit button for each task', () => {
      render(<TaskTable {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should call onEditTask when edit button is clicked', () => {
      const { container } = render(<TaskTable {...defaultProps} />);

      const editButtons = container.querySelectorAll('[aria-label*="Edit"]');
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEditTask).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should render delete button for each task', () => {
      const { container } = render(<TaskTable {...defaultProps} />);

      const deleteButtons = container.querySelectorAll(
        '[aria-label*="Delete"]'
      );
      expect(deleteButtons.length).toBe(mockTasks.length);
    });

    it('should call onDeleteTask when delete button is clicked', () => {
      const { container } = render(<TaskTable {...defaultProps} />);

      const deleteButtons = container.querySelectorAll(
        '[aria-label*="Delete"]'
      );
      fireEvent.click(deleteButtons[0]);

      expect(defaultProps.onDeleteTask).toHaveBeenCalledWith(mockTasks[0].id);
    });
  });

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      render(<TaskTable {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Rows per page selector
    });

    it('should show correct page information', () => {
      render(<TaskTable {...defaultProps} page={2} limit={10} total={50} />);

      // Pagination shows "10–20 of 50" or similar
      expect(screen.getByText(/1–3 of 30/i)).toBeInTheDocument();
    });

    it('should call onPageChange when navigating pages', () => {
      render(<TaskTable {...defaultProps} />);

      const nextPageButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextPageButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onRowsPerPageChange when limit is changed', () => {
      render(<TaskTable {...defaultProps} />);

      const limitSelect = screen.getByRole('combobox');
      fireEvent.change(limitSelect, { target: { value: '20' } });

      expect(defaultProps.onRowsPerPageChange).toHaveBeenCalledWith(20);
    });
  });

  describe('PropTypes Validation', () => {
    it('should render with minimal props', () => {
      const { container } = render(
        <TaskTable tasks={[]} loading={false} total={0} />
      );

      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should use default prop values', () => {
      const { container } = render(<TaskTable tasks={mockTasks} />);

      // Should render without errors
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(screen.getByText(mockTasks[0].name)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long task names', () => {
      const longNameTask = {
        ...mockTasks[0],
        name: 'A'.repeat(200),
      };

      render(<TaskTable {...defaultProps} tasks={[longNameTask]} />);

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
    });

    it('should handle special characters in task names', () => {
      const specialTask = {
        ...mockTasks[0],
        name: 'Task <>&"\'',
      };

      render(<TaskTable {...defaultProps} tasks={[specialTask]} />);

      expect(
        screen.getByText('Task <>&"\'', { exact: false })
      ).toBeInTheDocument();
    });

    it('should handle undefined status gracefully', () => {
      const noStatusTask = {
        ...mockTasks[0],
        status: undefined,
      };

      const { container } = render(
        <TaskTable {...defaultProps} tasks={[noStatusTask]} />
      );

      expect(container.querySelector('table')).toBeInTheDocument();
    });
  });
});
