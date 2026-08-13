export type Slice = { label: string; share: number; color: string };

/** One bar for the whole, plus a legend — the shares only read as parts of a total. */
export function StackedBar({ slices, reference }: { slices: Slice[]; reference?: Slice[] }) {
  return (
    <div className="flex flex-col gap-3">
      <Track slices={slices} />

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {slices.map((slice) => (
          <span key={slice.label} className="flex items-center gap-1.5 text-[12.5px]">
            <span className="size-2 shrink-0 rounded-full" style={{ background: slice.color }} />
            <span className="min-w-0 flex-1 truncate text-muted">{slice.label}</span>
            <span className="tnum font-semibold">{Math.round(slice.share * 100)}%</span>
          </span>
        ))}
      </div>

      {reference && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-3">
          <span className="text-[12px] text-faint">Your target for comparison</span>
          <Track slices={reference} muted />
        </div>
      )}
    </div>
  );
}

function Track({ slices, muted }: { slices: Slice[]; muted?: boolean }) {
  return (
    <div
      className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-track"
      style={{ opacity: muted ? 0.45 : 1 }}
    >
      {slices.map((slice) => (
        <span
          key={slice.label}
          className="h-full transition-[flex-grow] duration-500 ease-out"
          style={{ flexGrow: Math.max(slice.share, 0.001), background: slice.color }}
        />
      ))}
    </div>
  );
}
