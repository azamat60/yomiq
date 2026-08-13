import type { CoachBlock, CoachStats } from '@/db/types';
import { MACRO_COLOR } from '@/shared/ui/MacroBar';
import { MEAL_LABEL, MEAL_ORDER } from '@/features/diary/constants';
import { BarChart } from '../charts/BarChart';
import { HBarChart } from '../charts/HBarChart';
import { Heatmap } from '../charts/Heatmap';
import { SpanChart } from '../charts/SpanChart';
import { StackedBar } from '../charts/StackedBar';
import { SERIES_LABEL } from '../constants';
import { BlockCard } from './BlockCard';

type Chart = Extract<CoachBlock, { type: 'chart' }>;

const MEAL_COLOR: Record<string, string> = {
  breakfast: 'var(--protein)',
  lunch: 'var(--accent)',
  dinner: 'var(--carbs)',
  snack: 'var(--warn)',
};

const DAY_INITIAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function ChartBlock({ block, stats }: { block: Chart; stats: CoachStats }) {
  const body = render(block, stats);
  if (!body) return null;

  return (
    <BlockCard title={block.title || SERIES_LABEL[block.series]} caption={block.caption}>
      {body}
    </BlockCard>
  );
}

function render(block: Chart, stats: CoachStats): React.ReactNode {
  const logged = stats.byDay.filter((day) => day.entries > 0);

  switch (block.series) {
    case 'kcalByDay':
      if (!logged.length) return null;
      return (
        <BarChart
          columns={logged.map((day) => ({
            label: dayTick(day.date, logged.length),
            value: Math.round(day.kcal),
            over: day.kcal > stats.targets.kcal,
          }))}
          target={stats.targets.kcal}
          format={(value) => `${Math.round(value)}`}
        />
      );

    case 'snackShareByDay':
      if (!logged.length) return null;
      return (
        <BarChart
          columns={logged.map((day) => ({
            label: dayTick(day.date, logged.length),
            value: day.kcal > 0 ? Math.round((day.snackKcal / day.kcal) * 100) : 0,
            over: day.kcal > 0 && day.snackKcal / day.kcal > 0.25,
          }))}
          target={10}
          format={(value) => `${Math.round(value)}%`}
        />
      );

    case 'mealSplit':
      return (
        <StackedBar
          slices={MEAL_ORDER.map((meal) => ({
            label: MEAL_LABEL[meal],
            share: stats.mealKcalShare[meal],
            color: MEAL_COLOR[meal],
          }))}
        />
      );

    case 'macroSplit':
      return (
        <StackedBar
          slices={[
            { label: 'Protein', share: stats.energySplit.protein, color: MACRO_COLOR.protein },
            { label: 'Fat', share: stats.energySplit.fat, color: MACRO_COLOR.fat },
            { label: 'Carbs', share: stats.energySplit.carbs, color: MACRO_COLOR.carbs },
          ]}
          reference={[
            { label: 'Protein', share: stats.targetEnergySplit.protein, color: MACRO_COLOR.protein },
            { label: 'Fat', share: stats.targetEnergySplit.fat, color: MACRO_COLOR.fat },
            { label: 'Carbs', share: stats.targetEnergySplit.carbs, color: MACRO_COLOR.carbs },
          ]}
        />
      );

    case 'topFoods':
      if (!stats.topFoods.length) return null;
      return (
        <HBarChart
          rows={stats.topFoods.map((food) => ({
            label: food.name,
            value: Math.round(food.kcal),
            caption: `${Math.round(food.kcalShare * 100)}% · ${food.count}x`,
            color: MEAL_COLOR[food.meal],
          }))}
          format={(value) => `${Math.round(value)}`}
        />
      );

    case 'timeHeatmap':
      return <Heatmap cells={stats.heatCells} />;

    case 'eatingWindow': {
      const spans = logged
        .filter((day) => day.firstHour !== null && day.lastHour !== null)
        .map((day) => ({
          label: dayLabel(day.date),
          from: day.firstHour as number,
          to: day.lastHour as number,
        }));
      return spans.length ? <SpanChart spans={spans} /> : null;
    }

    default: {
      const never: never = block.series;
      return never;
    }
  }
}

/** Day numbers stop fitting past a fortnight, so long periods fall back to weekday letters. */
function dayTick(date: string, count: number): string {
  if (count <= 14) return date.slice(8);
  return DAY_INITIAL[new Date(`${date}T00:00:00`).getDay()];
}

function dayLabel(date: string): string {
  return `${DAY_INITIAL[new Date(`${date}T00:00:00`).getDay()]} ${Number(date.slice(8))}`;
}
