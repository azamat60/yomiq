import type { Confidence, Meal, Source } from '@/db/types';

export const MEAL_ORDER: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABEL: Record<Meal, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export const MEAL_ICON: Record<Meal, string> = {
  breakfast: '🌅',
  lunch: '🍲',
  dinner: '🌙',
  snack: '🍎',
};

export const SOURCE_LABEL: Record<Source, string> = {
  photo: 'по фото',
  text: 'из текста',
  voice: 'голосом',
  manual: 'вручную',
  favorite: 'из избранного',
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  low: 'низкая точность',
  medium: 'средняя точность',
  high: 'высокая точность',
};
