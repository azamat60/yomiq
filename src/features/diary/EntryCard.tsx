import { useRef, useState } from 'react';
import type { Entry } from '@/db/types';
import { deleteEntry, restoreEntry } from '@/db/repository';
import { portionMacros } from '@/shared/lib/nutrition';
import { useObjectUrl } from '@/shared/lib/useObjectUrl';
import { formatTime } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { useToast } from '@/shared/ui/Toast';
import { MacroChips } from '@/shared/ui/MacroBar';
import { IconMeal, IconTrash, IconWarning } from '@/shared/ui/icons';
import { useT } from '@/shared/i18n';

const REVEAL_WIDTH = 88;
const DELETE_THRESHOLD = 150;

export function EntryCard({ entry, onEdit }: { entry: Entry; onEdit: () => void }) {
  const toast = useToast();
  const t = useT();
  const photoUrl = useObjectUrl(entry.photo);
  const [offset, setOffset] = useState(0);
  const [removing, setRemoving] = useState(false);
  const drag = useRef<{ x: number; y: number; base: number; moved: boolean } | null>(null);
  // A drag ends with a click on the row; without this it would open the editor.
  const swallowClick = useRef(false);

  const macros = portionMacros(entry.per100, entry.grams);

  const remove = async () => {
    setRemoving(true);
    const deleted = await deleteEntry(entry.id);
    haptic('warning');
    if (deleted) {
      toast.show(t.toast.deleted(deleted.name), {
        label: t.common.undo,
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
          drag.current = { x: event.clientX, y: event.clientY, base: offset, moved: false };
          swallowClick.current = false;
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state) return;
          const dx = event.clientX - state.x;
          if (!state.moved) {
            const dy = Math.abs(event.clientY - state.y);
            if (Math.abs(dx) <= 6 && dy <= 6) return;
            // Vertical intent is a page scroll, not a swipe.
            if (dy > Math.abs(dx)) {
              drag.current = null;
              return;
            }
            state.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          const next = state.base + dx;
          // Rubber-bands to the right so the row can't be dragged off-axis.
          setOffset(Math.min(0, Math.max(-DELETE_THRESHOLD - 40, next)));
        }}
        onPointerUp={() => {
          const state = drag.current;
          drag.current = null;
          if (!state) return;
          if (!state.moved) return;
          swallowClick.current = true;
          if (offset < -DELETE_THRESHOLD) void remove();
          else setOffset(offset < -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setOffset(0);
        }}
        className="relative touch-pan-y bg-surface"
      >
        <button
          onClick={() => {
            if (swallowClick.current) {
              swallowClick.current = false;
              return;
            }
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
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-faint">
              <IconMeal size={20} />
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15.5px] font-medium">{entry.name}</span>
              {entry.confidence === 'low' && (
                <IconWarning size={14} className="shrink-0 text-warn" aria-label={t.entry.lowConfidence} />
              )}
            </span>
            <span className="mt-0.5 flex items-center gap-2">
              <span className="tnum shrink-0 text-[13px] text-faint">
                {Math.round(entry.grams)} {t.common.g} · {formatTime(entry.eatenAt)}
              </span>
              <MacroChips macros={macros} />
            </span>
          </span>

          <span className="tnum shrink-0 text-[16px] font-semibold">{macros.kcal}</span>
        </button>
      </div>

      {offset === -REVEAL_WIDTH && (
        <button
          onClick={() => void remove()}
          aria-label={t.common.delete}
          className="absolute inset-y-0 right-0 w-[88px]"
        />
      )}
    </li>
  );
}
