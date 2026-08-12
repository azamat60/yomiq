import { useState } from 'react';
import type { Entry, Meal } from '@/db/types';
import { totalsFor } from '@/db/repository';
import { useAppStore } from '@/shared/store/app';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';
import { IconPlus } from '@/shared/ui/icons';
import { EntryCard } from './EntryCard';
import { EditEntrySheet } from './EditEntrySheet';
import { MEAL_ICON, MEAL_LABEL } from './constants';

export function MealSection({ meal, entries }: { meal: Meal; entries: Entry[] }) {
  const openCapture = useAppStore((s) => s.openCapture);
  const [editing, setEditing] = useState<Entry | null>(null);

  const totals = totalsFor(entries);
  const MealIcon = MEAL_ICON[meal];

  return (
    <section className="overflow-hidden rounded-card border border-line bg-surface">
      {/* The whole header is the add target, so there is no separate "+ Add" row.
          Entry rows below are siblings, never nested inside this button. */}
      <button
        onClick={() => {
          haptic('tap');
          openCapture('menu', meal);
        }}
        className={cn(
          'flex w-full items-center gap-3 px-3.5 text-left active:bg-surface-2',
          // Empty cards get the roomier hit area; filled ones tighten up so the
          // entries below carry the height instead.
          entries.length === 0 ? 'py-6' : 'py-3.5',
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
          <MealIcon size={19} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold">{MEAL_LABEL[meal]}</span>
          {entries.length === 0 && (
            <span className="block text-[13px] text-faint">Nothing added yet</span>
          )}
        </span>

        <span className="tnum shrink-0 text-[14px] font-medium text-muted">{totals.kcal} kcal</span>

        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
          <IconPlus size={17} strokeWidth={2.4} />
        </span>
      </button>

      {entries.length > 0 && (
        <ul className="border-t border-line">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onEdit={() => setEditing(entry)} />
          ))}
        </ul>
      )}

      <EditEntrySheet entry={editing} onClose={() => setEditing(null)} />
    </section>
  );
}
