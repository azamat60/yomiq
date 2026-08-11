import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.5;

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Full-height variant for editor-style content. */
  tall?: boolean;
  children: ReactNode;
};

export function Sheet({ open, onClose, title, tall, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ y: number; time: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setOffset(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const endDrag = useCallback(
    (y: number) => {
      const start = dragStart.current;
      dragStart.current = null;
      if (!start) return;

      const distance = y - start.y;
      const velocity = distance / Math.max(1, Date.now() - start.time);
      if (distance > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) onClose();
      else setOffset(0);
    },
    [onClose],
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        aria-label="Закрыть"
        onClick={onClose}
        style={{ opacity: open ? Math.max(0, 1 - offset / 320) : 0 }}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200"
      />

      <div
        ref={panelRef}
        onTransitionEnd={() => {
          if (!open) setMounted(false);
        }}
        style={{
          transform: open ? `translateY(${offset}px)` : 'translateY(100%)',
          transition: dragStart.current ? 'none' : 'transform 320ms var(--ease-smooth)',
        }}
        className={cn(
          'relative flex flex-col overflow-hidden rounded-t-[28px]',
          'border-t border-line bg-bg-elevated shadow-[var(--shadow-sheet)]',
          tall ? 'h-[92dvh]' : 'max-h-[88dvh]',
        )}
      >
        <div
          onPointerDown={(event) => {
            dragStart.current = { y: event.clientY, time: Date.now() };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!dragStart.current) return;
            setOffset(Math.max(0, event.clientY - dragStart.current.y));
          }}
          onPointerUp={(event) => endDrag(event.clientY)}
          onPointerCancel={(event) => endDrag(event.clientY)}
          className="shrink-0 cursor-grab touch-none pt-3 pb-1 active:cursor-grabbing"
        >
          <div className="mx-auto h-1.5 w-10 rounded-full bg-line-strong" />
        </div>

        {title && (
          <h2 className="shrink-0 px-5 pt-2 pb-1 text-center text-[17px] font-semibold">{title}</h2>
        )}

        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
