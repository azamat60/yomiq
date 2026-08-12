import { callOpenAI, checkAccess, fail, json, VISION_MODEL } from './_shared.js';

const MAX_IMAGE_CHARS = 4_000_000;
const MAX_TEXT_CHARS = 600;

const SYSTEM_PROMPT = `You are a nutritionist who estimates the nutritional value of food.

From a photo or a description, identify each dish and food item separately and estimate its weight.

How to estimate weight from a photo:
- Use visible scale references: a dinner plate is about 26 cm, a dessert plate about 20 cm, a fork about 19 cm, a teaspoon about 14 cm, a standard glass about 250 ml, a drink can about 330 ml.
- Account for depth and volume of the portion, not just the area visible in the shot.
- Split composite dishes into components — meat, side, sauce, oil, bread — as separate items when visible.
- Account for visible oil and dressing — they significantly change calorie counts.
- Do not include anything inedible: dishware, utensils, packaging, napkins.

How to fill in the macros:
- per100 is the calories and macros per 100 grams of the food as prepared, based on standard nutrition tables.
- grams is the estimated weight of this specific portion.
- Per-100g values must not depend on the portion size.

Confidence:
- high — the dish is clearly identified and the portion is clearly visible.
- medium — the dish is clear, but the volume or composition has to be guessed.
- low — the composition is unclear, the photo is blurry, or the dish is partially hidden.

Give names in English, short (under 40 characters), without words like "approximately" or "about".
Add a short note only if it's genuinely important — for example, that the dressing isn't visible. Otherwise leave it as an empty string.
If there's no food at all, return an empty items list and explain why in note.`;

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Short overall name for the meal' },
    note: { type: 'string', description: 'A short clarification, or an empty string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          grams: { type: 'number' },
          per100: {
            type: 'object',
            properties: {
              kcal: { type: 'number' },
              protein: { type: 'number' },
              fat: { type: 'number' },
              carbs: { type: 'number' },
            },
            required: ['kcal', 'protein', 'fat', 'carbs'],
            additionalProperties: false,
          },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['name', 'grams', 'per100', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'note', 'items'],
  additionalProperties: false,
} as const;

type Body = {
  mode?: 'photo' | 'text';
  image?: string;
  text?: string;
  hint?: string;
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

  const content = buildContent(body);
  if ('error' in content) return fail(content.error, 400);

  const response = await callOpenAI('/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: VISION_MODEL,
      instructions: SYSTEM_PROMPT,
      input: [{ role: 'user', content: content.value }],
      text: {
        format: { type: 'json_schema', name: 'meal_analysis', schema: SCHEMA, strict: true },
      },
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

function buildContent(body: Body): { value: unknown[] } | { error: string } {
  const hint = body.hint?.trim().slice(0, MAX_TEXT_CHARS);

  if (body.mode === 'text') {
    const text = body.text?.trim();
    if (!text) return { error: 'Describe what you ate.' };
    if (text.length > MAX_TEXT_CHARS) return { error: 'The description is too long.' };

    return {
      value: [{ type: 'input_text', text: `What I ate: ${text}` }],
    };
  }

  const image = body.image;
  if (!image?.startsWith('data:image/')) return { error: 'A photo of the food is required.' };
  if (image.length > MAX_IMAGE_CHARS) return { error: 'The photo is too large.' };

  return {
    value: [
      {
        type: 'input_text',
        text: hint ? `Estimate the food in the photo. User hint: ${hint}` : 'Estimate the food in the photo.',
      },
      { type: 'input_image', image_url: image, detail: 'high' },
    ],
  };
}

/** Responses API nests the text inside output[].content[]; `output_text` is the shortcut. */
function extractOutputText(payload: unknown): string | null {
  const data = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (typeof data.output_text === 'string' && data.output_text) return data.output_text;

  for (const item of data.output ?? []) {
    for (const part of item.content ?? []) {
      if (part.type === 'output_text' && part.text) return part.text;
    }
  }

  return null;
}
