const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const BUCKET_HOURS = 2;
const BUCKETS = 24 / BUCKET_HOURS;
const HOUR_TICKS = [0, 6, 12, 18];
const LATE_FROM_BUCKET = 21 / BUCKET_HOURS;

export type Cell = { d: number; h: number; v: number };

/**
 * Weekday x two-hour bucket. Twenty-four columns would be six pixels wide on a
 * phone, so the day is halved. Late buckets mix towards the warning colour
 * instead of the accent, which is what makes an evening cluster jump out.
 */
export function Heatmap({ cells }: { cells: Cell[] }) {
  const grid = new Array<number>(7 * BUCKETS).fill(0);
  for (const cell of cells) grid[cell.d * BUCKETS + cell.h] = cell.v;

  return (
    <div className="flex flex-col gap-[3px]">
      {DOW.map((label, day) => (
        <div key={day} className="flex items-center gap-1.5">
          <span className="w-3 shrink-0 text-[10px] text-faint">{label}</span>
          <div className="flex flex-1 gap-[3px]">
            {Array.from({ length: BUCKETS }, (_, bucket) => (
              <span
                key={bucket}
                className="aspect-square flex-1 rounded-[3px]"
                style={{ background: cellColor(grid[day * BUCKETS + bucket], bucket) }}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-1 flex gap-1.5">
        <span className="w-3 shrink-0" />
        <div className="relative h-3 flex-1">
          {HOUR_TICKS.map((hour) => (
            <span
              key={hour}
              className="tnum absolute text-[10px] text-faint"
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              {hour}:00
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function cellColor(value: number, bucket: number): string {
  const base = bucket >= LATE_FROM_BUCKET ? 'var(--warn)' : 'var(--accent)';
  return `color-mix(in srgb, ${base} ${Math.round(value * 100)}%, var(--track))`;
}
