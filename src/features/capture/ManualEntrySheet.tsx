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
import type { MacroKey } from '@/shared/ui/MacroBar';
import { useT } from '@/shared/i18n';

const MACRO_KEYS: MacroKey[] = ['protein', 'fat', 'carbs'];

const EMPTY = { kcal: '', protein: '', fat: '', carbs: '' };

export function ManualEntrySheet({ open }: { open: boolean }) {
  const date = useAppStore((s) => s.date);
  const presetMeal = useAppStore((s) => s.presetMeal);
  const closeCapture = useAppStore((s) => s.closeCapture);
  const popCapture = useAppStore((s) => s.popCapture);
  const toast = useToast();
  const t = useT();

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
    kcal: parseAmount(per100Raw.kcal),
    protein: parseAmount(per100Raw.protein),
    fat: parseAmount(per100Raw.fat),
    carbs: parseAmount(per100Raw.carbs),
  };

  const valid = name.trim().length > 0 && per100.kcal > 0 && grams > 0;

  const save = async () => {
    if (!valid) return;
    setSaving(true);

    const trimmed = name.trim();
    try {
      await addEntriesFromDraft({
        title: trimmed,
        note: '',
        source: 'manual',
        date,
        meal,
        items: [{ id: crypto.randomUUID(), name: trimmed, grams, per100, confidence: 'high' }],
      });
      if (remember) await saveFavorite({ name: trimmed, per100, defaultGrams: grams });
    } finally {
      setSaving(false);
    }

    haptic('success');
    closeCapture();
    toast.show(t.toast.logged(portionMacros(per100, grams).kcal));
  };

  return (
    <Sheet open={open} onClose={closeCapture} onBack={popCapture} title={t.manual.title} tall>
      <div className="flex flex-col gap-4">
        <Field
          label={t.manual.name}
          placeholder={t.manual.namePlaceholder}
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">{t.manual.per100}</span>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label={t.grams.calories}
              suffix={t.common.kcal}
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={per100Raw.kcal}
              onChange={(e) => setPer100Raw({ ...per100Raw, kcal: e.target.value })}
            />
            {MACRO_KEYS.map((key) => (
              <Field
                key={key}
                label={t.macro[key]}
                suffix={t.common.g}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={per100Raw[key]}
                onChange={(e) => setPer100Raw({ ...per100Raw, [key]: e.target.value })}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">{t.manual.portion}</span>
          <GramsStepper grams={grams} onChange={setGrams} />
        </div>

        {per100.kcal > 0 && <MacroSummary macros={portionMacros(per100, grams)} />}

        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-medium text-muted">{t.entry.meal}</span>
          <MealPicker value={meal} onChange={setMeal} />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-5 accent-[var(--accent)]"
          />
          <span className="text-[15px]">{t.manual.remember}</span>
        </label>

        <Button size="lg" block loading={saving} disabled={!valid} onClick={() => void save()}>
          {t.common.add}
        </Button>
      </div>
    </Sheet>
  );
}

/** Accepts a decimal comma too — it is what a Russian keyboard types. */
function parseAmount(raw: string): number {
  return Math.max(0, Number(raw.replace(',', '.')) || 0);
}
