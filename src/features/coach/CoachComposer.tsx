import { useState } from 'react';
import { haptic } from '@/shared/lib/haptics';
import { IconSend } from '@/shared/ui/icons';

const SUGGESTIONS = [
  'Why do I snack so much?',
  'What should I change first?',
  'Is my protein enough?',
];

const MAX_CHARS = 400;

export function CoachComposer({
  disabled,
  busy,
  showSuggestions,
  onAsk,
}: {
  disabled: boolean;
  busy: boolean;
  showSuggestions: boolean;
  onAsk: (question: string) => void;
}) {
  const [value, setValue] = useState('');

  const send = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || disabled || busy) return;
    haptic('select');
    setValue('');
    onAsk(trimmed.slice(0, MAX_CHARS));
  };

  return (
    <div className="flex flex-col gap-2.5">
      {showSuggestions && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              disabled={disabled || busy}
              onClick={() => send(suggestion)}
              className="shrink-0 rounded-pill border border-line bg-surface px-3.5 py-2 text-[13px] text-muted active:bg-surface-2 disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-card border border-line bg-surface p-2 pl-4">
        <textarea
          value={value}
          rows={1}
          maxLength={MAX_CHARS}
          disabled={disabled}
          placeholder={disabled ? 'Offline — questions need a connection' : 'Ask the coach…'}
          onChange={(event) => setValue(event.target.value)}
          onInput={(event) => {
            const el = event.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }}
          className="max-h-30 flex-1 resize-none self-center bg-transparent py-2 text-[15px] outline-none placeholder:text-faint"
        />
        <button
          onClick={() => send(value)}
          disabled={!value.trim() || disabled || busy}
          aria-label="Ask"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-150 active:scale-90 disabled:pointer-events-none disabled:opacity-30"
        >
          <IconSend size={20} />
        </button>
      </div>
    </div>
  );
}
