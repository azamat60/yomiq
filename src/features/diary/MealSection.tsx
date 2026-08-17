import { useState } from 'react';
import type { Entry, Meal } from '@/db/types';
import { totalsFor } from '@/db/repository';
import { useAppStore } from '@/shared/store/app';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';
import { IconPlus } from '@/shared/ui/icons';
import { EntryCard } from './EntryCard';
import { EditEntrySheet } from './EditEntrySheet';
import { MEAL_ICON, MEAL_LABEL, mealKcalTarget } from './constants';

export function MealSection({
  meal,
  entries,
  dailyKcal,
}: {
  meal: Meal;
  entries: Entry[];
  dailyKcal: number;
}) {
  const openCapture = useAppStore((s) => s.openCapture);
  const [editing, setEditing] = useState<Entry | null>(null);

  const totals = totalsFor(entries);
  const target = mealKcalTarget(dailyKcal, meal);
  const ratio = target > 0 ? Math.min(1, totals.kcal / target) : 0;
  const over = totals.kcal > target;
  const MealIcon = MEAL_ICON[meal];

  return (
    <section className="overflow-hidden rounded-card border border-line bg-surface">
      {/* The whole header is the add target, so there is no separate "+ Add" row.
          Entry rows below are siblings, never nested inside this button. */}
      <button
        onClick={() => {
          haptic('tap');
          openCapture('composer', meal);
        }}
        className="flex w-full items-center gap-3 px-3.5 py-4 text-left active:bg-surface-2"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
          <MealIcon size={19} />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-[16px] font-semibold">{MEAL_LABEL[meal]}</span>
            <span className="tnum shrink-0 text-[13px] font-medium">
              <span className={cn(over && 'text-warn')}>{totals.kcal}</span>
              <span className="text-faint"> / {target} kcal</span>
            </span>
          </span>

          <span className="block h-1 overflow-hidden rounded-full bg-track">
            <span
              className="block h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${ratio * 100}%`,
                background: over ? 'var(--warn)' : 'var(--accent)',
              }}
            />
          </span>
        </span>

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
