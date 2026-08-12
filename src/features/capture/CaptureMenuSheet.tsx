import { useRef } from 'react';
import { useAppStore } from '@/shared/store/app';
import { haptic } from '@/shared/lib/haptics';
import { Sheet } from '@/shared/ui/Sheet';
import { IconBarcode, IconCamera, IconMic, IconPencil, IconText } from '@/shared/ui/icons';
import { useAnalyze } from './useAnalyze';
import { ErrorNotice } from './ErrorNotice';
import { OfflineNotice } from './OfflineNotice';
import { useOnline } from '@/shared/lib/useOnline';

export function CaptureMenuSheet({ open }: { open: boolean }) {
  const closeCapture = useAppStore((s) => s.closeCapture);
  const openCapture = useAppStore((s) => s.openCapture);
  const presetMeal = useAppStore((s) => s.presetMeal);
  const { fromPhoto } = useAnalyze();
  const online = useOnline();
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <Sheet open={open} onClose={closeCapture} title="Add Food">
      <ErrorNotice />
      {!online && <OfflineNotice />}

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Tile
          icon={<IconCamera size={26} />}
          title="Photo"
          hint="Take or choose"
          accent
          disabled={!online}
          onClick={() => fileInput.current?.click()}
        />
        <Tile
          icon={<IconMic size={26} />}
          title="Voice"
          hint="Speak it out"
          disabled={!online}
          onClick={() => openCapture('voice', presetMeal ?? undefined)}
        />
        <Tile
          icon={<IconText size={26} />}
          title="Text"
          hint="Describe in words"
          disabled={!online}
          onClick={() => openCapture('text', presetMeal ?? undefined)}
        />
        <Tile
          icon={<IconPencil size={26} />}
          title="Manual"
          hint="Enter macros"
          onClick={() => openCapture('manual', presetMeal ?? undefined)}
        />
      </div>

      <button
        disabled={!online}
        onClick={() => {
          haptic('select');
          openCapture('barcode', presetMeal ?? undefined);
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-card border border-line bg-surface p-4 text-left transition-transform active:scale-[0.98] active:bg-surface-2 disabled:pointer-events-none disabled:opacity-35"
      >
        <span className="text-muted">
          <IconBarcode size={24} />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold">Scan Barcode</span>
          <span className="block text-[13px] text-muted">Packaged food, instant lookup</span>
        </span>
      </button>

      {/* `capture` opens the native camera directly, which is the only path that
          works reliably inside a standalone PWA on iOS. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          haptic('select');
          void fromPhoto(file);
        }}
      />
    </Sheet>
  );
}

function Tile({
  icon,
  title,
  hint,
  accent,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  accent?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        haptic('select');
        onClick();
      }}
      className={
        'flex flex-col items-start gap-2 rounded-card border p-4 text-left transition-transform active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 ' +
        (accent ? 'border-accent bg-accent-soft' : 'border-line bg-surface active:bg-surface-2')
      }
    >
      <span className={accent ? 'text-accent' : 'text-muted'}>{icon}</span>
      <span>
        <span className="block text-[16px] font-semibold">{title}</span>
        <span className="block text-[13px] text-muted">{hint}</span>
      </span>
    </button>
  );
}
