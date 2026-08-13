import type { CoachBlock, CoachStats } from '@/db/types';
import { ActionsBlock } from './ActionsBlock';
import { BarBlock } from './BarBlock';
import { CalloutBlock } from './CalloutBlock';
import { ChartBlock } from './ChartBlock';
import { ComparisonBlock } from './ComparisonBlock';
import { InsightBlock } from './InsightBlock';
import { MetricsBlock } from './MetricsBlock';
import { VerdictBlock } from './VerdictBlock';

export function BlockList({ blocks, stats }: { blocks: CoachBlock[]; stats: CoachStats }) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => (
        <div key={index} className="[animation:yq-pop-in_260ms_var(--ease-out-back)_both]">
          {renderBlock(block, stats)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: CoachBlock, stats: CoachStats): React.ReactNode {
  switch (block.type) {
    case 'verdict':
      return <VerdictBlock block={block} />;
    case 'metrics':
      return <MetricsBlock block={block} />;
    case 'chart':
      return <ChartBlock block={block} stats={stats} />;
    case 'bar':
      return <BarBlock block={block} />;
    case 'insight':
      return <InsightBlock block={block} />;
    case 'actions':
      return <ActionsBlock block={block} />;
    case 'comparison':
      return <ComparisonBlock block={block} />;
    case 'callout':
      return <CalloutBlock block={block} />;
    default: {
      // Every block type must render; the clamp already dropped unknown ones.
      const never: never = block;
      return never;
    }
  }
}
