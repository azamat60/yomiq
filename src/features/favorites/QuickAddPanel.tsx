import { useEffect, useState } from 'react';
import type { Favorite, Meal } from '@/db/types';
import { addEntriesFromDraft, markFavoriteUsed } from '@/db/repository';
import { portionMacros } from '@/shared/lib/nutrition';
import { formatDayLabel } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Button } from '@/shared/ui/Button';
import { GramsStepper } from '@/shared/ui/GramsStepper';
import { MealPicker } from '@/shared/ui/MealPicker';
import { MacroSummary } from '@/shared/ui/MacroSummary';
import { useToast } from '@/shared/ui/Toast';
import { useT } from '@/shared/i18n';
import { isRecent } from './useQuickList';

export function QuickAddPanel({
  favorite,
  defaultMeal,
  onDone,
}: {
  favorite: Favorite;
  defaultMeal: Meal;
  onDone: () => void;
}) {
  const date = useAppStore((s) => s.date);
  const toast = useToast();
  const t = useT();
  const [grams, setGrams] = useState(favorite.defaultGrams);
  const [meal, setMeal] = useState<Meal>(defaultMeal);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGrams(favorite.defaultGrams);
    setMeal(defaultMeal);
  }, [favorite, defaultMeal]);

  const macros = portionMacros(favorite.per100, grams);

  const save = async () => {
    if (grams < 1) return;
    setSaving(true);
    try {
      await logPortion();
    } finally {
      setSaving(false);
    }

    haptic('success');
    onDone();
    toast.show(t.toast.logged(macros.kcal));
  };

  const logPortion = async () => {
    await addEntriesFromDraft({
      title: favorite.name,
      note: '',
      source: 'favorite',
      date,
      meal,
      items: [
        {
          id: crypto.randomUUID(),
          name: favorite.name,
          grams,
          per100: favorite.per100,
          confidence: 'high',
        },
      ],
    });
    // Recent-entry rows carry a synthetic id and have no favourites record to bump.
    if (!isRecent(favorite)) await markFavoriteUsed(favorite.id);
  };

  return (
    <div className="flex flex-col gap-5">
      <MacroSummary macros={macros} />
      <GramsStepper grams={grams} onChange={setGrams} />

      <div className="flex flex-col gap-2">
        <span className="px-1 text-[13px] font-medium text-muted">{t.entry.mealOn(formatDayLabel(date))}</span>
        <MealPicker value={meal} onChange={setMeal} />
      </div>

      <Button size="lg" block loading={saving} disabled={grams < 1} onClick={() => void save()}>
        {t.draft.addKcal(macros.kcal)}
      </Button>
    </div>
  );
}
