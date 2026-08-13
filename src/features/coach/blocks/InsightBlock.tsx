import type { CoachBlock } from '@/db/types';
import { TONE_COLOR, TONE_ICON } from '../constants';

type Insight = Extract<CoachBlock, { type: 'insight' }>;

export function InsightBlock({ block }: { block: Insight }) {
  const color = TONE_COLOR[block.tone];
  const Icon = TONE_ICON[block.tone];

  return (
    <section className="flex gap-3 rounded-card border border-line bg-surface p-4">
      <span
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
      >
        <Icon size={16} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-[15.5px] leading-tight font-semibold">{block.title}</h3>
        <p className="text-[14px] leading-snug text-muted">{block.body}</p>
        {block.evidence && (
          <p
            className="border-l-2 pl-2.5 text-[13px] leading-snug"
            style={{ borderColor: color, color }}
          >
            {block.evidence}
          </p>
        )}
      </div>
    </section>
  );
}
