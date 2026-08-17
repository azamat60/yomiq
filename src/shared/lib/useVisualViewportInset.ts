import { useSyncExternalStore } from 'react';

/**
 * Height of whatever covers the bottom of the layout viewport — in practice the
 * on-screen keyboard. iOS Safari does not shrink dvh for it, so anything pinned
 * to the bottom of a fixed overlay ends up underneath it; visualViewport is the
 * only signal that reports the real visible area.
 */
export function useVisualViewportInset(): number {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

function subscribe(callback: () => void): () => void {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};

  viewport.addEventListener('resize', callback);
  viewport.addEventListener('scroll', callback);
  return () => {
    viewport.removeEventListener('resize', callback);
    viewport.removeEventListener('scroll', callback);
  };
}

function snapshot(): number {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
}

function serverSnapshot(): number {
  return 0;
}
