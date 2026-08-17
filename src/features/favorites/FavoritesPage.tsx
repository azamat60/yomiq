import { useMemo, useState } from 'react';
import type { Favorite } from '@/db/types';
import { deleteFavorite, saveFavorite } from '@/db/repository';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { IconPlus, IconRepeat, IconSearch, IconStar, IconTrash } from '@/shared/ui/icons';
import { QuickAddSheet } from './QuickAddSheet';
import { QuickRow } from './QuickRow';
import { toFavorite, useQuickList } from './useQuickList';

export function FavoritesPage() {
  const openCapture = useAppStore((s) => s.openCapture);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Favorite | null>(null);

  const { favorites, recent, loading } = useQuickList();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? favorites.filter((item) => item.name.toLowerCase().includes(needle)) : favorites;
  }, [favorites, query]);

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
                <QuickRow
                  key={favorite.id}
                  favorite={favorite}
                  chips
                  onPick={() => setPicked(favorite)}
                  trailing={
                    <RowAction
                      label={`Remove ${favorite.name}`}
                      tone="danger"
                      onClick={async () => {
                        await deleteFavorite(favorite.id);
                        haptic('warning');
                        toast.show(`"${favorite.name}" removed`);
                      }}
                    >
                      <IconTrash size={18} />
                    </RowAction>
                  }
                />
              ))}
            </ul>
          </section>
        )}

        {!query && recent.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionTitle icon={<IconRepeat size={16} />} title="Recent" />
            <ul className="overflow-hidden rounded-card border border-line bg-surface">
              {recent.map((entry) => (
                <QuickRow
                  key={entry.id}
                  favorite={toFavorite(entry)}
                  onPick={() => setPicked(toFavorite(entry))}
                  trailing={
                    <RowAction
                      label={`Add ${entry.name} to favorites`}
                      tone="accent"
                      onClick={async () => {
                        await saveFavorite({
                          name: entry.name,
                          per100: entry.per100,
                          defaultGrams: Math.round(entry.grams),
                        });
                        haptic('success');
                        toast.show(`"${entry.name}" added to favorites`);
                      }}
                    >
                      <IconStar size={19} />
                    </RowAction>
                  }
                />
              ))}
            </ul>
          </section>
        )}

        {!loading && favorites.length === 0 && recent.length === 0 && (
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

function RowAction({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: 'accent' | 'danger';
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => void onClick()}
      aria-label={label}
      className={`grid size-11 shrink-0 place-items-center text-faint ${
        tone === 'danger' ? 'active:text-danger' : 'active:text-accent'
      }`}
    >
      {children}
    </button>
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
