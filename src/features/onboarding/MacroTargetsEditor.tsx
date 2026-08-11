import { useState } from 'react';
import type { Macros } from '@/db/types';
import { MACRO_COLOR, MACRO_LABEL, type MacroKey } from '@/shared/ui/MacroBar';
import { Field } from '@/shared/ui/Field';
import { haptic } from '@/shared/lib/haptics';

const MACRO_KEYS: MacroKey[] = ['protein', 'fat', 'carbs'];
const KCAL_PER_GRAM: Record<MacroKey, number> = { protein: 4, fat: 9, carbs: 4 };

type Props = {
  targets: Macros;
  onChange: (targets: Macros) => void;
  onReset: () => void;
};

export function MacroTargetsEditor({ targets, onChange, onReset }: Props) {
  const [editing, setEditing] = useState(false);

  const macroKcal = MACRO_KEYS.reduce((sum, key) => sum + targets[key] * KCAL_PER_GRAM[key], 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-line bg-surface p-6 text-center">
        <span className="tnum block text-[56px] leading-none font-bold tracking-tight text-accent">
          {targets.kcal}
        </span>
        <span className="mt-1 block text-[14px] text-muted">ккал в день</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {MACRO_KEYS.map((key) => (
          <div key={key} className="rounded-tile border border-line bg-surface px-3 py-3.5 text-center">
            <span className="mx-auto mb-2 block h-1 w-8 rounded-full" style={{ background: MACRO_COLOR[key] }} />
            <span className="tnum block text-[22px] font-bold">{targets[key]}</span>
            <span className="block text-[12px] text-muted">{MACRO_LABEL[key]}, г</span>
          </div>
        ))}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
          <Field
            label="Калории"
            suffix="ккал"
            type="number"
            inputMode="numeric"
            value={String(targets.kcal)}
            onChange={(e) => onChange({ ...targets, kcal: Number(e.target.value) || 0 })}
          />
          {MACRO_KEYS.map((key) => (
            <Field
              key={key}
              label={MACRO_LABEL[key]}
              suffix="г"
              type="number"
              inputMode="numeric"
              value={String(targets[key])}
              onChange={(e) => onChange({ ...targets, [key]: Number(e.target.value) || 0 })}
            />
          ))}

          {Math.abs(macroKcal - targets.kcal) > 60 && (
            <p className="px-1 text-[13px] text-warn">
              Из БЖУ выходит {Math.round(macroKcal)} ккал — это расходится с указанной нормой.
            </p>
          )}

          <button
            onClick={() => {
              haptic('tap');
              onReset();
            }}
            className="px-1 py-1 text-left text-[14px] font-medium text-muted active:opacity-60"
          >
            Вернуть расчётные значения
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            haptic('tap');
            setEditing(true);
          }}
          className="px-1 py-1 text-[15px] font-medium text-accent active:opacity-60"
        >
          Задать норму вручную
        </button>
      )}
    </div>
  );
}
