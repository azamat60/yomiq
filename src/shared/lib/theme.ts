export const THEME = { dark: 'dark', light: 'light', system: 'system' } as const;
export type Theme = keyof typeof THEME;

export const THEME_LABEL: Record<Theme, string> = {
  dark: 'Тёмная',
  light: 'Светлая',
  system: 'Системная',
};

const STORAGE_KEY = 'yomiq:theme';

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && stored in THEME ? (stored as Theme) : 'dark';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function applyStoredTheme(): void {
  applyTheme(getStoredTheme());
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}
