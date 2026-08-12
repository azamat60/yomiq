import { useState } from 'react';
import type { Entry, Meal } from '@/db/types';
import { totalsFor } from '@/db/repository';
import { useAppStore } from '@/shared/store/app';
import { haptic } from '@/shared/lib/haptics';
import { EntryCard } from './EntryCard';
import { EditEntrySheet } from './EditEntrySheet';
import { MEAL_ICON, MEAL_LABEL } from './constants';

export function MealSection({ meal, entries }: { meal: Meal; entries: Entry[] }) {
  const openCapture = useAppStore((s) => s.openCapture);
  const [editing, setEditing] = useState<Entry | null>(null);

  const totals = totalsFor(entries);

  return (
    <section className="overflow-hidden rounded-card border border-line bg-surface">
      <header className="flex items-center gap-2.5 px-4 py-3">
        <span className="text-[17px]">{MEAL_ICON[meal]}</span>
        <h2 className="flex-1 text-[16px] font-semibold">{MEAL_LABEL[meal]}</h2>
        {entries.length > 0 && (
          <span className="tnum text-[15px] font-semibold text-muted">{totals.kcal} kcal</span>
        )}
      </header>

      {entries.length > 0 && (
        <ul className="border-t border-line">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onEdit={() => setEditing(entry)} />
          ))}
        </ul>
      )}

      <button
        onClick={() => {
          haptic('tap');
          openCapture('menu', meal);
        }}
        className="w-full border-t border-line px-4 py-3 text-left text-[15px] font-medium text-accent active:bg-surface-2"
      >
        + Add
      </button>

      <EditEntrySheet entry={editing} onClose={() => setEditing(null)} />
    </section>
  );
}
