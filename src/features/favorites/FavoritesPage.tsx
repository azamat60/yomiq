import { useMemo, useState } from 'react';
import type { Entry, Favorite } from '@/db/types';
import { foodKey, saveFavorite } from '@/db/repository';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { useT } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { IconClose, IconPlus, IconRepeat, IconSearch, IconStar, IconTrash } from '@/shared/ui/icons';
import { QuickAddSheet } from './QuickAddSheet';
import { QuickRow } from './QuickRow';
import { RowAction } from './RowAction';
import { RECENT_PAGE, toFavorite, useQuickActions, useQuickList } from './useQuickList';

export function FavoritesPage() {
  const openCapture = useAppStore((s) => s.openCapture);
  const t = useT();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Favorite | null>(null);
  const [recentLimit, setRecentLimit] = useState(RECENT_PAGE);

  const { favorites, recent, loading } = useQuickList(recentLimit);
  const needle = foodKey(query);

  const shownFavorites = useMemo(
    () => (needle ? favorites.filter((item) => foodKey(item.name).includes(needle)) : favorites),
    [favorites, needle],
  );
  const shownRecent = useMemo(
    () => (needle ? recent.filter((entry) => foodKey(entry.name).includes(needle)) : recent),
    [recent, needle],
  );
  // A full page means there may be more behind it.
  const canShowMore = !needle && recent.length >= recentLimit;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
        <h1 className="mb-3 text-[24px] font-bold tracking-tight">{t.foods.title}</h1>
        <label className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 focus-within:border-accent">
          <IconSearch size={19} className="shrink-0 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.foods.search}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label={t.common.close}
              className="-mr-1 shrink-0 text-faint active:text-muted"
            >
              <IconClose size={18} />
            </button>
          )}
        </label>
      </header>

      <div className="flex flex-col gap-6 px-4 py-5">
        {shownFavorites.length > 0 && <FavoritesSection items={shownFavorites} onPick={setPicked} />}

        {shownRecent.length > 0 && (
          <RecentSection
            items={shownRecent}
            onPick={setPicked}
            onMore={canShowMore ? () => setRecentLimit((limit) => limit + RECENT_PAGE) : undefined}
          />
        )}

        {!loading && !needle && favorites.length === 0 && recent.length === 0 && (
          <EmptyState onAdd={() => openCapture('manual')} />
        )}

        {needle && shownFavorites.length === 0 && shownRecent.length === 0 && (
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

function RecentSection({
  items,
  onPick,
  onMore,
}: {
  items: Entry[];
  onPick: (favorite: Favorite) => void;
  onMore?: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const { hideRecent } = useQuickActions();

  const star = async (entry: Entry) => {
    await saveFavorite({
      name: entry.name,
      per100: entry.per100,
      defaultGrams: Math.round(entry.grams),
    });
    haptic('success');
    toast.show(t.toast.addedToFavorites(entry.name));
  };

  return (
    <section className="flex flex-col gap-2">
      <SectionTitle icon={<IconRepeat size={16} />} title={t.foods.recent} />
      <ul className="overflow-hidden rounded-card border border-line bg-surface">
        {items.map((entry) => (
          <QuickRow
            key={entry.id}
            favorite={toFavorite(entry)}
            onPick={() => onPick(toFavorite(entry))}
            trailing={
              <>
                <RowAction label={t.foods.addToFavorites(entry.name)} tone="accent" onClick={() => star(entry)}>
                  <IconStar size={19} />
                </RowAction>
                <RowAction label={t.foods.hide(entry.name)} tone="danger" onClick={() => hideRecent(entry.name)}>
                  <IconClose size={19} />
                </RowAction>
              </>
            }
          />
        ))}
      </ul>
      {onMore && (
        <Button variant="ghost" size="sm" onClick={onMore} className="self-center">
          {t.foods.showMore}
        </Button>
      )}
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
