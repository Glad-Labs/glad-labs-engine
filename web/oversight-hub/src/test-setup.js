import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement scrollIntoView — mock it globally
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// jsdom does not implement getSelection — mock it globally
document.getSelection = vi.fn(() => ({
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  getRangeAt: vi.fn(),
  rangeCount: 0,
  toString: vi.fn(() => ''),
}));

// jsdom createRange mock (needed for user-event text selection in some elements)
const _originalCreateRange = document.createRange?.bind(document);
document.createRange = () => {
  const range = _originalCreateRange ? _originalCreateRange() : {};
  return {
    setStart: vi.fn(),
    setEnd: vi.fn(),
    commonAncestorContainer: document.body,
    collapse: vi.fn(),
    selectNodeContents: vi.fn(),
    cloneRange: vi.fn(() => ({ setStart: vi.fn(), setEnd: vi.fn() })),
    getBoundingClientRect: vi.fn(() => ({
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: vi.fn(() => []),
    ...range,
  };
};
