import type { Insight } from '@/db/types';
import { deleteInsight } from '@/db/repository';
import { formatFullDate } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { Sheet } from '@/shared/ui/Sheet';
import { IconTrash } from '@/shared/ui/icons';

export function CoachHistorySheet({
  open,
  insights,
  currentId,
  onClose,
  onOpen,
}: {
  open: boolean;
  insights: Insight[];
  currentId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Past reports" tall>
      {insights.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-muted">No reports yet.</p>
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-card border border-line bg-surface">
          {insights.map((insight) => (
            <li key={insight.id} className="flex items-center border-b border-line last:border-b-0">
              <button
                onClick={() => {
                  haptic('tap');
                  onOpen(insight.id);
                  onClose();
                }}
                className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-4 py-3 text-left active:bg-surface-2"
              >
                <span className="text-[15px] font-medium">
                  {formatFullDate(insight.to)}
                  {insight.id === currentId && (
                    <span className="pl-2 text-[12px] font-normal text-accent">Open</span>
                  )}
                </span>
                <span className="text-[12.5px] text-faint">
                  {insight.days} days · {insight.stats.daysLogged} logged
                  {insight.turns.length > 0 && ` · ${countQuestions(insight)} questions`}
                </span>
              </button>

              <button
                onClick={() => {
                  haptic('warning');
                  void deleteInsight(insight.id);
                }}
                aria-label="Delete report"
                className="grid size-12 shrink-0 place-items-center text-faint active:text-danger"
              >
                <IconTrash size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

function countQuestions(insight: Insight): number {
  return insight.turns.filter((turn) => turn.role === 'user').length;
}
