import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskTypeSelector from '../tasks/TaskTypeSelector';

describe('TaskTypeSelector Component', () => {
  const mockTaskTypes = {
    blog_post: {
      label: 'Blog Post',
      description: 'Create a blog article',
    },
    social_media: {
      label: 'Social Media',
      description: 'Create social content',
    },
    email: {
      label: 'Email Campaign',
      description: 'Create an email',
    },
  };

  const defaultProps = {
    taskTypes: mockTaskTypes,
    selectedType: null,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header', () => {
    render(<TaskTypeSelector {...defaultProps} />);
    expect(screen.getByText('Select Task Type')).toBeInTheDocument();
  });

  it('should render all task type options', () => {
    render(<TaskTypeSelector {...defaultProps} />);
    expect(screen.getByText('Blog Post')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Email Campaign')).toBeInTheDocument();
  });

  it('should render descriptions for each task type', () => {
    render(<TaskTypeSelector {...defaultProps} />);
    expect(screen.getByText('Create a blog article')).toBeInTheDocument();
    expect(screen.getByText('Create social content')).toBeInTheDocument();
    expect(screen.getByText('Create an email')).toBeInTheDocument();
  });

  it('should call onSelect with the correct key when clicked', () => {
    render(<TaskTypeSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Blog Post'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('blog_post');
  });

  it('should call onSelect for a different type', () => {
    render(<TaskTypeSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Social Media'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('social_media');
  });

  it('should highlight the selected type with contained variant', () => {
    render(<TaskTypeSelector {...defaultProps} selectedType="blog_post" />);
    // The selected button should use contained variant (MUI adds specific classes)
    const blogButton = screen.getByText('Blog Post').closest('button');
    expect(blogButton).toHaveClass('MuiButton-contained');
  });

  it('should show non-selected types with outlined variant', () => {
    render(<TaskTypeSelector {...defaultProps} selectedType="blog_post" />);
    const socialButton = screen.getByText('Social Media').closest('button');
    expect(socialButton).toHaveClass('MuiButton-outlined');
  });

  it('should handle empty taskTypes gracefully', () => {
    const { container } = render(
      <TaskTypeSelector {...defaultProps} taskTypes={{}} />
    );
    expect(screen.getByText('Select Task Type')).toBeInTheDocument();
    // No buttons should be rendered
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
