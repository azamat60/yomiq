import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { haptic } from '@/shared/lib/haptics';
import { useAnalyze } from './useAnalyze';
import { ErrorNotice } from './ErrorNotice';

const EXAMPLES = [
  'Овсянка на молоке и банан',
  'Куриная грудка 200 г с гречкой',
  'Два яйца, тост с авокадо, кофе с молоком',
];

export function TextCaptureSheet({ open }: { open: boolean }) {
  const closeCapture = useAppStore((s) => s.closeCapture);
  const { fromText } = useAnalyze();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 320);
    else setText('');
  }, [open]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    haptic('select');
    void fromText(value);
  };

  return (
    <Sheet open={open} onClose={closeCapture} title="Что вы съели?">
      <div className="flex flex-col gap-4">
        <ErrorNotice />

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="Например: тарелка борща со сметаной и кусок хлеба"
          className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3.5 leading-snug outline-none placeholder:text-faint focus:border-accent"
        />

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] text-faint">Примеры</span>
          <div className="flex flex-col gap-1.5">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => {
                  haptic('tap');
                  setText(example);
                  inputRef.current?.focus();
                }}
                className="rounded-2xl bg-surface-2 px-4 py-2.5 text-left text-[14px] text-muted active:bg-surface-3"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <Button size="lg" block disabled={!text.trim()} onClick={submit}>
          Посчитать
        </Button>
      </div>
    </Sheet>
  );
}
