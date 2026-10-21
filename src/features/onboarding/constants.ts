import type { Activity, Goal } from '@/db/types';
import {
  IconAthlete,
  IconGain,
  IconHigh,
  IconLight,
  IconLose,
  IconMaintain,
  IconModerate,
  IconSedentary,
  type IconComponent,
} from '@/shared/ui/icons';

export const STEPS = ['intro', 'sex', 'body', 'activity', 'goal', 'targets'] as const;

/** Titles and hints live in the i18n dictionary, keyed by value. */
export const ACTIVITY_OPTIONS: Array<{ value: Activity; icon: IconComponent }> = [
  { value: 'sedentary', icon: IconSedentary },
  { value: 'light', icon: IconLight },
  { value: 'moderate', icon: IconModerate },
  { value: 'high', icon: IconHigh },
  { value: 'athlete', icon: IconAthlete },
];

export const GOAL_OPTIONS: Array<{ value: Goal; icon: IconComponent }> = [
  { value: 'lose', icon: IconLose },
  { value: 'maintain', icon: IconMaintain },
  { value: 'gain', icon: IconGain },
];
