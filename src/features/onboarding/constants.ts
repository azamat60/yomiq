import type { Activity, Goal } from '@/db/types';

export const STEPS = ['intro', 'sex', 'body', 'activity', 'goal', 'targets'] as const;

export const ACTIVITY_OPTIONS: Array<{
  value: Activity;
  title: string;
  hint: string;
  icon: string;
}> = [
  { value: 'sedentary', title: 'Sedentary', hint: 'Desk job, little walking', icon: '💺' },
  { value: 'light', title: 'Lightly active', hint: '1–3 workouts a week', icon: '🚶' },
  { value: 'moderate', title: 'Moderately active', hint: '3–5 workouts a week', icon: '🏃' },
  { value: 'high', title: 'Very active', hint: '6–7 workouts a week', icon: '🚴' },
  { value: 'athlete', title: 'Athlete', hint: 'Two workouts a day, physical job', icon: '🏋️' },
];

export const GOAL_OPTIONS: Array<{ value: Goal; title: string; hint: string; icon: string }> = [
  { value: 'lose', title: 'Lose weight', hint: '20% deficit from maintenance', icon: '📉' },
  { value: 'maintain', title: 'Maintain weight', hint: 'Maintenance calories', icon: '⚖️' },
  { value: 'gain', title: 'Gain muscle', hint: '15% surplus over maintenance', icon: '📈' },
];
