import { useEffect, useState } from 'react';
import type { Favorite } from '@/db/types';
import { mealForNow } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { QuickAddPanel } from '@/features/favorites/QuickAddPanel';

export function QuickAddStepSheet({ open, favorite }: { open: boolean; favorite: Favorite | null }) {
  const closeCapture = useAppStore((s) => s.closeCapture);
  const popCapture = useAppStore((s) => s.popCapture);
  const presetMeal = useAppStore((s) => s.presetMeal);

  // Keeps the panel populated while the sheet animates out after the stack pops.
  const [shown, setShown] = useState<Favorite | null>(favorite);
  useEffect(() => {
    if (favorite) setShown(favorite);
  }, [favorite]);

  if (!shown) return null;

  return (
    <Sheet open={open} onClose={closeCapture} onBack={popCapture} title={shown.name}>
      <QuickAddPanel
        favorite={shown}
        defaultMeal={presetMeal ?? mealForNow()}
        onDone={closeCapture}
      />
    </Sheet>
  );
}
