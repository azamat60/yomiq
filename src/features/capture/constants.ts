export const QUICK_TAB = { recent: 'recent', favorites: 'favorites' } as const;
export type QuickTab = keyof typeof QUICK_TAB;

/** Recent is first and default: Favorites is empty for a new user. */
export const QUICK_TABS: QuickTab[] = ['recent', 'favorites'];

export const COMPOSER_MAX_CHARS = 600;
export const PHOTO_HINT_MAX_CHARS = 200;

export const MIC_ERROR = {
  insecure: 'insecure',
  denied: 'denied',
  missing: 'missing',
  busy: 'busy',
  blocked: 'blocked',
  unknown: 'unknown',
} as const;
export type MicError = keyof typeof MIC_ERROR;
