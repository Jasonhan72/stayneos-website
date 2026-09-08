import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from '@/hooks/useFullscreen';

describe('useFullscreen', () => {
  it('starts not fullscreen by default', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });

  it('toggles between fullscreen states', () => {
    const { result } = renderHook(() => useFullscreen());
    act(() => result.current.toggle());
    expect(result.current.isFullscreen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isFullscreen).toBe(false);
  });

  it('enters and exits explicitly', () => {
    const { result } = renderHook(() => useFullscreen());
    act(() => result.current.enter());
    expect(result.current.isFullscreen).toBe(true);
    act(() => result.current.exit());
    expect(result.current.isFullscreen).toBe(false);
  });

  it('exits on Escape keydown while fullscreen', () => {
    const { result } = renderHook(() => useFullscreen());
    act(() => result.current.enter());
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('ignores Escape when not fullscreen', () => {
    const { result } = renderHook(() => useFullscreen());
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('cleans up the keydown listener on unmount', () => {
    const { result, unmount } = renderHook(() => useFullscreen());
    act(() => result.current.enter());
    unmount();
    // Dispatching Escape after unmount should not throw.
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
  });
});
