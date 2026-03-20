/**
 * GiscusWrapper Component Tests
 *
 * Tests the wrapper that delegates to GiscusComments.
 * Verifies: Props are forwarded, renders comment section
 */
import { render, screen } from '@testing-library/react';
import { GiscusWrapper } from '../GiscusWrapper';

describe('GiscusWrapper Component', () => {
  it('should render the Comments heading', () => {
    render(<GiscusWrapper postSlug="test-post" postTitle="Test Post" />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('should forward postTitle to GiscusComments', () => {
    render(<GiscusWrapper postSlug="my-post" postTitle="My Great Post" />);
    expect(screen.getByText(/My Great Post/)).toBeInTheDocument();
  });

  it('should render within a container element', () => {
    const { container } = render(
      <GiscusWrapper postSlug="slug" postTitle="Title" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
