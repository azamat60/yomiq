import {
  CALLOUT_KIND,
  COACH_SERIES,
  EFFORT,
  TONE,
  type CalloutKind,
  type CoachBlock,
  type CoachSeries,
  type Effort,
  type Tone,
} from '@/db/types';
import type { CoachFacts } from '@/features/coach/metrics';
import { clamp, post } from './client';

export type CoachHistoryTurn = { role: 'user' | 'coach'; text: string };

const MAX_BLOCKS = 12;
const LIMIT = {
  metrics: 6,
  bars: 14,
  steps: 6,
  rows: 8,
} as const;

export async function requestCoachReport(facts: CoachFacts): Promise<CoachBlock[]> {
  return normalizeBlocks(
    await post('/api/coach', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'report', facts }),
    }),
  );
}

export async function requestCoachAnswer(
  facts: CoachFacts,
  question: string,
  history: CoachHistoryTurn[],
): Promise<CoachBlock[]> {
  return normalizeBlocks(
    await post('/api/coach', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'chat', facts, question, history }),
    }),
  );
}

/** Model output is untrusted input: clamp it before it reaches the UI or the DB. */
export function normalizeBlocks(payload: unknown): CoachBlock[] {
  const raw = (payload as { blocks?: unknown }).blocks;
  return (Array.isArray(raw) ? raw : [])
    .slice(0, MAX_BLOCKS)
    .map(normalizeBlock)
    .filter((block): block is CoachBlock => block !== null);
}

function normalizeBlock(input: unknown): CoachBlock | null {
  const block = input as Record<string, unknown>;

  switch (block?.type) {
    case 'verdict':
      return {
        type: 'verdict',
        tone: toTone(block.tone),
        headline: text(block.headline, 80),
        summary: text(block.summary, 400),
        score: block.score === null ? null : clamp(block.score, 0, 100, 50),
      };

    case 'metrics': {
      const items = list(block.items, LIMIT.metrics).map((item) => ({
        label: text(item.label, 24),
        value: text(item.value, 12),
        unit: text(item.unit, 10),
        hint: text(item.hint, 60),
        tone: toTone(item.tone),
      }));
      return items.length ? { type: 'metrics', title: text(block.title, 60), items } : null;
    }

    case 'chart': {
      const series = toKey(block.series, COACH_SERIES) as CoachSeries | null;
      return series
        ? { type: 'chart', series, title: text(block.title, 60), caption: text(block.caption, 140) }
        : null;
    }

    case 'bar': {
      const bars = list(block.bars, LIMIT.bars).map((bar) => ({
        label: text(bar.label, 16),
        value: clamp(bar.value, 0, 1e6, 0),
        tone: toTone(bar.tone),
      }));
      return bars.length
        ? {
            type: 'bar',
            title: text(block.title, 60),
            unit: text(block.unit, 10),
            target: block.target === null ? null : clamp(block.target, 0, 1e6, 0),
            bars,
          }
        : null;
    }

    case 'insight':
      return {
        type: 'insight',
        tone: toTone(block.tone),
        title: text(block.title, 70),
        body: text(block.body, 500),
        evidence: text(block.evidence, 160),
      };

    case 'actions': {
      const steps = list(block.steps, LIMIT.steps).map((step) => ({
        title: text(step.title, 70),
        detail: text(step.detail, 240),
        effort: (toKey(step.effort, EFFORT) ?? 'medium') as Effort,
      }));
      return steps.length ? { type: 'actions', title: text(block.title, 60), steps } : null;
    }

    case 'comparison': {
      const rows = list(block.rows, LIMIT.rows).map((row) => ({
        label: text(row.label, 40),
        you: text(row.you, 40),
        suggested: text(row.suggested, 40),
        tone: toTone(row.tone),
      }));
      return rows.length ? { type: 'comparison', title: text(block.title, 60), rows } : null;
    }

    case 'callout':
      return {
        type: 'callout',
        kind: (toKey(block.kind, CALLOUT_KIND) ?? 'note') as CalloutKind,
        tone: toTone(block.tone),
        title: text(block.title, 70),
        body: text(block.body, 400),
      };

    default:
      return null;
  }
}

/** Flattens a coach answer for the next request — the model never sees its own JSON twice. */
export function blocksToText(blocks: CoachBlock[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'verdict':
        lines.push(block.headline);
        break;
      case 'insight':
        lines.push(`${block.title} — ${block.evidence}`);
        break;
      case 'actions':
        lines.push(...block.steps.map((step) => `- ${step.title}`));
        break;
      case 'callout':
        lines.push(block.title);
        break;
      default:
        break;
    }
  }

  return lines.join('\n').slice(0, 700);
}

function list(value: unknown, limit: number): Record<string, unknown>[] {
  return (Array.isArray(value) ? value : [])
    .slice(0, limit)
    .map((item) => (item ?? {}) as Record<string, unknown>);
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function toTone(value: unknown): Tone {
  return (toKey(value, TONE) ?? 'neutral') as Tone;
}

function toKey(value: unknown, allowed: Record<string, string>): string | null {
  return typeof value === 'string' && Object.hasOwn(allowed, value) ? value : null;
}
