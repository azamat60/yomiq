import { lazy, type ComponentType } from 'react';

const RELOADED_KEY = 'yomiq:chunk-reload';

/**
 * Every deploy renames the hashed chunks, so a tab left open across one asks
 * for a filename the server no longer has. Left alone that rejected import
 * takes the whole router down, which is a hard crash for what is really just a
 * stale page — so reload once to pick up the new build. The session flag stops
 * a genuine, persistent failure from turning into a reload loop.
 */
// Mirrors React.lazy's own constraint so prop types flow through untouched.
export function lazyChunk<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const module = await load();
      sessionStorage.removeItem(RELOADED_KEY);
      return module;
    } catch (error) {
      if (!sessionStorage.getItem(RELOADED_KEY)) {
        sessionStorage.setItem(RELOADED_KEY, '1');
        location.reload();
      }
      throw error;
    }
  });
}
