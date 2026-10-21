import type { Meal } from '@/db/types';
import {
  IconBreakfast,
  IconDinner,
  IconLunch,
  IconSnack,
  type IconComponent,
} from '@/shared/ui/icons';

export const MEAL_ORDER: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/**
 * Rough split of the daily budget across meals — a guide for "have I overdone
 * lunch?", not a rule. Sums to 1.
 */
const MEAL_KCAL_SHARE: Record<Meal, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
};

export function mealKcalTarget(dailyKcal: number, meal: Meal): number {
  // Rounded to 10 so it reads as an approximation rather than a precise quota.
  return Math.round((dailyKcal * MEAL_KCAL_SHARE[meal]) / 10) * 10;
}

export const MEAL_ICON: Record<Meal, IconComponent> = {
  breakfast: IconBreakfast,
  lunch: IconLunch,
  dinner: IconDinner,
  snack: IconSnack,
};
