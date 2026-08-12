import type { Confidence, Meal, Source } from '@/db/types';
import {
  IconBreakfast,
  IconDinner,
  IconLunch,
  IconSnack,
  type IconComponent,
} from '@/shared/ui/icons';

export const MEAL_ORDER: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABEL: Record<Meal, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const MEAL_ICON: Record<Meal, IconComponent> = {
  breakfast: IconBreakfast,
  lunch: IconLunch,
  dinner: IconDinner,
  snack: IconSnack,
};

export const SOURCE_LABEL: Record<Source, string> = {
  photo: 'from a photo',
  text: 'from text',
  voice: 'by voice',
  barcode: 'from a barcode',
  manual: 'manually',
  favorite: 'from favorites',
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  low: 'low confidence',
  medium: 'medium confidence',
  high: 'high confidence',
};
