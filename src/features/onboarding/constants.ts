import type { Activity, Goal } from '@/db/types';

export const STEPS = ['intro', 'sex', 'body', 'activity', 'goal', 'targets'] as const;

export const ACTIVITY_OPTIONS: Array<{
  value: Activity;
  title: string;
  hint: string;
  icon: string;
}> = [
  { value: 'sedentary', title: 'Сидячий образ жизни', hint: 'Офис, почти нет ходьбы', icon: '💺' },
  { value: 'light', title: 'Лёгкая активность', hint: '1–3 тренировки в неделю', icon: '🚶' },
  { value: 'moderate', title: 'Средняя активность', hint: '3–5 тренировок в неделю', icon: '🏃' },
  { value: 'high', title: 'Высокая активность', hint: '6–7 тренировок в неделю', icon: '🚴' },
  { value: 'athlete', title: 'Спортсмен', hint: 'Две тренировки в день, физический труд', icon: '🏋️' },
];

export const GOAL_OPTIONS: Array<{ value: Goal; title: string; hint: string; icon: string }> = [
  { value: 'lose', title: 'Снизить вес', hint: 'Дефицит 20% от нормы', icon: '📉' },
  { value: 'maintain', title: 'Держать вес', hint: 'Норма поддержания', icon: '⚖️' },
  { value: 'gain', title: 'Набрать массу', hint: 'Профицит 15% от нормы', icon: '📈' },
];
