import type { CoachSeries, Effort, Tone } from '@/db/types';
import {
  IconCheck,
  IconInfo,
  IconWarning,
  type IconComponent,
} from '@/shared/ui/icons';

export const TONE_COLOR: Record<Tone, string> = {
  good: 'var(--accent)',
  neutral: 'var(--text-faint)',
  warn: 'var(--warn)',
  bad: 'var(--danger)',
};

export const TONE_ICON: Record<Tone, IconComponent> = {
  good: IconCheck,
  neutral: IconInfo,
  warn: IconWarning,
  bad: IconWarning,
};

export const EFFORT_LABEL: Record<Effort, string> = {
  easy: 'Easy',
  medium: 'Takes effort',
  hard: 'Hard',
};

/** Fallback title when the model leaves a chart untitled. */
export const SERIES_LABEL: Record<CoachSeries, string> = {
  kcalByDay: 'Calories by day',
  snackShareByDay: 'Snack share by day',
  mealSplit: 'Calories by meal',
  macroSplit: 'Where your calories come from',
  topFoods: 'Biggest calorie contributors',
  timeHeatmap: 'When you eat',
  eatingWindow: 'Your eating window',
};

export const PERIOD_OPTIONS = [7, 14, 30] as const;
export type Period = (typeof PERIOD_OPTIONS)[number];

export const DEFAULT_PERIOD: Period = 14;

/** Below this there is not enough diary to say anything honest. */
export const MIN_DAYS_LOGGED = 5;
export const MIN_ENTRIES = 20;

/** Guards against a double tap costing a second API call. */
export const REGENERATE_COOLDOWN_MS = 30_000;
