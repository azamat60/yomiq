import { cn } from '@/shared/lib/cn';

export const ROW_ACTION_TONE = { accent: 'accent', danger: 'danger' } as const;
export type RowActionTone = keyof typeof ROW_ACTION_TONE;

const TONE_CLASS: Record<RowActionTone, string> = {
  accent: 'active:text-accent',
  danger: 'active:text-danger',
};

export function RowAction({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: RowActionTone;
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => void onClick()}
      aria-label={label}
      className={cn('grid size-11 shrink-0 place-items-center text-faint', TONE_CLASS[tone])}
    >
      {children}
    </button>
  );
}
