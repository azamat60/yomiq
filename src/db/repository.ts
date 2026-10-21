import { db } from './schema';
import {
  PROFILE_ID,
  type Draft,
  type Entry,
  type Favorite,
  type HiddenRecent,
  type Insight,
  type InsightTurn,
  type Macros,
  type Profile,
} from './types';
import { portionMacros, sumMacros } from '@/shared/lib/nutrition';
import { defaultEatenAt, toDateKey } from '@/shared/lib/date';

/**
 * The only module that touches Dexie. Screens import from here, which is what
 * lets the storage engine be swapped later without rewriting the UI.
 */

const newId = () => crypto.randomUUID();

/** Recent and favorites match foods by name, ignoring case and stray spaces. */
export const foodKey = (name: string) => name.trim().toLowerCase();

// ---------- profile ----------

export function getProfile(): Promise<Profile | undefined> {
  return db.profile.get(PROFILE_ID);
}

export async function saveProfile(
  input: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const existing = await getProfile();
  const now = Date.now();
  await db.profile.put({
    ...input,
    id: PROFILE_ID,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
}

export async function updateProfile(patch: Partial<Omit<Profile, 'id'>>): Promise<void> {
  await db.profile.update(PROFILE_ID, { ...patch, updatedAt: Date.now() });
}

// ---------- entries ----------

export function entriesForDate(date: string): Promise<Entry[]> {
  return db.entries.where('date').equals(date).sortBy('createdAt');
}

/**
 * Inclusive range over the `date` index. Sorted by day first, then by when the
 * food was eaten — a backfilled entry has a later createdAt than the day after it.
 */
export async function entriesBetween(from: string, to: string): Promise<Entry[]> {
  const list = await db.entries.where('date').between(from, to, true, true).toArray();
  return list.sort((a, b) =>
    a.date === b.date ? a.eatenAt - b.eatenAt : a.date < b.date ? -1 : 1,
  );
}

export function getEntry(id: string): Promise<Entry | undefined> {
  return db.entries.get(id);
}

export async function addEntriesFromDraft(draft: Draft): Promise<string[]> {
  const createdAt = Date.now();
  const eatenAt = defaultEatenAt(draft.date, draft.meal);
  const entries: Entry[] = draft.items.map((item, index) => ({
    id: newId(),
    date: draft.date,
    meal: draft.meal,
    name: item.name,
    grams: Math.round(item.grams),
    per100: item.per100,
    source: draft.source,
    // Only the first item carries the photo — one shot, one image in storage.
    photo: index === 0 ? draft.photo : undefined,
    confidence: item.confidence,
    eatenAt: eatenAt + index,
    createdAt: createdAt + index,
  }));

  await db.entries.bulkAdd(entries);
  return entries.map((e) => e.id);
}

export async function updateEntry(id: string, patch: Partial<Omit<Entry, 'id'>>): Promise<void> {
  await db.entries.update(id, patch);
}

export async function deleteEntry(id: string): Promise<Entry | undefined> {
  const entry = await db.entries.get(id);
  if (entry) await db.entries.delete(id);
  return entry;
}

/** Puts a deleted entry back with its original id, so undo restores order too. */
export async function restoreEntry(entry: Entry): Promise<void> {
  await db.entries.put(entry);
}

export function totalsFor(entries: Entry[]): Macros {
  return sumMacros(entries.map((e) => portionMacros(e.per100, e.grams)));
}

// ---------- favorites ----------

export function listFavorites(): Promise<Favorite[]> {
  return db.favorites.orderBy('usageCount').reverse().toArray();
}

export async function saveFavorite(
  input: Pick<Favorite, 'name' | 'per100' | 'defaultGrams'>,
): Promise<string> {
  const existing = await db.favorites.where('name').equalsIgnoreCase(input.name.trim()).first();
  if (existing) {
    await db.favorites.update(existing.id, {
      per100: input.per100,
      defaultGrams: input.defaultGrams,
    });
    return existing.id;
  }

  const favorite: Favorite = {
    ...input,
    name: input.name.trim(),
    id: newId(),
    usageCount: 0,
    lastUsedAt: Date.now(),
  };
  await db.favorites.add(favorite);
  return favorite.id;
}

export async function markFavoriteUsed(id: string): Promise<void> {
  const favorite = await db.favorites.get(id);
  if (!favorite) return;
  await db.favorites.update(id, {
    usageCount: favorite.usageCount + 1,
    lastUsedAt: Date.now(),
  });
}

export async function deleteFavorite(id: string): Promise<Favorite | undefined> {
  const favorite = await db.favorites.get(id);
  if (favorite) await db.favorites.delete(id);
  return favorite;
}

/** Puts a deleted favorite back with its id and usage stats, so undo is lossless. */
export async function restoreFavorite(favorite: Favorite): Promise<void> {
  await db.favorites.put(favorite);
}

/**
 * Distinct foods, most recent first, skipping ones already saved as favorites
 * (they have their own list) and ones the user hid. Walks the whole diary
 * lazily, so the list is as long as asked for, not capped by a scan window.
 */
export async function recentEntries(limit = 30): Promise<Entry[]> {
  const [favorites, hidden] = await Promise.all([db.favorites.toArray(), db.hiddenRecents.toArray()]);
  const saved = new Set(favorites.map((favorite) => foodKey(favorite.name)));
  const hiddenAt = new Map(hidden.map((item) => [item.key, item.hiddenAt]));
  const seen = new Set<string>();
  const unique: Entry[] = [];

  await db.entries
    .orderBy('createdAt')
    .reverse()
    .until(() => unique.length >= limit)
    .each((entry) => {
      const key = foodKey(entry.name);
      if (seen.has(key)) return;
      seen.add(key);
      if (saved.has(key)) return;
      const since = hiddenAt.get(key);
      if (since !== undefined && entry.createdAt <= since) return;
      unique.push(entry);
    });

  return unique;
}

export async function hideRecent(name: string): Promise<HiddenRecent> {
  const item: HiddenRecent = { key: foodKey(name), hiddenAt: Date.now() };
  await db.hiddenRecents.put(item);
  return item;
}

export async function unhideRecent(name: string): Promise<void> {
  await db.hiddenRecents.delete(foodKey(name));
}

// ---------- insights ----------

export function listInsights(limit = 20): Promise<Insight[]> {
  return db.insights.orderBy('createdAt').reverse().limit(limit).toArray();
}

export function getInsight(id: string): Promise<Insight | undefined> {
  return db.insights.get(id);
}

export async function saveInsight(input: Omit<Insight, 'id' | 'createdAt'>): Promise<string> {
  const insight: Insight = { ...input, id: newId(), createdAt: Date.now() };
  await db.insights.add(insight);
  return insight.id;
}

export async function appendTurns(id: string, turns: InsightTurn[]): Promise<void> {
  const insight = await db.insights.get(id);
  if (!insight) return;
  await db.insights.update(id, { turns: [...insight.turns, ...turns] });
}

export async function deleteInsight(id: string): Promise<void> {
  await db.insights.delete(id);
}

// ---------- maintenance ----------

export async function exportData(): Promise<string> {
  const [profile, entries, favorites, insights] = await Promise.all([
    getProfile(),
    db.entries.toArray(),
    db.favorites.toArray(),
    db.insights.toArray(),
  ]);

  return JSON.stringify(
    {
      version: 2,
      exportedAt: toDateKey(),
      profile,
      // Blobs cannot be serialised — photos stay on the device.
      entries: entries.map(({ photo: _photo, ...rest }) => rest),
      favorites,
      insights,
    },
    null,
    2,
  );
}

export async function clearAllData(): Promise<void> {
  const tables = [db.profile, db.entries, db.favorites, db.insights, db.hiddenRecents];
  await db.transaction('rw', tables, async () => {
    await Promise.all(tables.map((table) => table.clear()));
  });
}
