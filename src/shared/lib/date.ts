import type { Meal } from '@/db/types';

/** Local calendar day as 'YYYY-MM-DD' — never UTC, or entries land on the wrong day. */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDateKey(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function isToday(key: string): boolean {
  return key === toDateKey();
}

export function isFuture(key: string): boolean {
  return key > toDateKey();
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatDayLabel(key: string): string {
  const today = toDateKey();
  if (key === today) return 'Today';
  if (key === shiftDateKey(today, -1)) return 'Yesterday';
  if (key === shiftDateKey(today, 1)) return 'Tomorrow';

  const date = fromDateKey(key);
  const withinWeek = Math.abs(date.getTime() - fromDateKey(today).getTime()) < 6 * 864e5;
  if (withinWeek) return WEEKDAYS[date.getDay()];

  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatFullDate(key: string): string {
  const date = fromDateKey(key);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Value for an `<input type="time">`, which only speaks 24-hour 'HH:MM'. */
export function toTimeInput(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function fromTimeInput(key: string, value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  const date = fromDateKey(key);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.getTime();
}

const MEAL_HOUR: Record<Meal, number> = { breakfast: 8, lunch: 13, dinner: 19, snack: 16 };

/**
 * When the food was eaten. Logging today means now; logging another day has no
 * real timestamp, so it falls back to a typical hour for that meal rather than
 * stamping every backfilled entry with the moment it was typed in.
 */
export function defaultEatenAt(key: string, meal: Meal): number {
  if (isToday(key)) return Date.now();
  const date = fromDateKey(key);
  date.setHours(MEAL_HOUR[meal], 0, 0, 0);
  return date.getTime();
}

/** Pre-selects the meal the user most likely means right now. */
export function mealForNow(date: Date = new Date()): Meal {
  const hour = date.getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 22) return 'dinner';
  return 'snack';
}
