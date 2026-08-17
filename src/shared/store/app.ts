import { create } from 'zustand';
import type { Draft, Favorite, Meal, Source } from '@/db/types';
import { toDateKey } from '@/shared/lib/date';

/**
 * A step in the add-food flow. The payload is why this is a union and not a
 * plain mode string: a picked File and a chosen Favorite both have to travel
 * with the step that renders them.
 */
export type CaptureStep =
  | { kind: 'composer' }
  | { kind: 'photo'; file: File }
  | { kind: 'quickAdd'; favorite: Favorite }
  | { kind: 'barcode' }
  | { kind: 'manual' };

export type CaptureKind = CaptureStep['kind'];
export type AnalysisStatus = 'idle' | 'loading' | 'error';

type AppState = {
  /** The day the diary is showing; new entries land here, not on today. */
  date: string;
  setDate: (date: string) => void;

  /** Bottom is always the composer; the last element is what's on screen. */
  captureStack: CaptureStep[];
  /** Meal the capture flow should default to, set when adding from a section. */
  presetMeal: Meal | null;
  openCapture: (kind?: CaptureKind, meal?: Meal) => void;
  pushCapture: (step: CaptureStep) => void;
  replaceCapture: (step: CaptureStep) => void;
  popCapture: () => void;
  closeCapture: () => void;

  status: AnalysisStatus;
  /** Which input produced the running analysis — drives the overlay copy. */
  source: Source | null;
  error: string | null;
  startAnalysis: (source: Source) => void;
  failAnalysis: (message: string) => void;
  resetAnalysis: () => void;

  /** Parsed food waiting for the user to confirm; opens the entry editor. */
  draft: Draft | null;
  setDraft: (draft: Draft | null) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  date: toDateKey(),
  setDate: (date) => set({ date }),

  captureStack: [],
  presetMeal: null,

  // Entering the flow is the only moment presetMeal is decided; every step
  // pushed afterwards inherits it instead of re-threading it through props.
  openCapture: (kind = 'composer', meal = undefined) =>
    set({
      captureStack:
        kind === 'composer'
          ? [{ kind: 'composer' }]
          : [{ kind: 'composer' }, { kind } as CaptureStep],
      presetMeal: meal ?? null,
      status: 'idle',
      source: null,
      error: null,
    }),
  pushCapture: (step) => set({ captureStack: [...get().captureStack, step] }),
  replaceCapture: (step) => set({ captureStack: [...get().captureStack.slice(0, -1), step] }),
  popCapture: () => set({ captureStack: get().captureStack.slice(0, -1) }),
  closeCapture: () => set({ captureStack: [] }),

  status: 'idle',
  source: null,
  error: null,
  startAnalysis: (source) => set({ status: 'loading', source, error: null }),
  failAnalysis: (message) => set({ status: 'error', error: message }),
  resetAnalysis: () => set({ status: 'idle', error: null }),

  draft: null,
  setDraft: (draft) =>
    set(draft ? { draft, captureStack: [], status: 'idle' } : { draft: null, status: 'idle' }),
}));

export const useCaptureStep = (): CaptureStep | null =>
  useAppStore((s) => s.captureStack.at(-1) ?? null);

export const useCaptureKind = (): CaptureKind | null =>
  useAppStore((s) => s.captureStack.at(-1)?.kind ?? null);
