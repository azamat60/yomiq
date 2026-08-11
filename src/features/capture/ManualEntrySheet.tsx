import { useEffect, useState } from 'react';
import type { Macros, Meal } from '@/db/types';
import { addEntriesFromDraft, saveFavorite } from '@/db/repository';
import { portionMacros } from '@/shared/lib/nutrition';
import { mealForNow } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { GramsStepper } from '@/shared/ui/GramsStepper';
import { MealPicker } from '@/shared/ui/MealPicker';
import { MacroSummary } from '@/shared/ui/MacroSummary';
import { useToast } from '@/shared/ui/Toast';
import { MACRO_LABEL, type MacroKey } from '@/shared/ui/MacroBar';

const MACRO_KEYS: MacroKey[] = ['protein', 'fat', 'carbs'];

const EMPTY = { kcal: '', protein: '', fat: '', carbs: '' };

export function ManualEntrySheet({ open }: { open: boolean }) {
  const date = useAppStore((s) => s.date);
  const presetMeal = useAppStore((s) => s.presetMeal);
  const closeCapture = useAppStore((s) => s.closeCapture);
  const toast = useToast();

  const [name, setName] = useState('');
  const [grams, setGrams] = useState(100);
  const [per100Raw, setPer100Raw] = useState(EMPTY);
  const [meal, setMeal] = useState<Meal>(mealForNow());
  const [remember, setRemember] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setGrams(100);
    setPer100Raw(EMPTY);
    setMeal(presetMeal ?? mealForNow());
    setRemember(true);
  }, [open, presetMeal]);

  const per100: Macros = {
    kcal: Number(per100Raw.kcal) || 0,
    protein: Number(per100Raw.protein) || 0,
    fat: Number(per100Raw.fat) || 0,
    carbs: Number(per100Raw.carbs) || 0,
  };

  const valid = name.trim().length > 0 && per100.kcal > 0 && grams > 0;

  const save = async () => {
    if (!valid) return;
    setSaving(true);

    const trimmed = name.trim();
    await addEntriesFromDraft({
      title: trimmed,
      note: '',
      source: 'manual',
      date,
      meal,
      items: [{ id: crypto.randomUUID(), name: trimmed, grams, per100, confidence: 'high' }],
    });
    if (remember) await saveFavorite({ name: trimmed, per100, defaultGrams: grams });

    haptic('success');
    setSaving(false);
    closeCapture();
    toast.show(`Записано: ${portionMacros(per100, grams).kcal} ккал`);
  };

  return (
    <Sheet open={open} onClose={closeCapture} title="Ввести вручную" tall>
      <div className="flex flex-col gap-4">
        <Field
          label="Название"
          placeholder="Творог 5%"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">На 100 граммов</span>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Калории"
              suffix="ккал"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={per100Raw.kcal}
              onChange={(e) => setPer100Raw({ ...per100Raw, kcal: e.target.value })}
            />
            {MACRO_KEYS.map((key) => (
              <Field
                key={key}
                label={MACRO_LABEL[key]}
                suffix="г"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={per100Raw[key]}
                onChange={(e) => setPer100Raw({ ...per100Raw, [key]: e.target.value })}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">Вес порции</span>
          <GramsStepper grams={grams} onChange={setGrams} />
        </div>

        {per100.kcal > 0 && <MacroSummary macros={portionMacros(per100, grams)} />}

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">Приём пищи</span>
          <MealPicker value={meal} onChange={setMeal} />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-5 accent-[var(--accent)]"
          />
          <span className="text-[15px]">Сохранить в «Мои блюда»</span>
        </label>

        <Button size="lg" block loading={saving} disabled={!valid} onClick={() => void save()}>
          Добавить
        </Button>
      </div>
    </Sheet>
  );
}
