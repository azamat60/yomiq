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

export const ACTIVITY_OPTIONS: Array<{
  value: Activity;
  title: string;
  hint: string;
  icon: IconComponent;
}> = [
  { value: 'sedentary', title: 'Sedentary', hint: 'Desk job, little walking', icon: IconSedentary },
  { value: 'light', title: 'Lightly active', hint: '1–3 workouts a week', icon: IconLight },
  { value: 'moderate', title: 'Moderately active', hint: '3–5 workouts a week', icon: IconModerate },
  { value: 'high', title: 'Very active', hint: '6–7 workouts a week', icon: IconHigh },
  { value: 'athlete', title: 'Athlete', hint: 'Two workouts a day, physical job', icon: IconAthlete },
];

export const GOAL_OPTIONS: Array<{
  value: Goal;
  title: string;
  hint: string;
  icon: IconComponent;
}> = [
  { value: 'lose', title: 'Lose weight', hint: '20% deficit from maintenance', icon: IconLose },
  { value: 'maintain', title: 'Maintain weight', hint: 'Maintenance calories', icon: IconMaintain },
  { value: 'gain', title: 'Gain muscle', hint: '15% surplus over maintenance', icon: IconGain },
];
