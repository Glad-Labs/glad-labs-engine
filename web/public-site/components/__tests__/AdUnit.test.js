/**
 * AdUnit Component Tests
 *
 * Tests the Google AdSense ad unit wrapper.
 * Verifies: Fallback when no ID, format-specific styles, AdSense push
 */
import { render, screen } from '@testing-library/react';
import AdUnit from '../AdUnit';

// Save original env
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
});

afterAll(() => {
  process.env = originalEnv;
});

describe('AdUnit Component', () => {
  it('should show "AdSense not configured" when NEXT_PUBLIC_ADSENSE_ID is unset', () => {
    render(<AdUnit />);
    expect(screen.getByText('AdSense not configured')).toBeInTheDocument();
  });

  it('should render the ad ins element when ADSENSE_ID is set', () => {
    process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-1234567890';
    const { container } = render(<AdUnit />);
    const ins = container.querySelector('ins.adsbygoogle');
    expect(ins).toBeInTheDocument();
    expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-1234567890');
  });

  it('should apply custom className', () => {
    const { container } = render(<AdUnit className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('should set minHeight for leaderboard format', () => {
    process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-1234567890';
    const { container } = render(<AdUnit format="leaderboard" />);
    expect(container.firstChild).toHaveStyle({ minHeight: '90px' });
  });

  it('should set minHeight for medium-rectangle format', () => {
    process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-1234567890';
    const { container } = render(<AdUnit format="medium-rectangle" />);
    expect(container.firstChild).toHaveStyle({ minHeight: '280px' });
  });

  it('should set default minHeight for responsive format', () => {
    process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-1234567890';
    const { container } = render(<AdUnit format="responsive" />);
    expect(container.firstChild).toHaveStyle({ minHeight: '250px' });
  });

  it('should push to adsbygoogle array on mount when available', () => {
    process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-1234567890';
    const pushMock = [];
    window.adsbygoogle = pushMock;

    render(<AdUnit />);

    expect(pushMock.length).toBe(1);

    delete window.adsbygoogle;
  });

  it('should not crash when adsbygoogle.push throws', () => {
    process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-1234567890';
    window.adsbygoogle = {
      push: () => {
        throw new Error('Ad blocked');
      },
    };

    // Suppress the expected console.warn from the catch block
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Should not throw — the component catches internally
    const { container } = render(<AdUnit />);
    expect(container.firstChild).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(
      '[AdUnit] Failed to push ad:',
      expect.any(Error)
    );

    warnSpy.mockRestore();
    delete window.adsbygoogle;
  });
});
