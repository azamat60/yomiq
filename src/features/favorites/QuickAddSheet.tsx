import type { Favorite } from '@/db/types';
import { mealForNow } from '@/shared/lib/date';
import { Sheet } from '@/shared/ui/Sheet';
import { QuickAddPanel } from './QuickAddPanel';

export function QuickAddSheet({
  favorite,
  onClose,
}: {
  favorite: Favorite | null;
  onClose: () => void;
}) {
  if (!favorite) return null;

  return (
    <Sheet open onClose={onClose} title={favorite.name}>
      <QuickAddPanel favorite={favorite} defaultMeal={mealForNow()} onDone={onClose} />
    </Sheet>
  );
}
