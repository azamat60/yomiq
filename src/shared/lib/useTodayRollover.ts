import { useEffect } from 'react';
import { useAppStore } from '@/shared/store/app';
import { toDateKey } from './date';

const CHECK_MS = 60_000;

/**
 * The diary date is picked once at startup. A PWA left open overnight would
 * otherwise keep logging breakfast onto yesterday, so a user who was looking
 * at "today" is moved along when the calendar day changes.
 */
export function useTodayRollover(): void {
  useEffect(() => {
    let today = toDateKey();

    const check = () => {
      const now = toDateKey();
      if (now === today) return;
      const { date, setDate } = useAppStore.getState();
      if (date === today) setDate(now);
      today = now;
    };

    const timer = setInterval(check, CHECK_MS);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
}
