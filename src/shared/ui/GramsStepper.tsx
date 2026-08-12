import { haptic } from '@/shared/lib/haptics';
import { cn } from '@/shared/lib/cn';

const QUICK = [50, 100, 150, 200, 300];
const MAX_GRAMS = 5000;

type Props = {
  grams: number;
  onChange: (grams: number) => void;
};

export function GramsStepper({ grams, onChange }: Props) {
  const step = grams >= 200 ? 25 : 10;

  const nudge = (delta: number) => {
    haptic('tap');
    onChange(Math.min(MAX_GRAMS, Math.max(1, Math.round(grams + delta))));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <StepButton label="−" onClick={() => nudge(-step)} />
        <label className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-line bg-surface px-3 py-2.5 focus-within:border-accent">
          <input
            type="number"
            inputMode="numeric"
            value={String(grams)}
            onChange={(e) => onChange(Math.min(MAX_GRAMS, Math.max(0, Number(e.target.value) || 0)))}
            className="tnum w-16 bg-transparent text-center text-[20px] font-bold outline-none"
          />
          <span className="text-[15px] text-faint">g</span>
        </label>
        <StepButton label="+" onClick={() => nudge(step)} />
      </div>

      <div className="flex gap-1.5">
        {QUICK.map((value) => (
          <button
            key={value}
            onClick={() => {
              haptic('select');
              onChange(value);
            }}
            className={cn(
              'tnum flex-1 rounded-full py-1.5 text-[13px] font-medium transition-colors',
              grams === value ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted active:bg-surface-3',
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label === '+' ? 'More' : 'Less'}
      className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-2 text-[24px] font-semibold text-text transition-transform active:scale-90 active:bg-surface-3"
    >
      {label}
    </button>
  );
}
