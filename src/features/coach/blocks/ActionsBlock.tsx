import type { CoachBlock } from '@/db/types';
import { EFFORT_LABEL } from '../constants';
import { BlockCard } from './BlockCard';

type Actions = Extract<CoachBlock, { type: 'actions' }>;

export function ActionsBlock({ block }: { block: Actions }) {
  return (
    <BlockCard title={block.title}>
      <ol className="flex flex-col gap-3">
        {block.steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="tnum mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[12.5px] font-bold text-accent">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] leading-tight font-medium">{step.title}</span>
              {step.detail && (
                <span className="text-[13.5px] leading-snug text-muted">{step.detail}</span>
              )}
              <span className="mt-1 w-fit rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] text-faint">
                {EFFORT_LABEL[step.effort]}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </BlockCard>
  );
}
