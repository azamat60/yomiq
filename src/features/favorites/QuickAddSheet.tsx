import { useEffect, useState } from 'react';
import type { Favorite, Meal } from '@/db/types';
import { addEntriesFromDraft, markFavoriteUsed } from '@/db/repository';
import { portionMacros } from '@/shared/lib/nutrition';
import { formatDayLabel, mealForNow } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { GramsStepper } from '@/shared/ui/GramsStepper';
import { MealPicker } from '@/shared/ui/MealPicker';
import { MacroSummary } from '@/shared/ui/MacroSummary';
import { useToast } from '@/shared/ui/Toast';

export function QuickAddSheet({
  favorite,
  onClose,
}: {
  favorite: Favorite | null;
  onClose: () => void;
}) {
  const date = useAppStore((s) => s.date);
  const toast = useToast();
  const [grams, setGrams] = useState(100);
  const [meal, setMeal] = useState<Meal>(mealForNow());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!favorite) return;
    setGrams(favorite.defaultGrams);
    setMeal(mealForNow());
  }, [favorite]);

  if (!favorite) return null;

  const macros = portionMacros(favorite.per100, grams);

  const save = async () => {
    setSaving(true);
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
    if (!favorite.id.startsWith('recent:')) await markFavoriteUsed(favorite.id);

    haptic('success');
    setSaving(false);
    onClose();
    toast.show(`Записано: ${macros.kcal} ккал`);
  };

  return (
    <Sheet open onClose={onClose} title={favorite.name}>
      <div className="flex flex-col gap-5">
        <MacroSummary macros={macros} />
        <GramsStepper grams={grams} onChange={setGrams} />

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">
            Приём пищи · {formatDayLabel(date)}
          </span>
          <MealPicker value={meal} onChange={setMeal} />
        </div>

        <Button size="lg" block loading={saving} onClick={() => void save()}>
          Добавить {macros.kcal} ккал
        </Button>
      </div>
    </Sheet>
  );
}
