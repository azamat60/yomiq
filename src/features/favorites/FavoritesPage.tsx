import { useDeferredValue, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Favorite } from '@/db/types';
import { foodHistory, foodKey, listFavorites } from '@/db/repository';
import { useAppStore } from '@/shared/store/app';
import { useT } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { IconClose, IconPlus, IconSearch, IconStar, IconTrash } from '@/shared/ui/icons';
import { QuickAddSheet } from './QuickAddSheet';
import { QuickRow } from './QuickRow';
import { RowAction } from './RowAction';
import { RECENT_PAGE, useQuickActions } from './useQuickList';
import { FoodHistory } from './FoodHistory';

export function FavoritesPage() {
  const openCapture = useAppStore((s) => s.openCapture);
  const t = useT();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Favorite | null>(null);
  const [page, setPage] = useState(1);

  const needle = useDeferredValue(foodKey(query));
  const limit = page * RECENT_PAGE;
  const favorites = useLiveQuery(listFavorites);
  const result = useLiveQuery(async () => ({
    needle,
    entries: await foodHistory(needle, limit + 1),
  }), [needle, limit]);
  const history = result?.needle === needle ? result.entries : undefined;
  const shownFavorites = favorites?.filter((item) => foodKey(item.name).includes(needle)) ?? [];
  const empty = favorites !== undefined && history !== undefined && !shownFavorites.length && !history.length;

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
        <h1 className="mb-3 text-[24px] font-bold tracking-tight">{t.foods.title}</h1>
        <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 focus-within:border-accent">
          <IconSearch size={19} className="shrink-0 text-faint" />
          <input
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            aria-label={t.foods.searchHistory}
            placeholder={t.foods.searchHistory}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint"
          />
          {query && (
            <button
              onClick={() => changeQuery('')}
              aria-label={t.common.close}
              className="-mr-1 shrink-0 text-faint active:text-muted"
            >
              <IconClose size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6 px-4 py-5">
        {shownFavorites.length > 0 && <FavoritesSection items={shownFavorites} onPick={setPicked} />}

        {!!history?.length && (
          <FoodHistory
            entries={history.slice(0, limit)}
            favorites={favorites ?? []}
            onPick={setPicked}
            onMore={history.length > limit ? () => setPage((value) => value + 1) : undefined}
          />
        )}

        {empty && !needle && <EmptyState onAdd={() => openCapture('manual')} />}

        {empty && needle && (
          <p className="py-8 text-center text-[14px] text-faint">{t.foods.noResults}</p>
        )}
      </div>

      <QuickAddSheet favorite={picked} onClose={() => setPicked(null)} />
    </div>
  );
}

function FavoritesSection({
  items,
  onPick,
}: {
  items: Favorite[];
  onPick: (favorite: Favorite) => void;
}) {
  const t = useT();
  const { removeFavorite } = useQuickActions();

  return (
    <section className="flex flex-col gap-2">
      <SectionTitle icon={<IconStar size={16} />} title={t.foods.favorites} />
      <ul className="overflow-hidden rounded-card border border-line bg-surface">
        {items.map((favorite) => (
          <QuickRow
            key={favorite.id}
            favorite={favorite}
            chips
            showPhoto
            onPick={() => onPick(favorite)}
            trailing={
              <RowAction
                label={t.foods.remove(favorite.name)}
                tone="danger"
                onClick={() => removeFavorite(favorite)}
              >
                <IconTrash size={18} />
              </RowAction>
            }
          />
        ))}
      </ul>
    </section>
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const t = useT();

  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <IconStar size={24} />
      </span>
      <p className="max-w-[16rem] text-[14.5px] leading-relaxed text-muted">{t.foods.empty}</p>
      <Button variant="secondary" onClick={onAdd}>
        <IconPlus size={18} />
        {t.foods.addManually}
      </Button>
    </div>
  );
}
