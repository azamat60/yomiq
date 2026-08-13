import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Insight, InsightTurn, Profile } from '@/db/types';
import { appendTurns, entriesBetween, listInsights, saveInsight } from '@/db/repository';
import { ApiError } from '@/shared/api/client';
import { blocksToText, requestCoachAnswer, requestCoachReport } from '@/shared/api/coach';
import { shiftDateKey, toDateKey } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { buildStats, toModelFacts } from './metrics';
import { DEFAULT_PERIOD, REGENERATE_COOLDOWN_MS, type Period } from './constants';

const HISTORY_TURNS = 8;

export type CoachStatus = 'idle' | 'generating' | 'asking';

export function useCoach(profile: Profile) {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [status, setStatus] = useState<CoachStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cooling, setCooling] = useState(false);

  const insights = useLiveQuery(() => listInsights(20), [], undefined);
  const range = useMemo(() => rangeFor(period), [period]);

  const preview = useLiveQuery(
    async () => {
      const entries = await entriesBetween(range.from, range.to);
      return buildStats(entries, profile, range.from, range.to);
    },
    [range.from, range.to, profile],
    undefined,
  );

  const current = openId
    ? (insights?.find((insight) => insight.id === openId) ?? null)
    : (insights?.[0] ?? null);

  useEffect(() => {
    if (!cooling) return;
    const timer = setTimeout(() => setCooling(false), REGENERATE_COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [cooling]);

  const generate = async () => {
    if (status !== 'idle' || !preview) return;

    setStatus('generating');
    setError(null);

    try {
      const blocks = await requestCoachReport(toModelFacts(preview));
      const id = await saveInsight({
        from: preview.from,
        to: preview.to,
        days: preview.days,
        stats: preview,
        blocks,
        turns: [],
      });
      setOpenId(id);
      setCooling(true);
      haptic('success');
    } catch (cause) {
      setError(messageFor(cause));
      haptic('warning');
    } finally {
      setStatus('idle');
    }
  };

  const ask = async (question: string) => {
    if (status !== 'idle' || !current) return;

    const userTurn: InsightTurn = {
      id: crypto.randomUUID(),
      role: 'user',
      text: question,
      blocks: [],
      createdAt: Date.now(),
    };

    setStatus('asking');
    setError(null);
    await appendTurns(current.id, [userTurn]);

    try {
      const blocks = await requestCoachAnswer(
        toModelFacts(current.stats),
        question,
        historyFor(current).slice(-HISTORY_TURNS),
      );
      await appendTurns(current.id, [
        { id: crypto.randomUUID(), role: 'coach', text: '', blocks, createdAt: Date.now() },
      ]);
      haptic('success');
    } catch (cause) {
      setError(messageFor(cause));
      haptic('warning');
    } finally {
      setStatus('idle');
    }
  };

  return {
    period,
    setPeriod,
    insights: insights ?? [],
    current,
    open: setOpenId,
    preview,
    status,
    error,
    dismissError: () => setError(null),
    cooling,
    generate,
    ask,
  };
}

function rangeFor(period: Period): { from: string; to: string } {
  const to = toDateKey();
  return { from: shiftDateKey(to, -(period - 1)), to };
}

/** Coach turns go back as flattened text — resending their JSON buys nothing. */
function historyFor(insight: Insight): { role: 'user' | 'coach'; text: string }[] {
  return [
    { role: 'coach' as const, text: blocksToText(insight.blocks) },
    ...insight.turns.map((turn) => ({
      role: turn.role,
      text: turn.role === 'user' ? turn.text : blocksToText(turn.blocks),
    })),
  ];
}

function messageFor(cause: unknown): string {
  return cause instanceof ApiError ? cause.message : 'Could not reach the coach. Try again.';
}
