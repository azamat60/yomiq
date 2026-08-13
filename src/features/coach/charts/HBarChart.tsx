export type Row = { label: string; value: number; caption?: string; color?: string };

export function HBarChart({ rows, format }: { rows: Row[]; format: (value: number) => string }) {
  const peak = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="min-w-0 truncate text-[13.5px]">{row.label}</span>
            <span className="tnum shrink-0 text-[13px] font-semibold">
              {format(row.value)}
              {row.caption && <span className="pl-1 font-normal text-faint">{row.caption}</span>}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${(row.value / peak) * 100}%`,
                background: row.color ?? 'var(--accent)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
