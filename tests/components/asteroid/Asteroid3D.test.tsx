import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import Asteroid3D from '../../../src/components/asteroid/Asteroid3D';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock WebGL context to force fallback for testing
const mockGetContext: Mock = vi.fn();
HTMLCanvasElement.prototype.getContext = mockGetContext;

describe('Asteroid3D', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fallback image when WebGL is not supported', () => {
    // Force WebGL failure
    mockGetContext.mockReturnValue(null);

    render(<Asteroid3D type="iron" fallbackImage="/test-fallback.png" />);
    
    const img = screen.getByRole('img', { name: 'iron asteroid' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-fallback.png');
  });

  it('renders canvas when WebGL is supported', () => {
    // Force WebGL success
    mockGetContext.mockReturnValue({});

    render(<Asteroid3D type="rocky" />);
    
    // The container should have the aria-label for the interactive 3D canvas
    const container = screen.getByLabelText('Interactive 3D rocky asteroid');
    expect(container).toBeInTheDocument();
  });
});
