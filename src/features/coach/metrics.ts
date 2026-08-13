import type {
  CoachDay,
  CoachFood,
  CoachRedFlags,
  CoachStats,
  Entry,
  Macros,
  Meal,
  Profile,
} from '@/db/types';
import { portionMacros } from '@/shared/lib/nutrition';
import { shiftDateKey } from '@/shared/lib/date';
import { MEAL_ORDER } from '@/features/diary/constants';

const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 } as const;

const LATE_FROM_HOUR = 21;
const LATE_UNTIL_HOUR = 4;
const OVER_TARGET_FACTOR = 1.15;
const UNDER_TARGET_FACTOR = 0.75;
const SNACK_HEAVY_DAY_SHARE = 0.25;
const LATE_DAY_SHARE = 0.15;
const BURST_WINDOW_MS = 30 * 60_000;
const BURST_MIN_ITEMS = 3;
const BURST_KCAL_SHARE = 0.25;
const TOP_FOODS = 8;
const HEAT_BUCKET_HOURS = 2;

const THRESHOLD = {
  erraticCv: 0.3,
  snackShare: 0.3,
  lateShare: 0.25,
  bingeDays: 3,
  overDaysShare: 0.5,
} as const;

type DayGroup = { date: string; entries: Entry[] };

export function buildStats(
  entries: Entry[],
  profile: Profile,
  from: string,
  to: string,
): CoachStats {
  const days = dayKeys(from, to);
  const groups = groupByDay(entries, days);
  const logged = groups.filter((group) => group.entries.length > 0);

  const byDay = groups.map((group) => buildDay(group));
  const loggedDays = byDay.filter((day) => day.entries > 0);
  const dayKcal = loggedDays.map((day) => day.kcal);

  const totals = sumEntries(entries);
  const totalKcal = totals.kcal;
  const totalGrams = entries.reduce((sum, entry) => sum + entry.grams, 0);
  const dayCount = Math.max(1, loggedDays.length);

  const avgMacros: Macros = {
    kcal: totals.kcal / dayCount,
    protein: totals.protein / dayCount,
    fat: totals.fat / dayCount,
    carbs: totals.carbs / dayCount,
  };

  const mealKcal = mealTotals(entries);
  const snackKcal = mealKcal.snack;
  const lateKcal = entries.filter(isLate).reduce((sum, entry) => sum + kcalOf(entry), 0);

  const windows = loggedDays
    .filter((day) => day.firstHour !== null && day.lastHour !== null && day.entries > 1)
    .map((day) => (day.lastHour as number) - (day.firstHour as number));

  const bursts = collectBursts(logged, profile.targets.kcal);
  const weekday = loggedDays.filter((day) => day.dow > 0 && day.dow < 6);
  const weekend = loggedDays.filter((day) => day.dow === 0 || day.dow === 6);

  const weekdayAvgKcal = mean(weekday.map((day) => day.kcal));
  const weekendAvgKcal = mean(weekend.map((day) => day.kcal));

  const daysOverTarget = dayKcal.filter(
    (kcal) => kcal > profile.targets.kcal * OVER_TARGET_FACTOR,
  ).length;

  const stats: Omit<CoachStats, 'redFlags'> = {
    from,
    to,
    days: days.length,

    targets: profile.targets,
    weightKg: profile.weightKg,
    goal: profile.goal,

    daysLogged: loggedDays.length,
    loggingRate: loggedDays.length / days.length,
    entryCount: entries.length,

    avgKcal: avgMacros.kcal,
    medianKcal: median(dayKcal) ?? 0,
    kcalCv: coefficientOfVariation(dayKcal),
    minDayKcal: dayKcal.length ? Math.min(...dayKcal) : 0,
    maxDayKcal: dayKcal.length ? Math.max(...dayKcal) : 0,
    daysOverTarget,
    daysUnderTarget: dayKcal.filter((kcal) => kcal < profile.targets.kcal * UNDER_TARGET_FACTOR)
      .length,

    avgMacros,
    macroPctOfTarget: {
      kcal: share(avgMacros.kcal, profile.targets.kcal),
      protein: share(avgMacros.protein, profile.targets.protein),
      fat: share(avgMacros.fat, profile.targets.fat),
      carbs: share(avgMacros.carbs, profile.targets.carbs),
    },
    proteinPerKg: profile.weightKg > 0 ? avgMacros.protein / profile.weightKg : 0,
    energySplit: energySplit(totals),
    targetEnergySplit: energySplit(profile.targets),
    energyDensity: totalGrams > 0 ? totalKcal / totalGrams : 0,

    snackKcalShare: share(snackKcal, totalKcal),
    snacksPerDay: entries.filter((entry) => entry.meal === 'snack').length / dayCount,
    snackHeavyDaysShare: share(
      loggedDays.filter((day) => day.snackKcal > day.kcal * SNACK_HEAVY_DAY_SHARE).length,
      loggedDays.length,
    ),
    mealKcalShare: MEAL_ORDER.reduce<Record<Meal, number>>(
      (acc, meal) => {
        acc[meal] = share(mealKcal[meal], totalKcal);
        return acc;
      },
      { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
    ),

    lateKcalShare: share(lateKcal, totalKcal),
    lateDays: loggedDays.filter((day) => day.lateKcal > day.kcal * LATE_DAY_SHARE).length,
    eatingWindowMedianH: median(windows),
    firstMealMedianH: median(nonNull(loggedDays.map((day) => day.firstHour))),
    lastMealMedianH: median(nonNull(loggedDays.map((day) => day.lastHour))),
    breakfastSkipDays: logged.filter(
      (group) => !group.entries.some((entry) => entry.meal === 'breakfast'),
    ).length,

    burstCount: bursts.length,
    burstDays: new Set(bursts.map((burst) => burst.date)).size,
    burstAvgKcal: mean(bursts.map((burst) => burst.kcal)),

    weekdayAvgKcal,
    weekendAvgKcal,
    weekendDelta: weekendAvgKcal - weekdayAvgKcal,

    topFoods: rankFoods(entries, totalKcal, TOP_FOODS),
    topSnackFoods: rankFoods(
      entries.filter((entry) => entry.meal === 'snack'),
      totalKcal,
      5,
    ),

    byDay,
    hourKcal: hourShares(entries, totalKcal),
    heatCells: heatCells(entries),
  };

  return { ...stats, redFlags: redFlags(stats) };
}

/**
 * The payload the model sees. Charts are drawn from CoachStats, so the heavy
 * per-cell series stay home; what leaves is small enough to resend on every
 * chat turn, which is what keeps the API route stateless.
 */
export function toModelFacts(stats: CoachStats) {
  return {
    period: {
      from: stats.from,
      to: stats.to,
      days: stats.days,
      daysLogged: stats.daysLogged,
      loggingRate: r2(stats.loggingRate),
      entryCount: stats.entryCount,
    },
    profile: {
      targets: stats.targets,
      weightKg: stats.weightKg,
      goal: stats.goal,
    },
    calories: {
      avg: r0(stats.avgKcal),
      median: r0(stats.medianKcal),
      coefficientOfVariation: r2(stats.kcalCv),
      min: r0(stats.minDayKcal),
      max: r0(stats.maxDayKcal),
      daysOverTarget: stats.daysOverTarget,
      daysUnderTarget: stats.daysUnderTarget,
    },
    macros: {
      avg: roundMacrosTo1(stats.avgMacros),
      pctOfTarget: {
        kcal: r2(stats.macroPctOfTarget.kcal),
        protein: r2(stats.macroPctOfTarget.protein),
        fat: r2(stats.macroPctOfTarget.fat),
        carbs: r2(stats.macroPctOfTarget.carbs),
      },
      proteinPerKg: r2(stats.proteinPerKg),
      energySplit: roundSplit(stats.energySplit),
      targetEnergySplit: roundSplit(stats.targetEnergySplit),
      energyDensityKcalPerGram: r2(stats.energyDensity),
    },
    meals: {
      snackKcalShare: r2(stats.snackKcalShare),
      snacksPerDay: r2(stats.snacksPerDay),
      snackHeavyDaysShare: r2(stats.snackHeavyDaysShare),
      kcalShare: {
        breakfast: r2(stats.mealKcalShare.breakfast),
        lunch: r2(stats.mealKcalShare.lunch),
        dinner: r2(stats.mealKcalShare.dinner),
        snack: r2(stats.mealKcalShare.snack),
      },
    },
    timing: {
      lateKcalShare: r2(stats.lateKcalShare),
      lateDays: stats.lateDays,
      eatingWindowMedianH: r1n(stats.eatingWindowMedianH),
      firstMealMedianH: r1n(stats.firstMealMedianH),
      lastMealMedianH: r1n(stats.lastMealMedianH),
      breakfastSkipDays: stats.breakfastSkipDays,
    },
    bursts: {
      count: stats.burstCount,
      days: stats.burstDays,
      avgKcal: r0(stats.burstAvgKcal),
    },
    rhythm: {
      weekdayAvgKcal: r0(stats.weekdayAvgKcal),
      weekendAvgKcal: r0(stats.weekendAvgKcal),
      weekendDelta: r0(stats.weekendDelta),
    },
    topFoods: stats.topFoods.map(compactFood),
    topSnackFoods: stats.topSnackFoods.map(compactFood),
    byDay: stats.byDay
      .filter((day) => day.entries > 0)
      .map((day) => ({
        date: day.date,
        dow: day.dow,
        kcal: r0(day.kcal),
        protein: r0(day.protein),
        snackKcal: r0(day.snackKcal),
        lateKcal: r0(day.lateKcal),
        entries: day.entries,
        firstHour: r1n(day.firstHour),
        lastHour: r1n(day.lastHour),
      })),
    redFlags: stats.redFlags,
  };
}

export type CoachFacts = ReturnType<typeof toModelFacts>;

function compactFood(food: CoachFood) {
  return {
    name: food.name,
    count: food.count,
    kcal: r0(food.kcal),
    kcalShare: r2(food.kcalShare),
    meal: food.meal,
  };
}

function roundMacrosTo1(macros: Macros): Macros {
  return {
    kcal: r0(macros.kcal),
    protein: r1(macros.protein),
    fat: r1(macros.fat),
    carbs: r1(macros.carbs),
  };
}

function roundSplit(split: { protein: number; fat: number; carbs: number }) {
  return { protein: r2(split.protein), fat: r2(split.fat), carbs: r2(split.carbs) };
}

const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const r1n = (n: number | null) => (n === null ? null : r1(n));

function redFlags(stats: Omit<CoachStats, 'redFlags'>): CoachRedFlags {
  return {
    erraticIntake: stats.kcalCv > THRESHOLD.erraticCv,
    snackDominant: stats.snackKcalShare > THRESHOLD.snackShare,
    nightEating: stats.lateKcalShare > THRESHOLD.lateShare,
    bingePattern: stats.burstDays >= THRESHOLD.bingeDays,
    chronicOver: share(stats.daysOverTarget, stats.daysLogged) > THRESHOLD.overDaysShare,
  };
}

// ---------- day assembly ----------

function dayKeys(from: string, to: string): string[] {
  const keys: string[] = [];
  for (let key = from; key <= to; key = shiftDateKey(key, 1)) keys.push(key);
  return keys;
}

function groupByDay(entries: Entry[], days: string[]): DayGroup[] {
  const map = new Map<string, Entry[]>(days.map((date) => [date, []]));
  for (const entry of entries) map.get(entry.date)?.push(entry);
  return days.map((date) => ({ date, entries: map.get(date) ?? [] }));
}

function buildDay({ date, entries }: DayGroup): CoachDay {
  const totals = sumEntries(entries);
  const hours = entries.map(hourOf).sort((a, b) => a - b);

  return {
    date,
    dow: new Date(`${date}T00:00:00`).getDay(),
    kcal: totals.kcal,
    protein: totals.protein,
    fat: totals.fat,
    carbs: totals.carbs,
    grams: entries.reduce((sum, entry) => sum + entry.grams, 0),
    entries: entries.length,
    snackKcal: entries
      .filter((entry) => entry.meal === 'snack')
      .reduce((sum, entry) => sum + kcalOf(entry), 0),
    lateKcal: entries.filter(isLate).reduce((sum, entry) => sum + kcalOf(entry), 0),
    firstHour: hours.length ? hours[0] : null,
    lastHour: hours.length ? hours[hours.length - 1] : null,
  };
}

// ---------- bursts ----------

type Burst = { date: string; kcal: number };

/**
 * A cluster of food logged inside half an hour. Not a diagnosis — a marker the
 * report can point at, which is why the threshold is either many items or a
 * large share of the daily target in one sitting.
 */
function collectBursts(days: DayGroup[], targetKcal: number): Burst[] {
  const bursts: Burst[] = [];

  for (const { date, entries } of days) {
    const sorted = [...entries].sort((a, b) => a.eatenAt - b.eatenAt);
    let index = 0;

    while (index < sorted.length) {
      let end = index;
      while (end + 1 < sorted.length && sorted[end + 1].eatenAt - sorted[index].eatenAt <= BURST_WINDOW_MS) {
        end += 1;
      }

      const window = sorted.slice(index, end + 1);
      const kcal = window.reduce((sum, entry) => sum + kcalOf(entry), 0);

      if (window.length >= BURST_MIN_ITEMS || kcal >= targetKcal * BURST_KCAL_SHARE) {
        bursts.push({ date, kcal });
        index = end + 1;
      } else {
        index += 1;
      }
    }
  }

  return bursts;
}

// ---------- series ----------

function rankFoods(entries: Entry[], totalKcal: number, limit: number): CoachFood[] {
  const map = new Map<string, { name: string; count: number; kcal: number; meals: Meal[] }>();

  for (const entry of entries) {
    const key = entry.name.trim().toLowerCase();
    const found = map.get(key) ?? { name: entry.name.trim(), count: 0, kcal: 0, meals: [] };
    found.count += 1;
    found.kcal += kcalOf(entry);
    found.meals.push(entry.meal);
    map.set(key, found);
  }

  return [...map.values()]
    .sort((a, b) => b.kcal - a.kcal)
    .slice(0, limit)
    .map(({ name, count, kcal, meals }) => ({
      name,
      count,
      kcal,
      kcalShare: share(kcal, totalKcal),
      meal: modalMeal(meals),
    }));
}

function hourShares(entries: Entry[], totalKcal: number): number[] {
  const hours = new Array<number>(24).fill(0);
  for (const entry of entries) hours[Math.floor(hourOf(entry))] += kcalOf(entry);
  return hours.map((kcal) => share(kcal, totalKcal));
}

function heatCells(entries: Entry[]): { d: number; h: number; v: number }[] {
  const buckets = 24 / HEAT_BUCKET_HOURS;
  const grid = new Array<number>(7 * buckets).fill(0);

  for (const entry of entries) {
    const day = new Date(`${entry.date}T00:00:00`).getDay();
    const bucket = Math.floor(hourOf(entry) / HEAT_BUCKET_HOURS);
    grid[day * buckets + bucket] += kcalOf(entry);
  }

  const peak = Math.max(...grid, 1);
  return grid.map((kcal, index) => ({
    d: Math.floor(index / buckets),
    h: index % buckets,
    v: kcal / peak,
  }));
}

// ---------- helpers ----------

function kcalOf(entry: Entry): number {
  return portionMacros(entry.per100, entry.grams).kcal;
}

function hourOf(entry: Entry): number {
  const date = new Date(entry.eatenAt);
  return date.getHours() + date.getMinutes() / 60;
}

function isLate(entry: Entry): boolean {
  const hour = hourOf(entry);
  return hour >= LATE_FROM_HOUR || hour < LATE_UNTIL_HOUR;
}

function sumEntries(entries: Entry[]): Macros {
  return entries.reduce<Macros>(
    (acc, entry) => {
      const macros = portionMacros(entry.per100, entry.grams);
      return {
        kcal: acc.kcal + macros.kcal,
        protein: acc.protein + macros.protein,
        fat: acc.fat + macros.fat,
        carbs: acc.carbs + macros.carbs,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

function mealTotals(entries: Entry[]): Record<Meal, number> {
  return entries.reduce<Record<Meal, number>>(
    (acc, entry) => {
      acc[entry.meal] += kcalOf(entry);
      return acc;
    },
    { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
  );
}

function modalMeal(meals: Meal[]): Meal {
  const counts = meals.reduce<Record<Meal, number>>(
    (acc, meal) => {
      acc[meal] += 1;
      return acc;
    },
    { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
  );
  return MEAL_ORDER.reduce((best, meal) => (counts[meal] > counts[best] ? meal : best), 'snack');
}

function energySplit(macros: Macros): { protein: number; fat: number; carbs: number } {
  const protein = macros.protein * KCAL_PER_GRAM.protein;
  const fat = macros.fat * KCAL_PER_GRAM.fat;
  const carbs = macros.carbs * KCAL_PER_GRAM.carbs;
  const total = protein + fat + carbs;

  return {
    protein: share(protein, total),
    fat: share(fat, total),
    carbs: share(carbs, total),
  };
}

function share(value: number, total: number): number {
  return total > 0 ? value / total : 0;
}

function mean(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Spread relative to the average — the size-independent way to call intake erratic. */
function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const average = mean(values);
  if (average === 0) return 0;
  const variance = mean(values.map((value) => (value - average) ** 2));
  return Math.sqrt(variance) / average;
}

function nonNull(values: (number | null)[]): number[] {
  return values.filter((value): value is number => value !== null);
}
