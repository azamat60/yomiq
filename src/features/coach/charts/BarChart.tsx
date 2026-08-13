export type Column = { label: string; value: number; over?: boolean };

/**
 * Columns are absolute values; the axis is the tallest column or the target,
 * whichever is larger, so an over-target day never touches the ceiling.
 */
export function BarChart({
  columns,
  target,
  format,
}: {
  columns: Column[];
  target?: number;
  format: (value: number) => string;
}) {
  const peak = Math.max(...columns.map((column) => column.value), target ?? 0, 1);
  const targetRatio = target ? target / peak : null;

  return (
    <div className="flex flex-col gap-2">
      {/* The right gutter keeps the target label clear of the last column. */}
      <div className="relative h-32 pr-9">
        {targetRatio !== null && (
          <div
            className="pointer-events-none absolute inset-x-0 flex items-center"
            style={{ bottom: `${targetRatio * 100}%` }}
          >
            <span className="h-px flex-1 bg-line-strong" />
            <span className="tnum w-9 shrink-0 pl-1.5 text-[10.5px] text-faint">
              {format(target as number)}
            </span>
          </div>
        )}

        <div className="flex h-full items-end gap-[3px]">
          {columns.map((column, index) => (
            <div key={index} className="flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-[3px] transition-[height] duration-500 ease-out"
                style={{
                  height: `${Math.max(column.value / peak, column.value > 0 ? 0.02 : 0) * 100}%`,
                  background: column.over ? 'var(--warn)' : 'var(--accent)',
                  minHeight: column.value > 0 ? 2 : 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-[3px] pr-9">
        {columns.map((column, index) => (
          <span key={index} className="flex-1 truncate text-center text-[10px] text-faint">
            {column.label}
          </span>
        ))}
      </div>
    </div>
  );
}
