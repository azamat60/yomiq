import { create } from 'zustand';
import { en, type Dict } from './en';
import { ru } from './ru';

export type { Dict } from './en';

export const LOCALE = { en: 'en', ru: 'ru' } as const;
export type Locale = keyof typeof LOCALE;

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
};

export const LOCALE_OPTIONS = (Object.keys(LOCALE) as Locale[]).map((value) => ({
  value,
  label: LOCALE_LABEL[value],
}));

const DICTS: Record<Locale, Dict> = { en, ru };
const STORAGE_KEY = 'yomiq:locale';

function initialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in LOCALE) return stored as Locale;
  } catch {
    // Storage can be blocked in private mode; fall through to the browser language.
  }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

type LocaleState = { locale: Locale; setLocale: (locale: Locale) => void };

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initialLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Not persisting is fine — the choice still applies for this session.
    }
    document.documentElement.lang = locale;
    set({ locale });
  },
}));

export function applyStoredLocale(): void {
  document.documentElement.lang = useLocaleStore.getState().locale;
}

/** Subscribes the component, so switching language re-renders it. */
export function useT(): Dict {
  return DICTS[useLocaleStore((s) => s.locale)];
}

export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale);
}

/** For code outside React (API clients, formatters). Does not subscribe. */
export function getT(): Dict {
  return DICTS[useLocaleStore.getState().locale];
}

export function getLocale(): Locale {
  return useLocaleStore.getState().locale;
}
