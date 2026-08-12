import { useAppStore } from '@/shared/store/app';
import { IconWarning } from '@/shared/ui/icons';

export function ErrorNotice() {
  const error = useAppStore((s) => s.error);
  const resetAnalysis = useAppStore((s) => s.resetAnalysis);

  if (!error) return null;

  return (
    <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3">
      <IconWarning size={19} className="mt-0.5 shrink-0 text-warn" />
      <p className="flex-1 text-[14px] leading-snug">{error}</p>
      <button
        onClick={resetAnalysis}
        aria-label="Dismiss"
        className="shrink-0 text-[13px] font-medium text-muted active:opacity-60"
      >
        OK
      </button>
    </div>
  );
}
