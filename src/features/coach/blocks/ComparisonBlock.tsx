import type { CoachBlock } from '@/db/types';
import { TONE_COLOR } from '../constants';
import { BlockCard } from './BlockCard';

type Comparison = Extract<CoachBlock, { type: 'comparison' }>;

export function ComparisonBlock({ block }: { block: Comparison }) {
  return (
    <BlockCard title={block.title}>
      <div className="flex flex-col">
        <div className="flex gap-2 pb-1.5 text-[11.5px] text-faint">
          <span className="flex-1" />
          <span className="w-[4.5rem] shrink-0 text-right">You</span>
          <span className="w-[4.5rem] shrink-0 text-right">Suggested</span>
        </div>

        {block.rows.map((row, index) => (
          <div
            key={index}
            className="flex items-baseline gap-2 border-t border-line py-2 text-[13.5px]"
          >
            <span className="min-w-0 flex-1 truncate text-muted">{row.label}</span>
            <span
              className="tnum w-[4.5rem] shrink-0 text-right font-semibold"
              style={{ color: TONE_COLOR[row.tone] }}
            >
              {row.you}
            </span>
            <span className="tnum w-[4.5rem] shrink-0 text-right">{row.suggested}</span>
          </div>
        ))}
      </div>
    </BlockCard>
  );
}
