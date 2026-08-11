import type { Macros } from '@/db/types';

export type MacroKey = 'protein' | 'fat' | 'carbs';

export const MACRO_LABEL: Record<MacroKey, string> = {
  protein: 'Белки',
  fat: 'Жиры',
  carbs: 'Углеводы',
};

export const MACRO_SHORT: Record<MacroKey, string> = {
  protein: 'Б',
  fat: 'Ж',
  carbs: 'У',
};

export const MACRO_COLOR: Record<MacroKey, string> = {
  protein: 'var(--protein)',
  fat: 'var(--fat)',
  carbs: 'var(--carbs)',
};

const MACRO_ORDER: MacroKey[] = ['protein', 'fat', 'carbs'];

export function MacroBars({ consumed, target }: { consumed: Macros; target: Macros }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MACRO_ORDER.map((key) => (
        <MacroBar key={key} macro={key} value={consumed[key]} target={target[key]} />
      ))}
    </div>
  );
}

function MacroBar({ macro, value, target }: { macro: MacroKey; value: number; target: number }) {
  const ratio = target > 0 ? Math.min(1, value / target) : 0;
  const over = value > target;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-muted">{MACRO_LABEL[macro]}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${ratio * 100}%`,
            background: over ? 'var(--warn)' : MACRO_COLOR[macro],
          }}
        />
      </div>
      <span className="tnum text-[13px] font-semibold">
        {Math.round(value)}
        <span className="font-normal text-faint"> / {Math.round(target)} г</span>
      </span>
    </div>
  );
}

/** Compact inline B/Ж/У readout used on entry cards. */
export function MacroChips({ macros }: { macros: Macros }) {
  return (
    <div className="flex items-center gap-2.5">
      {MACRO_ORDER.map((key) => (
        <span key={key} className="tnum flex items-center gap-1 text-[12px] text-muted">
          <span className="size-1.5 rounded-full" style={{ background: MACRO_COLOR[key] }} />
          {Math.round(macros[key])}
        </span>
      ))}
    </div>
  );
}
