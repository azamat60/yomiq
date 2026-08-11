import { create } from 'zustand';
import type { Draft, Meal } from '@/db/types';
import { toDateKey } from '@/shared/lib/date';

export type CaptureMode = 'menu' | 'text' | 'voice' | 'manual';
export type AnalysisStatus = 'idle' | 'loading' | 'error';

type AppState = {
  /** The day the diary is showing; new entries land here, not on today. */
  date: string;
  setDate: (date: string) => void;

  capture: CaptureMode | null;
  /** Meal the capture flow should default to, set when adding from a section. */
  presetMeal: Meal | null;
  openCapture: (mode?: CaptureMode, meal?: Meal) => void;
  closeCapture: () => void;

  status: AnalysisStatus;
  error: string | null;
  startAnalysis: () => void;
  failAnalysis: (message: string) => void;
  resetAnalysis: () => void;

  /** Parsed food waiting for the user to confirm; opens the entry editor. */
  draft: Draft | null;
  setDraft: (draft: Draft | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  date: toDateKey(),
  setDate: (date) => set({ date }),

  capture: null,
  presetMeal: null,
  openCapture: (mode = 'menu', meal = undefined) =>
    set({ capture: mode, presetMeal: meal ?? null, status: 'idle', error: null }),
  closeCapture: () => set({ capture: null }),

  status: 'idle',
  error: null,
  startAnalysis: () => set({ status: 'loading', error: null }),
  failAnalysis: (message) => set({ status: 'error', error: message }),
  resetAnalysis: () => set({ status: 'idle', error: null }),

  draft: null,
  setDraft: (draft) =>
    set(draft ? { draft, capture: null, status: 'idle' } : { draft: null, status: 'idle' }),
}));
