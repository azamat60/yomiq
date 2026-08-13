import { IconCoach } from '@/shared/ui/icons';
import { MIN_DAYS_LOGGED, MIN_ENTRIES } from './constants';

export function CoachEmptyState({
  daysLogged,
  entryCount,
}: {
  daysLogged: number;
  entryCount: number;
}) {
  const missingDays = Math.max(0, MIN_DAYS_LOGGED - daysLogged);

  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
        <IconCoach size={26} />
      </span>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[17px] font-semibold">Not enough diary yet</h2>
        <p className="text-[14px] leading-snug text-muted">
          {missingDays > 0
            ? `${daysLogged} of ${MIN_DAYS_LOGGED} days logged in this period. Log ${missingDays} more and the coach can look for patterns.`
            : `${entryCount} of ${MIN_ENTRIES} items logged in this period. A few more and the coach can look for patterns.`}
        </p>
      </div>

      <p className="text-[13px] text-faint">Or pick a longer period above.</p>
    </div>
  );
}
