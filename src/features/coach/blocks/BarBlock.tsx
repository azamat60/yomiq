import type { CoachBlock } from '@/db/types';
import { TONE_COLOR } from '../constants';
import { HBarChart } from '../charts/HBarChart';
import { BlockCard } from './BlockCard';

type Bar = Extract<CoachBlock, { type: 'bar' }>;

export function BarBlock({ block }: { block: Bar }) {
  return (
    <BlockCard
      title={block.title}
      caption={block.target !== null ? `Target: ${block.target}${block.unit}` : undefined}
    >
      <HBarChart
        rows={block.bars.map((bar) => ({
          label: bar.label,
          value: bar.value,
          color: TONE_COLOR[bar.tone],
        }))}
        format={(value) => `${round(value)}${block.unit}`}
      />
    </BlockCard>
  );
}

function round(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
