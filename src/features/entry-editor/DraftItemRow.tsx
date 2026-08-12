import { useState } from 'react';
import type { DraftItem } from '@/db/types';
import { portionMacros } from '@/shared/lib/nutrition';
import { haptic } from '@/shared/lib/haptics';
import { GramsStepper } from '@/shared/ui/GramsStepper';
import { MacroChips } from '@/shared/ui/MacroBar';
import { IconChevronRight, IconTrash, IconWarning } from '@/shared/ui/icons';
import { CONFIDENCE_LABEL } from '@/features/diary/constants';

type Props = {
  item: DraftItem;
  onChange: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
};

export function DraftItemRow({ item, onChange, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const macros = portionMacros(item.per100, item.grams);

  return (
    <li className="overflow-hidden rounded-card border border-line bg-surface">
      <button
        onClick={() => {
          haptic('tap');
          setExpanded((current) => !current);
        }}
        className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[15.5px] font-medium">{item.name}</span>
            {item.confidence === 'low' && (
              <span title={CONFIDENCE_LABEL.low}>
                <IconWarning size={14} className="shrink-0 text-warn" />
              </span>
            )}
          </span>
          <span className="tnum block text-[13px] text-faint">{Math.round(item.grams)} g</span>
          <span className="mt-1 block">
            <MacroChips macros={macros} />
          </span>
        </span>

        <span className="tnum shrink-0 text-[16px] font-semibold">{macros.kcal}</span>
        <IconChevronRight
          size={18}
          className={
            'shrink-0 text-faint transition-transform duration-200 ' + (expanded ? 'rotate-90' : '')
          }
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-line px-4 py-3.5">
          <input
            value={item.name}
            onChange={(e) => onChange({ name: e.target.value.slice(0, 60) })}
            aria-label="Name"
            className="rounded-xl border border-line bg-bg px-3 py-2.5 text-[15px] outline-none focus:border-accent"
          />

          <GramsStepper grams={item.grams} onChange={(grams) => onChange({ grams })} />

          <p className="tnum px-1 text-[12.5px] text-faint">
            Per 100 g: {Math.round(item.per100.kcal)} kcal · P {round(item.per100.protein)} · F{' '}
            {round(item.per100.fat)} · C {round(item.per100.carbs)}
          </p>

          <button
            onClick={onRemove}
            className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[14px] font-medium text-danger active:bg-danger/10"
          >
            <IconTrash size={17} />
            Remove item
          </button>
        </div>
      )}
    </li>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
