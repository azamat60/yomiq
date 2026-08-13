import { IconInfo } from '@/shared/ui/icons';

/**
 * Hardcoded on purpose: the model must not be able to drop, soften or reword
 * the one part of the report that says what it is not.
 */
export function CoachDisclaimer() {
  return (
    <div className="flex gap-2.5 rounded-card border border-line px-4 py-3">
      <IconInfo size={17} className="mt-0.5 shrink-0 text-faint" />
      <p className="text-[12.5px] leading-snug text-faint">
        The coach only reads what you logged. It is not a medical or psychological assessment and
        cannot diagnose anything. If eating feels out of your control, a doctor or a psychologist
        who works with eating behaviour can help.
      </p>
    </div>
  );
}
