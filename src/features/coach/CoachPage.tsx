import { useState } from 'react';
import type { CoachStats, Insight } from '@/db/types';
import { useProfile } from '@/db/useProfile';
import { useOnline } from '@/shared/lib/useOnline';
import { formatDayLabel } from '@/shared/lib/date';
import { Button } from '@/shared/ui/Button';
import { SegmentedControl } from '@/shared/ui/Field';
import { IconCoach, IconHistory, IconWarning } from '@/shared/ui/icons';
import { BlockList } from './blocks/BlockList';
import { CoachComposer } from './CoachComposer';
import { CoachDisclaimer } from './CoachDisclaimer';
import { CoachEmptyState } from './CoachEmptyState';
import { CoachHistorySheet } from './CoachHistorySheet';
import { CoachSkeleton } from './CoachSkeleton';
import { MIN_DAYS_LOGGED, MIN_ENTRIES, PERIOD_OPTIONS, type Period } from './constants';
import { useCoach } from './useCoach';

export function CoachPage() {
  const profile = useProfile();
  if (!profile) return null;
  return <Coach key={profile.updatedAt} profile={profile} />;
}

function Coach({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>> }) {
  const online = useOnline();
  const [historyOpen, setHistoryOpen] = useState(false);
  const coach = useCoach(profile);

  const enough =
    coach.preview !== undefined &&
    coach.preview.daysLogged >= MIN_DAYS_LOGGED &&
    coach.preview.entryCount >= MIN_ENTRIES;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-bg/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
        <h1 className="flex-1 text-[24px] font-bold tracking-tight">Coach</h1>
        <button
          onClick={() => setHistoryOpen(true)}
          aria-label="Past reports"
          className="grid size-10 shrink-0 place-items-center rounded-full text-muted active:bg-surface-2"
        >
          <IconHistory size={21} />
        </button>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        <SegmentedControl
          value={String(coach.period)}
          onChange={(period) => coach.setPeriod(Number(period) as Period)}
          options={PERIOD_OPTIONS.map((days) => ({ value: String(days), label: `${days} days` }))}
        />

        {!online && (
          <Notice tone="muted">Offline. Saved reports still open; new ones need a connection.</Notice>
        )}

        {coach.error && (
          <Notice tone="warn" onDismiss={coach.dismissError}>
            {coach.error}
          </Notice>
        )}

        {!enough && coach.preview && (
          <CoachEmptyState
            daysLogged={coach.preview.daysLogged}
            entryCount={coach.preview.entryCount}
          />
        )}

        {enough && (
          <Button
            size="lg"
            block
            disabled={!online || coach.cooling}
            loading={coach.status === 'generating'}
            onClick={() => void coach.generate()}
          >
            <IconCoach size={20} />
            {coach.current ? 'New report' : 'Analyse my diet'}
          </Button>
        )}

        {coach.status === 'generating' && <CoachSkeleton />}

        {coach.current && coach.status !== 'generating' && (
          <Report insight={coach.current} asking={coach.status === 'asking'} />
        )}

        {coach.current && (
          <CoachComposer
            disabled={!online}
            busy={coach.status !== 'idle'}
            showSuggestions={coach.current.turns.length === 0}
            onAsk={(question) => void coach.ask(question)}
          />
        )}
      </div>

      <CoachHistorySheet
        open={historyOpen}
        insights={coach.insights}
        currentId={coach.current?.id ?? null}
        onClose={() => setHistoryOpen(false)}
        onOpen={coach.open}
      />
    </div>
  );
}

function Report({ insight, asking }: { insight: Insight; asking: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="px-1 text-[12.5px] text-faint">
        {insight.days} days up to {formatDayLabel(insight.to).toLowerCase()} ·{' '}
        {insight.stats.daysLogged} days logged
      </p>

      <BlockList blocks={insight.blocks} stats={insight.stats} />
      <CoachDisclaimer />

      {insight.turns.map((turn) =>
        turn.role === 'user' ? (
          <p
            key={turn.id}
            className="ml-auto max-w-[85%] rounded-card rounded-br-md bg-accent-soft px-4 py-2.5 text-[14.5px] text-text"
          >
            {turn.text}
          </p>
        ) : (
          <Answer key={turn.id} blocks={turn.blocks} stats={insight.stats} />
        ),
      )}

      {asking && <CoachSkeleton compact />}
    </div>
  );
}

function Answer({ blocks, stats }: { blocks: Insight['blocks']; stats: CoachStats }) {
  if (!blocks.length) return null;
  return <BlockList blocks={blocks} stats={stats} />;
}

function Notice({
  tone,
  onDismiss,
  children,
}: {
  tone: 'warn' | 'muted';
  onDismiss?: () => void;
  children: React.ReactNode;
}) {
  if (tone === 'muted') {
    return (
      <p className="rounded-card border border-line px-4 py-3 text-[13px] text-faint">{children}</p>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-card border border-warn/30 bg-warn/10 px-4 py-3">
      <IconWarning size={19} className="mt-0.5 shrink-0 text-warn" />
      <p className="flex-1 text-[14px] leading-snug">{children}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-[13px] font-medium text-muted active:opacity-60"
        >
          OK
        </button>
      )}
    </div>
  );
}
