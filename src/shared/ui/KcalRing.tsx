import { useEffect, useState } from 'react';

const SIZE = 208;
const STROKE = 15;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Leaves a gap at the bottom so the arc reads as a gauge, not a closed loop. */
const SWEEP = 0.78;
/** Rotates the arc start so that gap ends up centred at the bottom. */
const ARC_START_DEG = 90 + ((1 - SWEEP) * 360) / 2;

type Props = {
  consumed: number;
  target: number;
};

export function KcalRing({ consumed, target }: Props) {
  const ratio = target > 0 ? consumed / target : 0;
  const over = consumed > target;
  const remaining = Math.round(target - consumed);

  const animatedRatio = useAnimatedNumber(Math.min(ratio, 1));
  const arc = CIRCUMFERENCE * SWEEP;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: `rotate(${ARC_START_DEG}deg)` }}
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${CIRCUMFERENCE}`}
        />
        {/* A round linecap paints a visible dot even at zero length. */}
        {animatedRatio > 0.002 && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={over ? 'var(--warn)' : 'var(--accent)'}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${arc * animatedRatio} ${CIRCUMFERENCE}`}
            style={{ transition: 'stroke 300ms ease' }}
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
        <span className="tnum text-[52px] leading-none font-bold tracking-tight">
          {Math.abs(remaining)}
        </span>
        <span className="mt-1.5 text-[13px] font-medium text-muted">
          {over ? 'ккал перебор' : 'ккал осталось'}
        </span>
        <span className="tnum mt-3 text-[13px] text-faint">
          {Math.round(consumed)} / {target}
        </span>
      </div>
    </div>
  );
}

/** Eases the arc to its new length instead of snapping when an entry lands. */
function useAnimatedNumber(value: number): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const from = current;
    const delta = value - from;
    if (Math.abs(delta) < 0.001) return;

    const duration = 550;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(from + delta * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Re-running on `current` would restart the tween every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return current;
}
