import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const STAGES = [
  'Reading the photo…',
  'Identifying the dishes…',
  'Estimating portion weight…',
  'Calculating calories and macros…',
];

export function AnalyzingOverlay({ open }: { open: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!open) {
      setStage(0);
      return;
    }
    const timer = setInterval(() => setStage((s) => Math.min(STAGES.length - 1, s + 1)), 2200);
    return () => clearInterval(timer);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-70 flex flex-col items-center justify-center gap-6 bg-bg/92 px-8 backdrop-blur-lg [animation:yq-fade-in_200ms_ease]">
      <PlateSpinner />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[17px] font-semibold">{STAGES[stage]}</p>
        <p className="text-[13.5px] text-muted">Usually takes a few seconds</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-14 rounded-2xl border border-line"
            style={{
              background:
                'linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)',
              backgroundSize: '200% 100%',
              animation: `yq-shimmer 1.6s ${index * 0.18}s linear infinite`,
            }}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}

function PlateSpinner() {
  return (
    <div className="relative grid size-20 place-items-center">
      <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-surface-2 border-t-accent" />
      <span className="text-[30px]">🍽</span>
    </div>
  );
}
