import type { CoachBlock } from '@/db/types';
import { TONE_COLOR } from '../constants';

type Verdict = Extract<CoachBlock, { type: 'verdict' }>;

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function VerdictBlock({ block }: { block: Verdict }) {
  const color = TONE_COLOR[block.tone];

  return (
    <section
      className="flex flex-col gap-3 rounded-card border p-4"
      style={{
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
        background: `color-mix(in srgb, ${color} 8%, var(--surface))`,
      }}
    >
      <div className="flex items-start gap-3.5">
        {block.score !== null && <ScoreRing score={block.score} color={color} />}
        <h2 className="flex-1 pt-1 text-[19px] leading-tight font-bold tracking-tight">
          {block.headline}
        </h2>
      </div>
      <p className="text-[14.5px] leading-snug text-muted">{block.summary}</p>
    </section>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  return (
    <span className="relative grid size-16 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="var(--track)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
        />
      </svg>
      <span className="tnum text-[18px] font-bold">{Math.round(score)}</span>
    </span>
  );
}
