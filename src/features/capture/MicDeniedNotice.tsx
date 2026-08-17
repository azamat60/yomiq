import { IconWarning } from '@/shared/ui/icons';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

export function MicDeniedNotice({ onType }: { onType: () => void }) {
  return (
    <div className="mb-3 flex items-start gap-2.5 rounded-card border border-warn/30 bg-warn/10 px-4 py-3">
      <IconWarning size={19} className="mt-0.5 shrink-0 text-warn" />
      <div className="flex flex-1 flex-col items-start gap-1.5">
        <p className="text-[14px] leading-snug">
          {isStandalone()
            ? 'iOS asks for the microphone again every time the app is opened from the Home Screen. Tap Allow when it asks, or type it instead.'
            : 'Microphone access is off for this site. Allow it in your browser settings, or type it instead.'}
        </p>
        <button onClick={onType} className="text-[13px] font-medium text-accent active:opacity-60">
          Type it instead
        </button>
      </div>
    </div>
  );
}
