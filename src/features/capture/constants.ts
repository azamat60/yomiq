import type { Source } from '@/db/types';

export const QUICK_TAB = { recent: 'recent', favorites: 'favorites' } as const;
export type QuickTab = keyof typeof QUICK_TAB;

/** Recent is first and default: Favorites is empty for a new user. */
export const QUICK_TAB_OPTIONS: Array<{ value: QuickTab; label: string }> = [
  { value: 'recent', label: 'Recent' },
  { value: 'favorites', label: 'Favorites' },
];

export const COMPOSER_MAX_CHARS = 600;
export const PHOTO_HINT_MAX_CHARS = 200;

export const EXAMPLES = [
  'Two eggs, toast with butter, coffee with milk',
  'A bowl of borscht with sour cream and rye bread',
  'Chicken breast 200 g with rice and salad',
];

const GENERIC_STAGES = ['Working on it…', 'Calculating calories and macros…'];

export const ANALYSIS_STAGES: Record<Source, string[]> = {
  photo: [
    'Reading the photo…',
    'Identifying the dishes…',
    'Estimating portion weight…',
    'Calculating calories and macros…',
  ],
  text: ['Reading your description…', 'Estimating portion weight…', 'Calculating calories and macros…'],
  voice: ['Transcribing what you said…', 'Identifying the dishes…', 'Calculating calories and macros…'],
  barcode: ['Looking up the product…', 'Reading the label…'],
  manual: GENERIC_STAGES,
  favorite: GENERIC_STAGES,
};

export const MIC_ERROR = {
  insecure: 'insecure',
  denied: 'denied',
  missing: 'missing',
  busy: 'busy',
  blocked: 'blocked',
  unknown: 'unknown',
} as const;
export type MicError = keyof typeof MIC_ERROR;

export const MIC_ERROR_TEXT: Record<MicError, string> = {
  insecure: 'Voice input needs a secure (https) connection. Type what you ate instead.',
  denied: 'Microphone access is off. Allow it for this site in your browser settings, then try again.',
  missing: 'No microphone found on this device.',
  busy: 'The microphone is busy in another app. Close it and try again.',
  blocked: 'This page is not allowed to use the microphone.',
  unknown: 'Could not start recording. Try again, or type what you ate.',
};
