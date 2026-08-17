import { IconCamera, IconMic, IconSend } from '@/shared/ui/icons';
import { COMPOSER_MAX_CHARS } from './constants';

export function ComposerBar({
  value,
  onChange,
  onSend,
  onPhoto,
  onMic,
  disabled,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPhoto: () => void;
  onMic: () => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const canSend = value.trim().length > 0;

  return (
    <div className="flex items-end gap-2 rounded-card border border-line bg-surface p-2">
      <button
        onClick={onPhoto}
        disabled={disabled}
        aria-label="Take a photo"
        className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-transform duration-150 active:scale-90 active:bg-surface-2 disabled:pointer-events-none disabled:opacity-35"
      >
        <IconCamera size={22} />
      </button>

      <textarea
        ref={inputRef}
        value={value}
        rows={1}
        maxLength={COMPOSER_MAX_CHARS}
        disabled={disabled}
        enterKeyHint="send"
        placeholder={disabled ? 'Offline — recognition needs a connection' : 'What did you eat?'}
        onChange={(event) => onChange(event.target.value)}
        onInput={(event) => {
          const el = event.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
        onKeyDown={(event) => {
          // Soft keyboards send a bare Enter, and a newline is never wanted here.
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSend();
          }
        }}
        className="max-h-30 flex-1 resize-none self-center bg-transparent px-1 py-2 text-[15px] outline-none placeholder:text-faint"
      />

      {/* One slot, two buttons: the swap is what makes the bar read as a composer. */}
      {canSend ? (
        <button
          onClick={onSend}
          disabled={disabled}
          aria-label="Analyse"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-150 active:scale-90 disabled:pointer-events-none disabled:opacity-30 [animation:yq-pop-in_180ms_var(--ease-out-back)]"
        >
          <IconSend size={20} />
        </button>
      ) : (
        <button
          onClick={onMic}
          disabled={disabled}
          aria-label="Record voice"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-muted transition-transform duration-150 active:scale-90 disabled:pointer-events-none disabled:opacity-35"
        >
          <IconMic size={21} />
        </button>
      )}
    </div>
  );
}
