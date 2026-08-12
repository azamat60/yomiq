import { useEffect, useState } from 'react';
import type { Entry, Macros, Meal } from '@/db/types';
import { deleteEntry, restoreEntry, saveFavorite, updateEntry } from '@/db/repository';
import { per100FromPortion, portionMacros } from '@/shared/lib/nutrition';
import { haptic } from '@/shared/lib/haptics';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { GramsStepper } from '@/shared/ui/GramsStepper';
import { MacroFields } from '@/shared/ui/MacroFields';
import { MealPicker } from '@/shared/ui/MealPicker';
import { MacroSummary } from '@/shared/ui/MacroSummary';
import { useToast } from '@/shared/ui/Toast';
import { IconStar, IconTrash } from '@/shared/ui/icons';
import { SOURCE_LABEL } from './constants';

const EMPTY_MACROS: Macros = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

export function EditEntrySheet({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const toast = useToast();
  const [grams, setGrams] = useState(0);
  const [meal, setMeal] = useState<Meal>('breakfast');
  const [per100, setPer100] = useState<Macros>(EMPTY_MACROS);

  useEffect(() => {
    if (!entry) return;
    setGrams(entry.grams);
    setMeal(entry.meal);
    setPer100(entry.per100);
  }, [entry]);

  if (!entry) return null;

  const macros = portionMacros(per100, grams);
  const changed =
    grams !== entry.grams ||
    meal !== entry.meal ||
    JSON.stringify(per100) !== JSON.stringify(entry.per100);

  const save = async () => {
    await updateEntry(entry.id, { grams: Math.round(grams), meal, per100 });
    haptic('success');
    onClose();
  };

  const remove = async () => {
    const deleted = await deleteEntry(entry.id);
    haptic('warning');
    onClose();
    if (deleted) {
      toast.show(`"${deleted.name}" deleted`, {
        label: 'Undo',
        run: () => void restoreEntry(deleted),
      });
    }
  };

  const addToFavorites = async () => {
    await saveFavorite({ name: entry.name, per100: entry.per100, defaultGrams: Math.round(grams) });
    haptic('success');
    toast.show(`"${entry.name}" added to favorites`);
  };

  return (
    <Sheet open onClose={onClose} title={entry.name}>
      <div className="flex flex-col gap-5">
        <p className="-mt-2 text-center text-[13px] text-faint">
          Added {SOURCE_LABEL[entry.source]}
        </p>

        <MacroSummary macros={macros} />
        <GramsStepper grams={grams} onChange={setGrams} />

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">
            Values for {Math.round(grams)} g
          </span>
          <MacroFields
            macros={macros}
            onChange={(portion) => setPer100(per100FromPortion(portion, grams))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">Meal</span>
          <MealPicker value={meal} onChange={setMeal} />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={addToFavorites} className="flex-1">
            <IconStar size={19} />
            Add to favorites
          </Button>
          <Button variant="danger" onClick={() => void remove()} aria-label="Delete">
            <IconTrash size={19} />
          </Button>
        </div>

        <Button size="lg" block disabled={!changed} onClick={() => void save()}>
          {changed ? 'Save' : 'No changes'}
        </Button>
      </div>
    </Sheet>
  );
}
