'use client';

import { useCallback, useEffect, useState } from 'react';

export interface FullscreenControls {
  isFullscreen: boolean;
  toggle: () => void;
  enter: () => void;
  exit: () => void;
}

/**
 * Container-level fullscreen toggle. Uses a boolean state that the caller maps
 * to a `fixed inset-0` layout (no reliance on the native Fullscreen API, so it
 * works on mobile Safari). Pressing Escape exits fullscreen.
 */
export function useFullscreen(initial = false): FullscreenControls {
  const [isFullscreen, setIsFullscreen] = useState(initial);

  const enter = useCallback(() => setIsFullscreen(true), []);
  const exit = useCallback(() => setIsFullscreen(false), []);
  const toggle = useCallback(() => setIsFullscreen((value) => !value), []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  return { isFullscreen, toggle, enter, exit };
}
