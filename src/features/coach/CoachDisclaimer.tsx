import { IconInfo } from '@/shared/ui/icons';
import { useT } from '@/shared/i18n';

/**
 * Hardcoded on purpose: the model must not be able to drop, soften or reword
 * the one part of the report that says what it is not.
 */
export function CoachDisclaimer() {
  const t = useT();
  return (
    <div className="flex gap-2.5 rounded-card border border-line px-4 py-3">
      <IconInfo size={17} className="mt-0.5 shrink-0 text-faint" />
      <p className="text-[12.5px] leading-snug text-faint">
        {t.coach.disclaimer}
      </p>
    </div>
  );
}
