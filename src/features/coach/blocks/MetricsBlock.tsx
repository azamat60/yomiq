import type { CoachBlock } from '@/db/types';
import { TONE_COLOR } from '../constants';
import { BlockCard } from './BlockCard';

type Metrics = Extract<CoachBlock, { type: 'metrics' }>;

export function MetricsBlock({ block }: { block: Metrics }) {
  return (
    <BlockCard title={block.title}>
      <div className="grid grid-cols-2 gap-2.5">
        {block.items.map((item, index) => (
          <div key={index} className="flex flex-col gap-0.5 rounded-tile bg-surface-2 px-3 py-2.5">
            <span className="truncate text-[12px] text-muted">{item.label}</span>
            <span className="tnum text-[20px] leading-tight font-bold" style={{ color: TONE_COLOR[item.tone] }}>
              {item.value}
              {item.unit && <span className="pl-0.5 text-[13px] font-semibold">{item.unit}</span>}
            </span>
            {item.hint && <span className="truncate text-[11.5px] text-faint">{item.hint}</span>}
          </div>
        ))}
      </div>
    </BlockCard>
  );
}
