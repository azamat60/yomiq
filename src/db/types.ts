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
  barcode: 'barcode',
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
  /** When the food was eaten. Defaults to createdAt, but the user can correct it. */
  eatenAt: number;
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

// ---------- coach ----------

export const TONE = { good: 'good', neutral: 'neutral', warn: 'warn', bad: 'bad' } as const;
export type Tone = keyof typeof TONE;

/** Charts the app knows how to draw from its own numbers. */
export const COACH_SERIES = {
  kcalByDay: 'kcalByDay',
  snackShareByDay: 'snackShareByDay',
  mealSplit: 'mealSplit',
  macroSplit: 'macroSplit',
  topFoods: 'topFoods',
  timeHeatmap: 'timeHeatmap',
  eatingWindow: 'eatingWindow',
} as const;
export type CoachSeries = keyof typeof COACH_SERIES;

export const EFFORT = { easy: 'easy', medium: 'medium', hard: 'hard' } as const;
export type Effort = keyof typeof EFFORT;

export const CALLOUT_KIND = { note: 'note', support: 'support' } as const;
export type CalloutKind = keyof typeof CALLOUT_KIND;

export type CoachBlock =
  | { type: 'verdict'; tone: Tone; headline: string; summary: string; score: number | null }
  | {
      type: 'metrics';
      title: string;
      items: { label: string; value: string; unit: string; hint: string; tone: Tone }[];
    }
  /** Carries no data — the renderer reads the series off the stored CoachStats. */
  | { type: 'chart'; series: CoachSeries; title: string; caption: string }
  | {
      type: 'bar';
      title: string;
      unit: string;
      target: number | null;
      bars: { label: string; value: number; tone: Tone }[];
    }
  | { type: 'insight'; tone: Tone; title: string; body: string; evidence: string }
  | { type: 'actions'; title: string; steps: { title: string; detail: string; effort: Effort }[] }
  | {
      type: 'comparison';
      title: string;
      rows: { label: string; you: string; suggested: string; tone: Tone }[];
    }
  | { type: 'callout'; kind: CalloutKind; tone: Tone; title: string; body: string };

export type CoachDay = {
  date: string;
  /** 0 = Sunday. */
  dow: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  grams: number;
  entries: number;
  snackKcal: number;
  lateKcal: number;
  /** Fractional hour of the first and last thing eaten, e.g. 21.5. */
  firstHour: number | null;
  lastHour: number | null;
};

export type CoachRedFlags = {
  erraticIntake: boolean;
  snackDominant: boolean;
  nightEating: boolean;
  bingePattern: boolean;
  chronicOver: boolean;
};

export type CoachFood = {
  name: string;
  count: number;
  kcal: number;
  kcalShare: number;
  meal: Meal;
};

/** Everything the report needs, computed locally so the model never invents a number. */
export type CoachStats = {
  from: string;
  to: string;
  days: number;

  targets: Macros;
  weightKg: number;
  goal: Goal;

  daysLogged: number;
  loggingRate: number;
  entryCount: number;

  avgKcal: number;
  medianKcal: number;
  kcalCv: number;
  minDayKcal: number;
  maxDayKcal: number;
  daysOverTarget: number;
  daysUnderTarget: number;

  avgMacros: Macros;
  macroPctOfTarget: Macros;
  proteinPerKg: number;
  energySplit: { protein: number; fat: number; carbs: number };
  targetEnergySplit: { protein: number; fat: number; carbs: number };
  energyDensity: number;

  snackKcalShare: number;
  snacksPerDay: number;
  snackHeavyDaysShare: number;
  mealKcalShare: Record<Meal, number>;

  lateKcalShare: number;
  lateDays: number;
  eatingWindowMedianH: number | null;
  firstMealMedianH: number | null;
  lastMealMedianH: number | null;
  breakfastSkipDays: number;

  burstCount: number;
  burstDays: number;
  burstAvgKcal: number;

  weekdayAvgKcal: number;
  weekendAvgKcal: number;
  weekendDelta: number;

  topFoods: CoachFood[];
  topSnackFoods: CoachFood[];

  byDay: CoachDay[];
  /** Share of the period's calories eaten in each hour of the day. */
  hourKcal: number[];
  /** d = weekday 0-6, h = two-hour bucket 0-11, v = 0-1 relative intensity. */
  heatCells: { d: number; h: number; v: number }[];

  redFlags: CoachRedFlags;
};

export type InsightTurn = {
  id: string;
  role: 'user' | 'coach';
  /** Empty for coach turns — their content lives in blocks. */
  text: string;
  blocks: CoachBlock[];
  createdAt: number;
};

export type Insight = {
  id: string;
  from: string;
  to: string;
  days: number;
  /** Snapshot: charts and follow-ups must keep working after new entries land. */
  stats: CoachStats;
  blocks: CoachBlock[];
  turns: InsightTurn[];
  createdAt: number;
};
