import type { Favorite } from '@/db/types';
import { portionMacros } from '@/shared/lib/nutrition';
import { haptic } from '@/shared/lib/haptics';
import { MacroChips } from '@/shared/ui/MacroBar';

export function QuickRow({
  favorite,
  onPick,
  chips,
  trailing,
}: {
  favorite: Favorite;
  onPick: () => void;
  chips?: boolean;
  trailing?: React.ReactNode;
}) {
  const macros = portionMacros(favorite.per100, favorite.defaultGrams);

  return (
    <li className="flex items-center border-b border-line last:border-b-0">
      <button
        onClick={() => {
          haptic('tap');
          onPick();
        }}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left active:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15.5px] font-medium">{favorite.name}</span>
          <span className="tnum block text-[13px] text-faint">
            {favorite.defaultGrams} g · {macros.kcal} kcal
          </span>
          {chips && (
            <span className="mt-1 block">
              <MacroChips macros={macros} />
            </span>
          )}
        </span>
      </button>

      {trailing}
    </li>
  );
}
