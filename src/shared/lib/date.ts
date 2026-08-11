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

const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export function formatDayLabel(key: string): string {
  const today = toDateKey();
  if (key === today) return 'Сегодня';
  if (key === shiftDateKey(today, -1)) return 'Вчера';
  if (key === shiftDateKey(today, 1)) return 'Завтра';

  const date = fromDateKey(key);
  const withinWeek = Math.abs(date.getTime() - fromDateKey(today).getTime()) < 6 * 864e5;
  if (withinWeek) return capitalize(WEEKDAYS[date.getDay()]);

  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatFullDate(key: string): string {
  const date = fromDateKey(key);
  return `${capitalize(WEEKDAYS[date.getDay()])}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/** Pre-selects the meal the user most likely means right now. */
export function mealForNow(date: Date = new Date()): Meal {
  const hour = date.getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 22) return 'dinner';
  return 'snack';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
