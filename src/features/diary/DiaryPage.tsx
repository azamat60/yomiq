import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router';
import { entriesForDate, totalsFor } from '@/db/repository';
import { useProfile } from '@/db/useProfile';
import type { Entry, Meal } from '@/db/types';
import { useAppStore } from '@/shared/store/app';
import { KcalRing } from '@/shared/ui/KcalRing';
import { MacroBars } from '@/shared/ui/MacroBar';
import { IconUser } from '@/shared/ui/icons';
import { DateSwitcher } from './DateSwitcher';
import { MealSection } from './MealSection';
import { MEAL_ORDER } from './constants';

export function DiaryPage() {
  const date = useAppStore((s) => s.date);
  const profile = useProfile();
  const entries = useLiveQuery(() => entriesForDate(date), [date], undefined);

  const list = entries ?? [];
  const consumed = totalsFor(list);
  const targets = profile?.targets ?? { kcal: 2000, protein: 120, fat: 65, carbs: 220 };

  const byMeal = MEAL_ORDER.reduce<Record<Meal, Entry[]>>(
    (acc, meal) => {
      acc[meal] = list.filter((entry) => entry.meal === meal);
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] },
  );

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-bg/85 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur-xl">
        <DateSwitcher />
        <Link
          to="/profile"
          aria-label="Profile"
          className="grid size-10 shrink-0 place-items-center rounded-full text-muted active:bg-surface-2"
        >
          <IconUser size={22} />
        </Link>
      </header>

      <section className="flex flex-col items-center gap-4 px-5 pt-3 pb-5">
        <KcalRing consumed={consumed.kcal} target={targets.kcal} />
        <div className="w-full">
          <MacroBars consumed={consumed} target={targets} />
        </div>
      </section>

      {/* Each card carries its own empty state, so no separate page-level hint. */}
      <div className="flex flex-col gap-2.5 px-4">
        {MEAL_ORDER.map((meal) => (
          <MealSection key={meal} meal={meal} entries={byMeal[meal]} />
        ))}
      </div>
    </div>
  );
}
