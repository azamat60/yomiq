import { useEffect, useState } from 'react';

const STAGES = [
  'Reading your diary…',
  'Measuring your patterns…',
  'Looking for what repeats…',
  'Writing your report…',
];

const SHIMMER =
  'linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)';

export function CoachSkeleton({ compact }: { compact?: boolean }) {
  const heights = compact ? [72] : [128, 104, 176, 112];

  return (
    <div className="flex flex-col gap-3">
      {!compact && <Stage />}
      {heights.map((height, index) => (
        <div
          key={index}
          className="rounded-card border border-line"
          style={{
            height,
            background: SHIMMER,
            backgroundSize: '200% 100%',
            animation: `yq-shimmer 1.6s ${index * 0.18}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Stage() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStage((s) => Math.min(STAGES.length - 1, s + 1)), 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="px-1 text-center text-[14px] font-medium text-muted">{STAGES[stage]}</p>
  );
}
