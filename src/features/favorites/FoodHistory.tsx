import type { Entry, Favorite } from '@/db/types';
import { foodKey, saveFavorite } from '@/db/repository';
import { useT } from '@/shared/i18n';
import { formatTime, fromDateKey, shiftDateKey, toDateKey } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/Button';
import { IconClose, IconHistory, IconStar } from '@/shared/ui/icons';
import { useToast } from '@/shared/ui/Toast';
import { QuickRow } from './QuickRow';
import { RowAction } from './RowAction';
import { toFavorite, useQuickActions } from './useQuickList';

export function FoodHistory({ entries, favorites, onPick, onMore }: {
  entries: Entry[];
  favorites: Favorite[];
  onPick: (favorite: Favorite) => void;
  onMore?: () => void;
}) {
  const t = useT();
  const today = toDateKey();
  const yesterday = shiftDateKey(today, -1);
  const formatter = new Intl.DateTimeFormat(t.intl, { day: 'numeric', month: 'long', year: 'numeric' });
  const saved = new Set(favorites.map(({ name }) => foodKey(name)));
  const dates = new Map<string, Entry[]>();
  for (const entry of entries) {
    const group = dates.get(entry.date);
    if (group) group.push(entry);
    else dates.set(entry.date, [entry]);
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="food-history">
      <h2 id="food-history" className="flex items-center gap-1.5 px-1 text-[13px] font-medium text-muted">
        <IconHistory size={16} />
        {t.foods.history}
      </h2>
      {Array.from(dates, ([date, items]) => (
        <div key={date} className="flex flex-col gap-2">
          <h3 className="px-1 text-[14px] font-semibold">
            <time dateTime={date}>
              {date === today ? t.date.today : date === yesterday ? t.date.yesterday : formatter.format(fromDateKey(date))}
            </time>
          </h3>
          <ul className="overflow-hidden rounded-card border border-line bg-surface">
            {items.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} saved={saved.has(foodKey(entry.name))} onPick={onPick} />
            ))}
          </ul>
        </div>
      ))}
      {onMore && (
        <Button variant="ghost" size="sm" onClick={onMore} className="self-center">
          {t.foods.showMore}
        </Button>
      )}
    </section>
  );
}

function HistoryRow({ entry, saved, onPick }: {
  entry: Entry;
  saved: boolean;
  onPick: (favorite: Favorite) => void;
}) {
  const t = useT();
  const toast = useToast();
  const { hideRecent } = useQuickActions();
  const favorite = toFavorite(entry);

  const star = async () => {
    await saveFavorite({ name: favorite.name, per100: favorite.per100, defaultGrams: favorite.defaultGrams });
    haptic('success');
    toast.show(t.toast.addedToFavorites(entry.name));
  };

  return (
    <QuickRow
      favorite={favorite}
      detail={formatTime(entry.eatenAt)}
      onPick={() => onPick(favorite)}
      trailing={
        <>
          {!saved && (
            <RowAction label={t.foods.addToFavorites(entry.name)} tone="accent" onClick={star}>
              <IconStar size={19} />
            </RowAction>
          )}
          <RowAction label={t.foods.hideFromHistory(entry.name)} tone="danger" onClick={() => hideRecent(entry.name)}>
            <IconClose size={19} />
          </RowAction>
        </>
      }
    />
  );
}
