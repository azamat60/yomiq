import { callOpenAI, checkAccess, fail, json, VISION_MODEL } from './_shared';

const MAX_IMAGE_CHARS = 4_000_000;
const MAX_TEXT_CHARS = 600;

const SYSTEM_PROMPT = `Ты — нутрициолог, который оценивает питательную ценность еды.

По фотографии или описанию определи каждое блюдо и продукт отдельно и оцени его вес.

Как оценивать вес по фото:
- Опирайся на видимые ориентиры масштаба: обеденная тарелка ≈ 26 см, десертная ≈ 20 см, вилка ≈ 19 см, чайная ложка ≈ 14 см, стандартный стакан ≈ 250 мл, банка напитка ≈ 330 мл.
- Учитывай глубину и объём порции, а не только площадь на снимке.
- Разделяй составные блюда на компоненты: мясо, гарнир, соус, масло, хлеб — отдельными позициями, если их видно.
- Учитывай видимое масло и заправку — они сильно меняют калорийность.
- Не включай несъедобное: посуду, приборы, упаковку, салфетки.

Как заполнять КБЖУ:
- per100 — это калорийность и БЖУ на 100 граммов продукта в готовом виде, по стандартным таблицам состава.
- grams — оценка веса именно этой порции.
- Значения на 100 г не должны зависеть от размера порции.

Достоверность:
- high — блюдо однозначно опознано и порция хорошо видна.
- medium — блюдо понятно, но объём или состав приходится додумывать.
- low — состав неочевиден, снимок нечёткий, или блюдо скрыто.

Названия давай по-русски, коротко (до 40 символов), без слов «примерно» и «около».
В note добавь короткое уточнение, только если оно правда важно — например, что не видно заправку. Иначе оставь пустую строку.
Если еды нет вообще — верни пустой список items и объясни это в note.`;

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Общее короткое название приёма пищи' },
    note: { type: 'string', description: 'Короткое уточнение или пустая строка' },
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
    return fail('Некорректное тело запроса.', 400);
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
  if (!raw) return fail('Пустой ответ модели.', 502);

  try {
    return json(JSON.parse(raw));
  } catch {
    return fail('Модель вернула не-JSON.', 502);
  }
}

function buildContent(body: Body): { value: unknown[] } | { error: string } {
  const hint = body.hint?.trim().slice(0, MAX_TEXT_CHARS);

  if (body.mode === 'text') {
    const text = body.text?.trim();
    if (!text) return { error: 'Опишите, что вы съели.' };
    if (text.length > MAX_TEXT_CHARS) return { error: 'Описание слишком длинное.' };

    return {
      value: [{ type: 'input_text', text: `Что я съел: ${text}` }],
    };
  }

  const image = body.image;
  if (!image?.startsWith('data:image/')) return { error: 'Нужна фотография блюда.' };
  if (image.length > MAX_IMAGE_CHARS) return { error: 'Фото слишком большое.' };

  return {
    value: [
      {
        type: 'input_text',
        text: hint
          ? `Оцени еду на фото. Подсказка от пользователя: ${hint}`
          : 'Оцени еду на фото.',
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
