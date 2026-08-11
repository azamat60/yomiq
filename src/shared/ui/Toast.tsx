import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { haptic } from '@/shared/lib/haptics';

const DURATION = 5000;

type Toast = {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
};

type ToastApi = {
  show: (message: string, action?: Toast['action']) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, action?: Toast['action']) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, action }]);
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-60 flex flex-col items-center gap-2 px-4">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface-3 px-4 py-3 shadow-[var(--shadow-sheet)] [animation:yq-pop-in_240ms_var(--ease-out-back)]"
            >
              <span className="flex-1 text-[15px]">{toast.message}</span>
              {toast.action && (
                <button
                  onClick={() => {
                    haptic('select');
                    toast.action?.run();
                    dismiss(toast.id);
                  }}
                  className="shrink-0 text-[15px] font-semibold text-accent active:opacity-60"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside ToastProvider');
  return api;
}
