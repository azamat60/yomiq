import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Entry, Favorite } from '@/db/types';
import { listFavorites, recentEntries } from '@/db/repository';

const DEFAULT_RECENT_LIMIT = 12;

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

export function useQuickList(limit = DEFAULT_RECENT_LIMIT) {
  const favorites = useLiveQuery(listFavorites, [], undefined);
  const recent = useLiveQuery(() => recentEntries(limit), [limit], undefined);

  const savedNames = useMemo(
    () => new Set((favorites ?? []).map((item) => item.name.toLowerCase())),
    [favorites],
  );

  const notYetSaved = useMemo(
    () => (recent ?? []).filter((entry) => !savedNames.has(entry.name.toLowerCase())),
    [recent, savedNames],
  );

  return {
    favorites: favorites ?? [],
    recent: notYetSaved,
    loading: favorites === undefined || recent === undefined,
  };
}
