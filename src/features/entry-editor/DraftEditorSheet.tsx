import { useEffect, useState } from 'react';
import type { Draft, DraftItem, Meal } from '@/db/types';
import { addEntriesFromDraft, saveFavorite } from '@/db/repository';
import { portionMacros, sumMacros } from '@/shared/lib/nutrition';
import { useObjectUrl } from '@/shared/lib/useObjectUrl';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { MealPicker } from '@/shared/ui/MealPicker';
import { MacroSummary } from '@/shared/ui/MacroSummary';
import { useToast } from '@/shared/ui/Toast';
import { formatDayLabel } from '@/shared/lib/date';
import { DraftItemRow } from './DraftItemRow';

export function DraftEditorSheet({ draft }: { draft: Draft | null }) {
  const setDraft = useAppStore((s) => s.setDraft);
  const toast = useToast();

  const [items, setItems] = useState<DraftItem[]>([]);
  const [meal, setMeal] = useState<Meal>('breakfast');
  const [saving, setSaving] = useState(false);
  const photoUrl = useObjectUrl(draft?.photo);

  useEffect(() => {
    if (!draft) return;
    setItems(draft.items);
    setMeal(draft.meal);
  }, [draft]);

  if (!draft) return null;

  const totals = sumMacros(items.map((item) => portionMacros(item.per100, item.grams)));
  const close = () => setDraft(null);

  const patchItem = (id: string, patch: Partial<DraftItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const removeItem = (id: string) => {
    haptic('warning');
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const save = async () => {
    if (items.length === 0) return;
    setSaving(true);
    await addEntriesFromDraft({ ...draft, items, meal });
    haptic('success');
    setSaving(false);
    close();
    toast.show(`Записано: ${totals.kcal} ккал`);
  };

  const addAllToFavorites = async () => {
    await Promise.all(
      items.map((item) =>
        saveFavorite({
          name: item.name,
          per100: item.per100,
          defaultGrams: Math.round(item.grams),
        }),
      ),
    );
    haptic('success');
    toast.show(items.length > 1 ? 'Блюда в избранном' : 'Блюдо в избранном');
  };

  return (
    <Sheet open onClose={close} title={draft.title || 'Проверьте результат'} tall>
      <div className="flex h-full flex-col gap-4">
        <div className="flex-1 space-y-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Снимок блюда"
              className="h-40 w-full rounded-card object-cover"
            />
          )}

          {draft.note && (
            <p className="rounded-2xl bg-surface-2 px-4 py-3 text-[13.5px] leading-snug text-muted">
              {draft.note}
            </p>
          )}

          <MacroSummary macros={totals} />

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between px-1">
              <span className="text-[13px] font-medium text-muted">
                Распознано: {items.length}
              </span>
              <span className="text-[12.5px] text-faint">Поправьте вес, если нужно</span>
            </div>

            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <DraftItemRow
                  key={item.id}
                  item={item}
                  onChange={(patch) => patchItem(item.id, patch)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </ul>

            {items.length === 0 && (
              <p className="rounded-2xl border border-line bg-surface px-4 py-6 text-center text-[14px] text-faint">
                Все позиции удалены
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="px-1 text-[13px] font-medium text-muted">
              Приём пищи · {formatDayLabel(draft.date)}
            </span>
            <MealPicker value={meal} onChange={setMeal} />
          </div>

          <Button variant="secondary" block onClick={() => void addAllToFavorites()}>
            Сохранить в избранное
          </Button>
        </div>

        <div className="sticky bottom-0 -mx-5 border-t border-line bg-bg-elevated px-5 pt-3 pb-1">
          <Button
            size="lg"
            block
            loading={saving}
            disabled={items.length === 0}
            onClick={() => void save()}
          >
            Добавить {totals.kcal} ккал
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
