import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Favorite } from '@/db/types';
import { deleteFavorite, listFavorites, recentEntries, saveFavorite } from '@/db/repository';
import { portionMacros } from '@/shared/lib/nutrition';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Button } from '@/shared/ui/Button';
import { MacroChips } from '@/shared/ui/MacroBar';
import { useToast } from '@/shared/ui/Toast';
import { IconPlus, IconRepeat, IconSearch, IconStar, IconTrash } from '@/shared/ui/icons';
import { QuickAddSheet } from './QuickAddSheet';

export function FavoritesPage() {
  const openCapture = useAppStore((s) => s.openCapture);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Favorite | null>(null);

  const favorites = useLiveQuery(listFavorites, [], undefined);
  const recent = useLiveQuery(() => recentEntries(12), [], undefined);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = favorites ?? [];
    return needle ? list.filter((item) => item.name.toLowerCase().includes(needle)) : list;
  }, [favorites, query]);

  const savedNames = useMemo(
    () => new Set((favorites ?? []).map((item) => item.name.toLowerCase())),
    [favorites],
  );

  const notYetSaved = (recent ?? []).filter((entry) => !savedNames.has(entry.name.toLowerCase()));

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
        <h1 className="mb-3 text-[24px] font-bold tracking-tight">My Foods</h1>
        <label className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 focus-within:border-accent">
          <IconSearch size={19} className="shrink-0 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint"
          />
        </label>
      </header>

      <div className="flex flex-col gap-6 px-4 py-5">
        {filtered.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionTitle icon={<IconStar size={16} />} title="Favorites" />
            <ul className="overflow-hidden rounded-card border border-line bg-surface">
              {filtered.map((favorite) => (
                <FavoriteRow
                  key={favorite.id}
                  favorite={favorite}
                  onPick={() => setPicked(favorite)}
                  onDelete={async () => {
                    await deleteFavorite(favorite.id);
                    haptic('warning');
                    toast.show(`"${favorite.name}" removed`);
                  }}
                />
              ))}
            </ul>
          </section>
        )}

        {!query && notYetSaved.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionTitle icon={<IconRepeat size={16} />} title="Recent" />
            <ul className="overflow-hidden rounded-card border border-line bg-surface">
              {notYetSaved.map((entry) => (
                <li key={entry.id} className="flex items-center border-b border-line last:border-b-0">
                  <button
                    onClick={() => {
                      haptic('tap');
                      setPicked({
                        id: `recent:${entry.id}`,
                        name: entry.name,
                        per100: entry.per100,
                        defaultGrams: Math.round(entry.grams),
                        usageCount: 0,
                        lastUsedAt: entry.createdAt,
                      });
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left active:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15.5px] font-medium">{entry.name}</span>
                      <span className="tnum block text-[13px] text-faint">
                        {Math.round(entry.grams)} g ·{' '}
                        {portionMacros(entry.per100, entry.grams).kcal} kcal
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      void saveFavorite({
                        name: entry.name,
                        per100: entry.per100,
                        defaultGrams: Math.round(entry.grams),
                      });
                      haptic('success');
                      toast.show(`"${entry.name}" added to favorites`);
                    }}
                    aria-label={`Add ${entry.name} to favorites`}
                    className="grid size-11 shrink-0 place-items-center text-faint active:text-accent"
                  >
                    <IconStar size={19} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {favorites !== undefined && favorites.length === 0 && notYetSaved.length === 0 && (
          <EmptyState onAdd={() => openCapture('manual')} />
        )}

        {query && filtered.length === 0 && (
          <p className="py-8 text-center text-[14px] text-faint">No results found</p>
        )}
      </div>

      <QuickAddSheet favorite={picked} onClose={() => setPicked(null)} />
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-1.5 px-1 text-[13px] font-medium text-muted">
      {icon}
      {title}
    </h2>
  );
}

function FavoriteRow({
  favorite,
  onPick,
  onDelete,
}: {
  favorite: Favorite;
  onPick: () => void;
  onDelete: () => void;
}) {
  const macros = portionMacros(favorite.per100, favorite.defaultGrams);

  return (
    <li className="flex items-center border-b border-line last:border-b-0">
      <button
        onClick={() => {
          haptic('tap');
          onPick();
        }}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left active:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15.5px] font-medium">{favorite.name}</span>
          <span className="tnum block text-[13px] text-faint">
            {favorite.defaultGrams} g · {macros.kcal} kcal
          </span>
          <span className="mt-1 block">
            <MacroChips macros={macros} />
          </span>
        </span>
      </button>

      <button
        onClick={onDelete}
        aria-label={`Remove ${favorite.name}`}
        className="grid size-11 shrink-0 place-items-center text-faint active:text-danger"
      >
        <IconTrash size={18} />
      </button>
    </li>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <IconStar size={24} />
      </span>
      <p className="max-w-[16rem] text-[14.5px] leading-relaxed text-muted">
        Foods you eat often will show up here. Save any item from the editor after recognition —
        then add it in one tap.
      </p>
      <Button variant="secondary" onClick={onAdd}>
        <IconPlus size={18} />
        Add manually
      </Button>
    </div>
  );
}
