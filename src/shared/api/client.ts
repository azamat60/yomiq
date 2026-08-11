import type { Confidence, Macros } from '@/db/types';

export type AnalysisItem = {
  name: string;
  grams: number;
  per100: Macros;
  confidence: Confidence;
};

export type AnalysisResult = {
  title: string;
  note: string;
  items: AnalysisItem[];
};

const ACCESS_CODE_KEY = 'yomiq:access-code';

export function getAccessCode(): string {
  return localStorage.getItem(ACCESS_CODE_KEY) ?? '';
}

export function setAccessCode(code: string): void {
  if (code) localStorage.setItem(ACCESS_CODE_KEY, code);
  else localStorage.removeItem(ACCESS_CODE_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function post(path: string, init: RequestInit): Promise<unknown> {
  if (!navigator.onLine) {
    throw new ApiError('Нет сети. Добавьте блюдо вручную или повторите позже.', 0);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      method: 'POST',
      headers: { ...(init.headers as Record<string, string>), 'x-app-code': getAccessCode() },
    });
  } catch {
    throw new ApiError('Не удалось связаться с сервером.', 0);
  }

  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new ApiError(payload.error ?? 'Что-то пошло не так.', response.status);
  }

  return payload;
}

export async function analyzePhoto(image: string, hint?: string): Promise<AnalysisResult> {
  return normalize(
    await post('/api/analyze', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'photo', image, hint }),
    }),
  );
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  return normalize(
    await post('/api/analyze', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'text', text }),
    }),
  );
}

export async function transcribe(audio: Blob): Promise<string> {
  const form = new FormData();
  form.append('audio', audio, 'speech');
  const payload = (await post('/api/transcribe', { body: form })) as { text?: string };
  return payload.text ?? '';
}

/** Model output is untrusted input: clamp it before it reaches the UI or the DB. */
function normalize(payload: unknown): AnalysisResult {
  const data = payload as Partial<AnalysisResult>;

  return {
    title: String(data.title ?? '').slice(0, 80),
    note: String(data.note ?? '').slice(0, 240),
    items: (Array.isArray(data.items) ? data.items : []).slice(0, 12).map((item) => ({
      name: String(item?.name ?? 'Блюдо').slice(0, 60),
      grams: clamp(item?.grams, 1, 5000, 100),
      per100: {
        kcal: clamp(item?.per100?.kcal, 0, 900, 0),
        protein: clamp(item?.per100?.protein, 0, 100, 0),
        fat: clamp(item?.per100?.fat, 0, 100, 0),
        carbs: clamp(item?.per100?.carbs, 0, 100, 0),
      },
      confidence: (['low', 'medium', 'high'] as const).includes(item?.confidence as never)
        ? item.confidence
        : 'medium',
    })),
  };
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}
