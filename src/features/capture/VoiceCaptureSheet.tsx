import { useEffect } from 'react';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { IconMic } from '@/shared/ui/icons';
import { haptic } from '@/shared/lib/haptics';
import { useAnalyze } from './useAnalyze';
import { useRecorder } from './useRecorder';
import { ErrorNotice } from './ErrorNotice';

export function VoiceCaptureSheet({ open }: { open: boolean }) {
  const closeCapture = useAppStore((s) => s.closeCapture);
  const failAnalysis = useAppStore((s) => s.failAnalysis);
  const { fromVoice } = useAnalyze();
  const { state, seconds, level, error, start, stop, cancel, maxSeconds } = useRecorder();

  const recording = state === 'recording';

  // Leaving the sheet must release the microphone, not keep it hot in background.
  useEffect(() => {
    if (!open && recording) cancel();
  }, [open, recording, cancel]);

  const finish = async () => {
    haptic('select');
    const audio = await stop();
    if (!audio) {
      failAnalysis('Запись не получилась. Попробуйте ещё раз.');
      return;
    }
    void fromVoice(audio);
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        cancel();
        closeCapture();
      }}
      title="Расскажите, что вы съели"
    >
      <div className="flex flex-col items-center gap-6 py-2">
        <ErrorNotice />
        {error && (
          <p className="w-full rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-[14px]">
            {error}
          </p>
        )}

        <p className="max-w-[17rem] text-center text-[14px] text-muted">
          {recording
            ? 'Говорите — например: «тарелка борща со сметаной и два куска хлеба»'
            : 'Нажмите на микрофон и перечислите блюда с примерным количеством'}
        </p>

        <button
          onClick={() => {
            haptic('select');
            if (recording) void finish();
            else void start();
          }}
          aria-label={recording ? 'Остановить запись' : 'Начать запись'}
          className="relative grid size-28 place-items-center rounded-full transition-transform active:scale-95"
          style={{ background: recording ? 'var(--danger)' : 'var(--accent)' }}
        >
          {recording && (
            <span
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: 'var(--danger)',
                transform: `scale(${1 + level * 0.55})`,
                transition: 'transform 90ms linear',
              }}
            />
          )}
          <span className="relative" style={{ color: recording ? '#fff' : 'var(--on-accent)' }}>
            {recording ? <StopGlyph /> : <IconMic size={40} />}
          </span>
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="tnum text-[22px] font-semibold">{formatDuration(seconds)}</span>
          <span className="text-[12.5px] text-faint">
            {recording ? `максимум ${maxSeconds} с` : 'Нажмите, чтобы записать'}
          </span>
        </div>

        {recording && (
          <Button variant="ghost" onClick={cancel}>
            Отменить
          </Button>
        )}
      </div>
    </Sheet>
  );
}

function StopGlyph() {
  return <span className="block size-8 rounded-lg bg-current" />;
}

function formatDuration(seconds: number): string {
  return `0:${String(seconds).padStart(2, '0')}`;
}
