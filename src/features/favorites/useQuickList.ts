import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Entry, Favorite } from '@/db/types';
import {
  deleteFavorite,
  hideRecent,
  listFavorites,
  recentEntries,
  restoreFavorite,
  unhideRecent,
} from '@/db/repository';
import { haptic } from '@/shared/lib/haptics';
import { useT } from '@/shared/i18n';
import { useToast } from '@/shared/ui/Toast';

export const RECENT_PAGE = 30;

/**
 * A recent entry rendered as a Favorite so both lists share one row and one
 * quick-add panel. The `recent:` prefix marks it as having no favourites record.
 */
export function toFavorite(entry: Entry): Favorite {
  return {
    id: `recent:${entry.id}`,
    name: entry.name,
    per100: entry.per100,
    defaultGrams: Math.round(entry.grams),
    usageCount: 0,
    lastUsedAt: entry.createdAt,
  };
}

export function isRecent(favorite: Favorite): boolean {
  return favorite.id.startsWith('recent:');
}

export function useQuickList(limit = RECENT_PAGE) {
  const favorites = useLiveQuery(listFavorites, [], undefined);
  const recent = useLiveQuery(() => recentEntries(limit), [limit], undefined);

  return {
    favorites: favorites ?? [],
    recent: recent ?? [],
    loading: favorites === undefined || recent === undefined,
  };
}

/** Removing from either list is one tap with an undo, never a confirm dialog. */
export function useQuickActions() {
  const toast = useToast();
  const t = useT();

  const removeFavorite = useCallback(
    async (favorite: Favorite) => {
      const removed = await deleteFavorite(favorite.id);
      if (!removed) return;
      haptic('warning');
      toast.show(t.toast.removed(removed.name), {
        label: t.common.undo,
        run: () => void restoreFavorite(removed),
      });
    },
    [t, toast],
  );

  const hide = useCallback(
    async (name: string) => {
      await hideRecent(name);
      haptic('warning');
      toast.show(t.toast.hidden(name), {
        label: t.common.undo,
        run: () => void unhideRecent(name),
      });
    },
    [t, toast],
  );

  /** A recent row is a synthetic Favorite; route it to the right removal. */
  const remove = useCallback(
    (favorite: Favorite) => (isRecent(favorite) ? hide(favorite.name) : removeFavorite(favorite)),
    [hide, removeFavorite],
  );

  return { removeFavorite, hideRecent: hide, remove };
}
