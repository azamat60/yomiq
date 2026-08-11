import type { Meal } from '@/db/types';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';
import { MEAL_ICON, MEAL_LABEL, MEAL_ORDER } from '@/features/diary/constants';

export function MealPicker({ value, onChange }: { value: Meal; onChange: (meal: Meal) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {MEAL_ORDER.map((meal) => (
        <button
          key={meal}
          onClick={() => {
            haptic('select');
            onChange(meal);
          }}
          aria-pressed={meal === value}
          className={cn(
            'flex flex-col items-center gap-1 rounded-tile border px-1 py-2.5 transition-colors',
            meal === value
              ? 'border-accent bg-accent-soft text-text'
              : 'border-line bg-surface text-muted active:bg-surface-2',
          )}
        >
          <span className="text-[17px]">{MEAL_ICON[meal]}</span>
          <span className="text-[12px] font-medium">{MEAL_LABEL[meal]}</span>
        </button>
      ))}
    </div>
  );
}
