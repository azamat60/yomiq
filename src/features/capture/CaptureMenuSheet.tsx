import { useRef } from 'react';
import { useAppStore } from '@/shared/store/app';
import { haptic } from '@/shared/lib/haptics';
import { Sheet } from '@/shared/ui/Sheet';
import { IconCamera, IconMic, IconPencil, IconText } from '@/shared/ui/icons';
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
    <Sheet open={open} onClose={closeCapture} title="Добавить еду">
      <ErrorNotice />
      {!online && <OfflineNotice />}

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Tile
          icon={<IconCamera size={26} />}
          title="Фото"
          hint="Снять или выбрать"
          accent
          disabled={!online}
          onClick={() => fileInput.current?.click()}
        />
        <Tile
          icon={<IconMic size={26} />}
          title="Голос"
          hint="Надиктовать"
          disabled={!online}
          onClick={() => openCapture('voice', presetMeal ?? undefined)}
        />
        <Tile
          icon={<IconText size={26} />}
          title="Текст"
          hint="Описать словами"
          disabled={!online}
          onClick={() => openCapture('text', presetMeal ?? undefined)}
        />
        <Tile
          icon={<IconPencil size={26} />}
          title="Вручную"
          hint="Ввести КБЖУ"
          onClick={() => openCapture('manual', presetMeal ?? undefined)}
        />
      </div>

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
