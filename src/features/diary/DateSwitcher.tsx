import { useAppStore } from '@/shared/store/app';
import { formatDayLabel, formatFullDate, isFuture, isToday, shiftDateKey, toDateKey } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { IconChevronLeft, IconChevronRight } from '@/shared/ui/icons';

export function DateSwitcher() {
  const date = useAppStore((s) => s.date);
  const setDate = useAppStore((s) => s.setDate);

  const shift = (days: number) => {
    const next = shiftDateKey(date, days);
    // Logging food in the future is never what the user means.
    if (isFuture(next)) return;
    haptic('tap');
    setDate(next);
  };

  return (
    <div className="flex flex-1 items-center gap-1">
      <button
        onClick={() => shift(-1)}
        aria-label="Previous day"
        className="grid size-10 place-items-center rounded-full text-muted active:bg-surface-2"
      >
        <IconChevronLeft size={22} />
      </button>

      <button
        onClick={() => {
          if (isToday(date)) return;
          haptic('select');
          setDate(toDateKey());
        }}
        className="flex flex-1 flex-col items-center rounded-2xl py-1 active:bg-surface-2"
      >
        <span className="text-[17px] font-semibold">{formatDayLabel(date)}</span>
        <span className="text-[12px] text-faint">{formatFullDate(date)}</span>
      </button>

      <button
        onClick={() => shift(1)}
        disabled={isToday(date)}
        aria-label="Next day"
        className="grid size-10 place-items-center rounded-full text-muted transition-opacity active:bg-surface-2 disabled:opacity-25"
      >
        <IconChevronRight size={22} />
      </button>
    </div>
  );
}
