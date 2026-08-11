export type Macros = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export const SEX = { male: 'male', female: 'female' } as const;
export type Sex = keyof typeof SEX;

export const ACTIVITY = {
  sedentary: 'sedentary',
  light: 'light',
  moderate: 'moderate',
  high: 'high',
  athlete: 'athlete',
} as const;
export type Activity = keyof typeof ACTIVITY;

export const GOAL = { lose: 'lose', maintain: 'maintain', gain: 'gain' } as const;
export type Goal = keyof typeof GOAL;

export const MEAL = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'snack',
} as const;
export type Meal = keyof typeof MEAL;

export const SOURCE = {
  photo: 'photo',
  text: 'text',
  voice: 'voice',
  manual: 'manual',
  favorite: 'favorite',
} as const;
export type Source = keyof typeof SOURCE;

export const CONFIDENCE = { low: 'low', medium: 'medium', high: 'high' } as const;
export type Confidence = keyof typeof CONFIDENCE;

export const PROFILE_ID = 1;

export type Profile = {
  id: typeof PROFILE_ID;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  targets: Macros;
  /** Set once the user edits targets by hand, so body changes stop overwriting them. */
  targetsOverridden: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Entry = {
  id: string;
  /** Local calendar day, 'YYYY-MM-DD'. */
  date: string;
  meal: Meal;
  name: string;
  grams: number;
  /** Macros per 100 g — portion totals are derived, never stored. */
  per100: Macros;
  source: Source;
  photo?: Blob;
  confidence?: Confidence;
  createdAt: number;
};

export type Favorite = {
  id: string;
  name: string;
  per100: Macros;
  defaultGrams: number;
  usageCount: number;
  lastUsedAt: number;
};

/** A parsed food item before it becomes an Entry — shared by AI and manual flows. */
export type DraftItem = {
  id: string;
  name: string;
  grams: number;
  per100: Macros;
  confidence: Confidence;
};

export type Draft = {
  title: string;
  note: string;
  items: DraftItem[];
  source: Source;
  meal: Meal;
  date: string;
  photo?: Blob;
};
