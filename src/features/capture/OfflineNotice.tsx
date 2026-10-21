import { IconOffline } from '@/shared/ui/icons';
import { useT } from '@/shared/i18n';

export function OfflineNotice() {
  const t = useT();
  return (
    <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2 px-4 py-3">
      <IconOffline size={19} className="mt-0.5 shrink-0 text-muted" />
      <p className="flex-1 text-[14px] leading-snug text-muted">
        {t.composer.offline}
      </p>
    </div>
  );
}
