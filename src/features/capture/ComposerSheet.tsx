import { useEffect, useRef, useState } from 'react';
import type { Favorite } from '@/db/types';
import { useOnline } from '@/shared/lib/useOnline';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { SegmentedControl } from '@/shared/ui/Field';
import { IconBarcode, IconPencil } from '@/shared/ui/icons';
import { QuickRow } from '@/features/favorites/QuickRow';
import { toFavorite, useQuickList } from '@/features/favorites/useQuickList';
import { ComposerBar } from './ComposerBar';
import { ErrorNotice } from './ErrorNotice';
import { MicDeniedNotice } from './MicDeniedNotice';
import { OfflineNotice } from './OfflineNotice';
import { RecordingBar } from './RecordingBar';
import { EXAMPLES, QUICK_TAB_OPTIONS, type QuickTab } from './constants';
import { useAnalyze } from './useAnalyze';
import { useMicPermission } from './useMicPermission';
import { useRecorder } from './useRecorder';

export function ComposerSheet({ open }: { open: boolean }) {
  const closeCapture = useAppStore((s) => s.closeCapture);
  const pushCapture = useAppStore((s) => s.pushCapture);
  const failAnalysis = useAppStore((s) => s.failAnalysis);
  const online = useOnline();
  const permission = useMicPermission();
  const { fromText, fromVoice } = useAnalyze();
  const { favorites, recent } = useQuickList();

  const [tab, setTab] = useState<QuickTab>('recent');
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const recorder = useRecorder({
    onComplete: (audio) => void fromVoice(audio),
    onEmpty: () => failAnalysis('Recording failed. Please try again.'),
    granted: permission === 'granted',
  });
  const recording = recorder.state === 'recording';
  const { cancel, release } = recorder;

  // Leaving the sheet must release the microphone, not keep it hot in background.
  useEffect(() => {
    if (open) return;
    setText('');
    cancel();
    release();
  }, [open, cancel, release]);

  const rows = tab === 'recent' ? recent.map(toFavorite) : favorites;
  const pick = (favorite: Favorite) => pushCapture({ kind: 'quickAdd', favorite });

  const send = () => {
    const value = text.trim();
    if (!value) return;
    haptic('select');
    void fromText(value);
  };

  return (
    <Sheet
      open={open}
      onClose={closeCapture}
      title="Add food"
      tall
      actions={
        <>
          <HeaderIcon
            label="Scan barcode"
            disabled={!online}
            onClick={() => pushCapture({ kind: 'barcode' })}
          >
            <IconBarcode size={20} />
          </HeaderIcon>
          <HeaderIcon label="Enter macros manually" onClick={() => pushCapture({ kind: 'manual' })}>
            <IconPencil size={20} />
          </HeaderIcon>
        </>
      }
      footer={
        recording ? (
          <RecordingBar
            seconds={recorder.seconds}
            level={recorder.level}
            maxSeconds={recorder.maxSeconds}
            onCancel={recorder.cancel}
            onSend={recorder.stop}
          />
        ) : (
          <ComposerBar
            value={text}
            onChange={setText}
            onSend={send}
            onPhoto={() => cameraInput.current?.click()}
            onMic={() => void recorder.start()}
            disabled={!online}
            inputRef={inputRef}
          />
        )
      }
    >
      <ErrorNotice />
      {!online && <OfflineNotice />}
      {permission === 'denied' && <MicDeniedNotice onType={() => inputRef.current?.focus()} />}
      {/* The standing notice above already explains a denied mic. */}
      {recorder.error && !(permission === 'denied' && recorder.errorKind === 'denied') && (
        <div className="mb-3 flex items-start gap-2.5 rounded-card border border-warn/30 bg-warn/10 px-4 py-3">
          <p className="flex-1 text-[14px] leading-snug">{recorder.error}</p>
          <button
            onClick={recorder.clearError}
            aria-label="Dismiss"
            className="shrink-0 text-[13px] font-medium text-muted active:opacity-60"
          >
            OK
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={QUICK_TAB_OPTIONS}
        />

        {rows.length > 0 ? (
          <ul className="overflow-hidden rounded-card border border-line bg-surface">
            {rows.map((favorite) => (
              <QuickRow key={favorite.id} favorite={favorite} onPick={() => pick(favorite)} />
            ))}
          </ul>
        ) : (
          <EmptyList tab={tab} onExample={(value) => setText(value)} />
        )}
      </div>

      {/* `capture` is the only path that reliably opens the camera in a standalone
          PWA on iOS, so the library picker has to be a separate input. */}
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          haptic('select');
          pushCapture({ kind: 'photo', file });
        }}
      />
    </Sheet>
  );
}

function EmptyList({ tab, onExample }: { tab: QuickTab; onExample: (value: string) => void }) {
  if (tab === 'favorites') {
    return (
      <p className="px-1 py-6 text-center text-[13.5px] leading-snug text-faint">
        Save a food from the editor and it will show up here for one-tap adding.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      <p className="px-1 text-[13px] text-faint">Nothing logged yet. Try describing a meal:</p>
      {EXAMPLES.map((example) => (
        <button
          key={example}
          onClick={() => onExample(example)}
          className="rounded-tile border border-line bg-surface px-3.5 py-2.5 text-left text-[13.5px] text-muted active:bg-surface-2"
        >
          {example}
        </button>
      ))}
    </div>
  );
}

function HeaderIcon({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => {
        haptic('select');
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full text-muted active:bg-surface-2 disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}
