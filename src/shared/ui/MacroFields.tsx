import { useState } from 'react';
import type { Macros } from '@/db/types';
import { MACRO_COLOR, MACRO_LABEL, type MacroKey } from './MacroBar';

const MACRO_KEYS: MacroKey[] = ['protein', 'fat', 'carbs'];
type Key = keyof Macros;

/**
 * Edits a Macros object in place. While a field has focus its raw text is kept
 * locally — otherwise clearing the box would round-trip through Number('') === 0
 * and the user could never type a new value over the old one.
 */
export function MacroFields({
  macros,
  onChange,
}: {
  macros: Macros;
  onChange: (macros: Macros) => void;
}) {
  const [typing, setTyping] = useState<Partial<Record<Key, string>>>({});

  const set = (key: Key, raw: string) => {
    setTyping((current) => ({ ...current, [key]: raw }));
    onChange({ ...macros, [key]: Math.max(0, Number(raw.replace(',', '.')) || 0) });
  };

  const release = (key: Key) =>
    setTyping((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

  const shown = (key: Key) => typing[key] ?? String(round(macros[key]));

  return (
    <div className="grid grid-cols-2 gap-2">
      <Cell
        label="Calories"
        suffix="kcal"
        value={shown('kcal')}
        onChange={(raw) => set('kcal', raw)}
        onBlur={() => release('kcal')}
      />
      {MACRO_KEYS.map((key) => (
        <Cell
          key={key}
          label={MACRO_LABEL[key]}
          suffix="g"
          dot={MACRO_COLOR[key]}
          value={shown(key)}
          onChange={(raw) => set(key, raw)}
          onBlur={() => release(key)}
        />
      ))}
    </div>
  );
}

function Cell({
  label,
  suffix,
  dot,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  suffix: string;
  dot?: string;
  value: string;
  onChange: (raw: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-2xl border border-line bg-bg px-3 py-2 focus-within:border-accent">
      <span className="flex items-center gap-1.5 text-[12px] text-muted">
        {dot && <span className="size-1.5 rounded-full" style={{ background: dot }} />}
        {label}
      </span>
      <span className="flex items-baseline gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onFocus={(event) => event.target.select()}
          className="tnum w-full min-w-0 bg-transparent text-[17px] font-semibold outline-none"
        />
        <span className="shrink-0 text-[12px] text-faint">{suffix}</span>
      </span>
    </label>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
