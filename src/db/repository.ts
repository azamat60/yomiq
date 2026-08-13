import { db } from './schema';
import {
  PROFILE_ID,
  type Draft,
  type Entry,
  type Favorite,
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
  const existing = await db.favorites.where('name').equalsIgnoreCase(input.name).first();
  if (existing) {
    await db.favorites.update(existing.id, {
      per100: input.per100,
      defaultGrams: input.defaultGrams,
    });
    return existing.id;
  }

  const favorite: Favorite = {
    ...input,
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

export async function deleteFavorite(id: string): Promise<void> {
  await db.favorites.delete(id);
}

/** Distinct foods eaten on the given day — powers "repeat yesterday". */
export async function recentEntries(limit = 30): Promise<Entry[]> {
  const all = await db.entries.orderBy('createdAt').reverse().limit(200).toArray();
  const seen = new Set<string>();
  const unique: Entry[] = [];
  for (const entry of all) {
    const key = entry.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(entry);
    if (unique.length >= limit) break;
  }
  return unique;
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
  await db.transaction('rw', db.profile, db.entries, db.favorites, db.insights, async () => {
    await Promise.all([
      db.profile.clear(),
      db.entries.clear(),
      db.favorites.clear(),
      db.insights.clear(),
    ]);
  });
}
