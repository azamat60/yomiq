import type { Activity, Goal, Macros, Profile, Sex } from '@/db/types';

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
};

const GOAL_FACTOR: Record<Goal, number> = {
  lose: 0.8,
  maintain: 1,
  gain: 1.15,
};

const PROTEIN_PER_KG: Record<Goal, number> = {
  lose: 1.8,
  maintain: 1.6,
  gain: 1.7,
};

const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 } as const;
const FAT_SHARE_OF_KCAL = 0.3;
const MIN_FAT_PER_KG = 0.8;

export type BodyParams = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
};

/** Mifflin-St Jeor. */
export function basalMetabolicRate({ sex, age, heightCm, weightKg }: BodyParams): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return base + (sex === 'male' ? 5 : -161);
}

export function totalDailyEnergy(params: BodyParams): number {
  return basalMetabolicRate(params) * ACTIVITY_FACTOR[params.activity];
}

export function calculateTargets(params: BodyParams): Macros {
  const kcal = Math.round((totalDailyEnergy(params) * GOAL_FACTOR[params.goal]) / 10) * 10;

  const protein = Math.round(params.weightKg * PROTEIN_PER_KG[params.goal]);
  const fat = Math.round(
    Math.max((kcal * FAT_SHARE_OF_KCAL) / KCAL_PER_GRAM.fat, params.weightKg * MIN_FAT_PER_KG),
  );
  const carbs = Math.max(
    0,
    Math.round(
      (kcal - protein * KCAL_PER_GRAM.protein - fat * KCAL_PER_GRAM.fat) / KCAL_PER_GRAM.carbs,
    ),
  );

  return { kcal, protein, fat, carbs };
}

/** Scales per-100g macros to an actual portion. */
export function portionMacros(per100: Macros, grams: number): Macros {
  const k = grams / 100;
  return {
    kcal: Math.round(per100.kcal * k),
    protein: round1(per100.protein * k),
    fat: round1(per100.fat * k),
    carbs: round1(per100.carbs * k),
  };
}

/**
 * Inverse of portionMacros. The user judges the numbers for the portion in
 * front of them, so corrections are entered there and folded back into the
 * per-100g figure the database actually stores.
 */
export function per100FromPortion(portion: Macros, grams: number): Macros {
  const k = 100 / Math.max(1, grams);
  return {
    kcal: round1(portion.kcal * k),
    protein: round1(portion.protein * k),
    fat: round1(portion.fat * k),
    carbs: round1(portion.carbs * k),
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce<Macros>(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
      carbs: acc.carbs + m.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    protein: Math.round(m.protein),
    fat: Math.round(m.fat),
    carbs: Math.round(m.carbs),
  };
}

export function targetsFor(profile: BodyParams & Partial<Pick<Profile, 'targets'>>): Macros {
  return profile.targets ?? calculateTargets(profile);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
