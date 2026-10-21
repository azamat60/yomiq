import { IconCoach } from '@/shared/ui/icons';
import { useT } from '@/shared/i18n';
import { MIN_DAYS_LOGGED, MIN_ENTRIES } from './constants';

export function CoachEmptyState({
  daysLogged,
  entryCount,
}: {
  daysLogged: number;
  entryCount: number;
}) {
  const t = useT();
  const missingDays = Math.max(0, MIN_DAYS_LOGGED - daysLogged);

  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
        <IconCoach size={26} />
      </span>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[17px] font-semibold">{t.coach.notEnough}</h2>
        <p className="text-[14px] leading-snug text-muted">
          {missingDays > 0
            ? t.coach.missingDays(daysLogged, MIN_DAYS_LOGGED, missingDays)
            : t.coach.missingEntries(entryCount, MIN_ENTRIES)}
        </p>
      </div>

      <p className="text-[13px] text-faint">{t.coach.longerPeriod}</p>
    </div>
  );
}
