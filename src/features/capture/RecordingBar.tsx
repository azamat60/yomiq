import { IconClose, IconSend } from '@/shared/ui/icons';

const WARN_FROM_REMAINING = 10;

export function RecordingBar({
  seconds,
  level,
  maxSeconds,
  onCancel,
  onSend,
}: {
  seconds: number;
  level: number;
  maxSeconds: number;
  onCancel: () => void;
  onSend: () => void;
}) {
  const remaining = maxSeconds - seconds;

  return (
    <div className="flex items-center gap-2 rounded-card border border-line bg-surface p-2">
      <button
        onClick={onCancel}
        aria-label="Cancel recording"
        className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-transform duration-150 active:scale-90 active:bg-surface-2"
      >
        <IconClose size={20} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1">
        <span
          className="size-2.5 shrink-0 rounded-full bg-danger"
          style={{ opacity: 0.45 + level * 0.55, transition: 'opacity 90ms linear' }}
        />
        <span
          className={`tnum shrink-0 text-[14px] font-semibold ${
            remaining <= WARN_FROM_REMAINING ? 'text-warn' : ''
          }`}
        >
          {formatDuration(seconds)}
        </span>
        <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-track">
          <span
            className="block h-full rounded-full bg-danger"
            style={{ width: `${Math.min(100, level * 140)}%`, transition: 'width 90ms linear' }}
          />
        </span>
      </div>

      <button
        onClick={onSend}
        aria-label="Send recording"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-150 active:scale-90"
      >
        <IconSend size={20} />
      </button>
    </div>
  );
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
