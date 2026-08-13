import type { CoachBlock } from '@/db/types';
import { TONE_COLOR, TONE_ICON } from '../constants';

type Callout = Extract<CoachBlock, { type: 'callout' }>;

export function CalloutBlock({ block }: { block: Callout }) {
  const color = TONE_COLOR[block.tone];
  const Icon = TONE_ICON[block.tone];

  return (
    <section
      className="flex gap-3 rounded-card border p-4"
      style={{
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        background: `color-mix(in srgb, ${color} 10%, var(--surface))`,
      }}
    >
      <Icon size={19} className="mt-0.5 shrink-0" style={{ color }} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-[15px] leading-tight font-semibold">{block.title}</h3>
        <p className="text-[13.5px] leading-snug text-muted">{block.body}</p>
      </div>
    </section>
  );
}
