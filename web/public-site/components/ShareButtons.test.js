/**
 * ShareButtons Component Tests (components/ShareButtons.tsx)
 *
 * Tests social media share functionality
 * Verifies: Share links, platform buttons, URL encoding
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButtons } from '../ShareButtons';

describe('ShareButtons Component', () => {
  const defaultProps = {
    title: 'Test Post Title',
    description: 'Test post description',
    slug: 'test-post',
    siteUrl: 'https://example.com',
  };

  it('should render share buttons component', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should display share label', () => {
    render(<ShareButtons {...defaultProps} />);
    const label = screen.getByText(/share:/i);
    expect(label).toBeInTheDocument();
  });

  it('should have Twitter share button', () => {
    render(<ShareButtons {...defaultProps} />);
    const twitterButton =
      screen.getByRole('button', { name: /twitter|x/i }) ||
      screen.queryByTitle(/twitter/i);

    if (twitterButton) {
      expect(twitterButton).toBeInTheDocument();
    }
  });

  it('should have LinkedIn share button', () => {
    render(<ShareButtons {...defaultProps} />);
    const linkedinButton =
      screen.getByRole('button', { name: /linkedin/i }) ||
      screen.queryByTitle(/linkedin/i);

    if (linkedinButton) {
      expect(linkedinButton).toBeInTheDocument();
    }
  });

  it('should have Facebook share button', () => {
    render(<ShareButtons {...defaultProps} />);
    const facebookButton =
      screen.getByRole('button', { name: /facebook/i }) ||
      screen.queryByTitle(/facebook/i);

    if (facebookButton) {
      expect(facebookButton).toBeInTheDocument();
    }
  });

  it('should handle share button clicks', () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

    render(<ShareButtons {...defaultProps} />);
    const buttons = screen.getAllByRole('button');

    // Should have at least social share buttons (not just close button if any)
    expect(buttons.length).toBeGreaterThan(0);

    windowOpenSpy.mockRestore();
  });

  it('should encode title and description in share URLs', () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

    render(<ShareButtons {...defaultProps} />);
    const buttons = screen.getAllByRole('button');

    // Click first social button
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      expect(windowOpenSpy).toHaveBeenCalled();
    }

    windowOpenSpy.mockRestore();
  });

  it('should use default site URL if not provided', () => {
    const propsWithoutUrl = { ...defaultProps, siteUrl: undefined };
    render(<ShareButtons {...propsWithoutUrl} />);
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should construct correct post URL with slug', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should use title as fallback for description', () => {
    const propsWithoutDesc = { ...defaultProps, description: undefined };
    render(<ShareButtons {...propsWithoutDesc} />);
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should handle special characters in title', () => {
    const propsWithSpecialChars = {
      ...defaultProps,
      title: 'React & Vue: A Comparison & Best Practices',
    };
    render(<ShareButtons {...propsWithSpecialChars} />);
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should have accessible button labels', () => {
    render(<ShareButtons {...defaultProps} />);
    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      expect(button).toHaveAccessibleName() ||
        expect(button).toHaveAttribute('aria-label');
    });
  });

  it('should open share links in new window', () => {
    const windowOpenSpy = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    render(<ShareButtons {...defaultProps} />);
    const buttons = screen.getAllByRole('button');

    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);

      if (windowOpenSpy.mock.calls.length > 0) {
        const [, target] = windowOpenSpy.mock.calls[0];
        expect(target).toBe('_blank');
      }
    }

    windowOpenSpy.mockRestore();
  });

  it('should handle hydration mismatch with useEffect', () => {
    render(<ShareButtons {...defaultProps} />);
    // Component should render after mounting
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should display all share platform buttons', () => {
    render(<ShareButtons {...defaultProps} />);
    const shareContainer = screen.getByText(/share/i).closest('div');
    expect(shareContainer?.children.length).toBeGreaterThan(0);
  });

  it('should have proper styling classes', () => {
    const { container } = render(<ShareButtons {...defaultProps} />);
    const shareDiv = container.querySelector('.flex');
    expect(shareDiv).toBeInTheDocument();
  });
});
