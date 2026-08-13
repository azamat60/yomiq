import { callOpenAI, checkAccess, COACH_MODEL, extractOutputText, fail, json } from './_shared.js';

const MAX_FACTS_CHARS = 24_000;
const MAX_QUESTION_CHARS = 400;
const MAX_HISTORY = 8;
const MAX_HISTORY_CHARS = 700;

const SERIES = [
  'kcalByDay',
  'snackShareByDay',
  'mealSplit',
  'macroSplit',
  'topFoods',
  'timeHeatmap',
  'eatingWindow',
] as const;

const BASE_PROMPT = `You are a behavioural nutrition coach analysing a food diary. You are NOT a doctor and you never diagnose. Write in English.

FACTS
- Every number you state must come from the FACTS object. Never invent, estimate or extrapolate a number that is not there.
- Shares in FACTS are fractions (0.38 means 38%). Convert them to percentages when you write them out.
- Hours are local fractional hours (21.5 means 21:30).
- Fibre is not tracked. Never mention fibre. Discuss satiety through energyDensityKcalPerGram and protein instead.
- "bursts" means several items logged inside half an hour, or a quarter of the daily target in one sitting. Describe it as a pattern in the diary, never as a diagnosis.

BLOCKS
- chart blocks carry NO data. The app draws them from its own numbers. Pick the series that supports the point you just made and write a caption that states the single takeaway.
- Available series: kcalByDay (daily calories vs target), snackShareByDay (share of calories from snacks per day), mealSplit (calories by meal), macroSplit (calories from protein/fat/carbs), topFoods (biggest calorie contributors), timeHeatmap (when food is eaten by weekday and hour), eatingWindow (first-to-last meal span per day).
- Every insight block needs an evidence line quoting one concrete number.
- actions: 3-5 steps, each specific enough to do tomorrow. Never "eat healthier" or "watch your portions".
- metrics: at most 6 items, each value short (e.g. "38", "1.4", "15h"). bar: at most 14 bars. comparison: at most 8 rows.
- Use the bar block only when no fixed series fits, and only with numbers taken from FACTS.

TONE AND SAFETY
- Describe patterns, never label the person. Write "the diary shows food logged in rapid succession most evenings", never "you have binge eating disorder".
- Never suggest a calorie target below the user's current target.
- No moralising. Never call a food bad, dirty, a cheat, or a sin, and never use guilt.
- If two or more values in facts.redFlags are true, include exactly one callout block with kind "support" and tone "warn": say these patterns are common and treatable, and that a doctor or a psychologist who works with eating behaviour can help. Two sentences, calm, not alarming.
- Do not produce a generic disclaimer block. The app renders its own.

REFERENCE BANDS
Snacks around 10% of calories. Protein 1.6-1.8 g per kg of body weight. Eating window 10-12 hours. Coefficient of variation of daily calories below 0.25. Energy density 1.0-1.5 kcal per gram.`;

const REPORT_PROMPT = `${BASE_PROMPT}

TASK
Produce the full report: 7 to 10 blocks, in this order — one verdict, one metrics, then 2 to 3 charts interleaved with insights, then an optional comparison, then one actions block. Lead with what matters most for this diary, not with a template.`;

const CHAT_PROMPT = `${BASE_PROMPT}

TASK
Answer the user's follow-up question with 1 to 4 blocks. Lead with the direct answer. If FACTS cannot answer the question, say so in a single insight block and name what the user would have to log to find out.`;

const obj = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const tone = { type: 'string', enum: ['good', 'neutral', 'warn', 'bad'] };
const kind = (value: string) => ({ type: 'string', enum: [value] });

const DEFS = {
  verdict: obj({
    type: kind('verdict'),
    tone,
    headline: { type: 'string', description: 'Under 80 characters' },
    summary: { type: 'string', description: '2-3 sentences' },
    score: { type: ['number', 'null'], description: '0-100 habit score, or null' },
  }),
  metrics: obj({
    type: kind('metrics'),
    title: { type: 'string' },
    items: {
      type: 'array',
      description: 'At most 6 items',
      items: obj({
        label: { type: 'string' },
        value: { type: 'string' },
        unit: { type: 'string', description: 'Short unit, or an empty string' },
        hint: { type: 'string', description: 'Target or reference band, or an empty string' },
        tone,
      }),
    },
  }),
  chart: obj({
    type: kind('chart'),
    series: { type: 'string', enum: SERIES },
    title: { type: 'string' },
    caption: { type: 'string', description: 'One takeaway sentence' },
  }),
  bar: obj({
    type: kind('bar'),
    title: { type: 'string' },
    unit: { type: 'string' },
    target: { type: ['number', 'null'] },
    bars: {
      type: 'array',
      description: 'At most 14 bars',
      items: obj({ label: { type: 'string' }, value: { type: 'number' }, tone }),
    },
  }),
  insight: obj({
    type: kind('insight'),
    tone,
    title: { type: 'string' },
    body: { type: 'string' },
    evidence: { type: 'string', description: 'One line quoting a concrete number from FACTS' },
  }),
  actions: obj({
    type: kind('actions'),
    title: { type: 'string' },
    steps: {
      type: 'array',
      description: '3-5 steps',
      items: obj({
        title: { type: 'string' },
        detail: { type: 'string' },
        effort: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      }),
    },
  }),
  comparison: obj({
    type: kind('comparison'),
    title: { type: 'string' },
    rows: {
      type: 'array',
      description: 'At most 8 rows',
      items: obj({
        label: { type: 'string' },
        you: { type: 'string' },
        suggested: { type: 'string' },
        tone,
      }),
    },
  }),
  callout: obj({
    type: kind('callout'),
    kind: { type: 'string', enum: ['note', 'support'] },
    tone,
    title: { type: 'string' },
    body: { type: 'string' },
  }),
};

const SCHEMA = {
  type: 'object',
  properties: {
    blocks: {
      type: 'array',
      items: { anyOf: Object.keys(DEFS).map((name) => ({ $ref: `#/$defs/${name}` })) },
    },
  },
  required: ['blocks'],
  additionalProperties: false,
  $defs: DEFS,
} as const;

type Turn = { role?: string; text?: string };

type Body = {
  mode?: 'report' | 'chat';
  facts?: unknown;
  question?: string;
  history?: Turn[];
};

export async function POST(request: Request): Promise<Response> {
  const blocked = checkAccess(request);
  if (blocked) return blocked;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail('Malformed request body.', 400);
  }

  if (!body.facts || typeof body.facts !== 'object') return fail('Diary summary is missing.', 400);

  const facts = JSON.stringify(body.facts);
  if (facts.length > MAX_FACTS_CHARS) return fail('The selected period is too large.', 400);

  const chat = body.mode === 'chat';
  const question = body.question?.trim().slice(0, MAX_QUESTION_CHARS);
  if (chat && !question) return fail('Ask a question first.', 400);

  const response = await callOpenAI('/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: COACH_MODEL,
      instructions: chat ? CHAT_PROMPT : REPORT_PROMPT,
      input: [{ role: 'user', content: [{ type: 'input_text', text: buildInput(facts, body) }] }],
      text: {
        format: { type: 'json_schema', name: 'coach_report', schema: SCHEMA, strict: true },
      },
      reasoning: { effort: 'medium' },
      max_output_tokens: 4000,
    }),
  });
  if (!response.ok) return response;

  const payload = (await response.json()) as unknown;
  const raw = extractOutputText(payload);
  if (!raw) return fail('Empty response from the model.', 502);

  try {
    return json(JSON.parse(raw));
  } catch {
    return fail('The model returned non-JSON output.', 502);
  }
}

/**
 * The route is stateless, so every chat turn carries the facts again. Prior
 * answers arrive already flattened to text — resending their JSON would cost
 * more than it is worth.
 */
function buildInput(facts: string, body: Body): string {
  const parts = [`FACTS\n${facts}`];

  const history = (body.history ?? []).slice(-MAX_HISTORY);
  if (history.length) {
    const lines = history.map(
      (turn) =>
        `${turn.role === 'coach' ? 'Coach' : 'User'}: ${String(turn.text ?? '').slice(0, MAX_HISTORY_CHARS)}`,
    );
    parts.push(`CONVERSATION SO FAR\n${lines.join('\n')}`);
  }

  if (body.mode === 'chat') {
    parts.push(`QUESTION\n${body.question?.trim().slice(0, MAX_QUESTION_CHARS)}`);
  }

  return parts.join('\n\n');
}
