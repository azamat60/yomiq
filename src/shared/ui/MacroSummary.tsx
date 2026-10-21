import type { Macros } from '@/db/types';
import { MACRO_COLOR, type MacroKey } from './MacroBar';
import { useT } from '@/shared/i18n';

const KEYS: MacroKey[] = ['protein', 'fat', 'carbs'];

/** Big kcal figure plus P/F/C breakdown — the readout above every editor. */
export function MacroSummary({ macros }: { macros: Macros }) {
  const t = useT();
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-5">
      <div className="text-center">
        <span className="tnum text-[46px] leading-none font-bold tracking-tight">{macros.kcal}</span>
        <span className="ml-1.5 text-[15px] text-muted">{t.common.kcal}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className="h-1 w-7 rounded-full" style={{ background: MACRO_COLOR[key] }} />
            <span className="tnum text-[17px] font-semibold">{Math.round(macros[key])}</span>
            <span className="text-[11.5px] text-faint">{t.summary.macroGrams(t.macro[key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
