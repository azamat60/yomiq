import { useRef, useState } from 'react';
import type { Entry } from '@/db/types';
import { deleteEntry, restoreEntry } from '@/db/repository';
import { portionMacros } from '@/shared/lib/nutrition';
import { useObjectUrl } from '@/shared/lib/useObjectUrl';
import { haptic } from '@/shared/lib/haptics';
import { useToast } from '@/shared/ui/Toast';
import { MacroChips } from '@/shared/ui/MacroBar';
import { IconTrash, IconWarning } from '@/shared/ui/icons';

const REVEAL_WIDTH = 88;
const DELETE_THRESHOLD = 150;

export function EntryCard({ entry, onEdit }: { entry: Entry; onEdit: () => void }) {
  const toast = useToast();
  const photoUrl = useObjectUrl(entry.photo);
  const [offset, setOffset] = useState(0);
  const [removing, setRemoving] = useState(false);
  const drag = useRef<{ x: number; base: number; moved: boolean } | null>(null);

  const macros = portionMacros(entry.per100, entry.grams);

  const remove = async () => {
    setRemoving(true);
    const deleted = await deleteEntry(entry.id);
    haptic('warning');
    if (deleted) {
      toast.show(`«${deleted.name}» удалено`, {
        label: 'Вернуть',
        run: () => void restoreEntry(deleted),
      });
    }
  };

  return (
    <li className="relative overflow-hidden border-b border-line last:border-b-0">
      <div className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center bg-danger/15 text-danger">
        <IconTrash size={22} />
      </div>

      <div
        style={{
          transform: `translateX(${removing ? -400 : offset}px)`,
          transition: drag.current ? 'none' : 'transform 260ms var(--ease-smooth)',
        }}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          drag.current = { x: event.clientX, base: offset, moved: false };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state) return;
          const next = state.base + (event.clientX - state.x);
          if (Math.abs(next - state.base) > 4) state.moved = true;
          // Rubber-bands to the right so the row can't be dragged off-axis.
          setOffset(Math.min(0, Math.max(-DELETE_THRESHOLD - 40, next)));
        }}
        onPointerUp={() => {
          const state = drag.current;
          drag.current = null;
          if (!state) return;
          if (offset < -DELETE_THRESHOLD) void remove();
          else setOffset(offset < -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setOffset(0);
        }}
        className="relative bg-surface"
      >
        <button
          onClick={() => {
            if (offset !== 0) {
              setOffset(0);
              return;
            }
            haptic('tap');
            onEdit();
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-2"
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="size-12 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-[18px]">
              🍽
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15.5px] font-medium">{entry.name}</span>
              {entry.confidence === 'low' && (
                <IconWarning size={14} className="shrink-0 text-warn" />
              )}
            </span>
            <span className="tnum block text-[13px] text-faint">{Math.round(entry.grams)} г</span>
            <span className="mt-1 block">
              <MacroChips macros={macros} />
            </span>
          </span>

          <span className="tnum shrink-0 text-[16px] font-semibold">{macros.kcal}</span>
        </button>
      </div>

      {offset === -REVEAL_WIDTH && (
        <button
          onClick={() => void remove()}
          aria-label="Удалить"
          className="absolute inset-y-0 right-0 w-[88px]"
        />
      )}
    </li>
  );
}
