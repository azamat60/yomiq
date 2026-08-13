const HOUR_TICKS = [0, 6, 12, 18];
const LATE_FROM_HOUR = 21;

export type Span = { label: string; from: number; to: number };

/** First-to-last meal per day on a 24-hour axis — the eating window made literal. */
export function SpanChart({ spans }: { spans: Span[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {spans.map((span, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-9 shrink-0 truncate text-[10.5px] text-faint">{span.label}</span>
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-track">
            <span
              className="absolute inset-y-0 bg-warn/15"
              style={{ left: `${(LATE_FROM_HOUR / 24) * 100}%`, right: 0 }}
            />
            <span
              className="absolute inset-y-0 rounded-full bg-accent"
              style={{
                left: `${(span.from / 24) * 100}%`,
                width: `${(Math.max(span.to - span.from, 0.4) / 24) * 100}%`,
              }}
            />
          </div>
          <span className="tnum w-9 shrink-0 text-right text-[11px] font-semibold">
            {Math.round(span.to - span.from)}h
          </span>
        </div>
      ))}

      <div className="flex gap-2">
        <span className="w-9 shrink-0" />
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
        <span className="w-9 shrink-0" />
      </div>
    </div>
  );
}
