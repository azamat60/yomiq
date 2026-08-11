export const OPENAI_BASE = 'https://api.openai.com/v1';

/** Vision model: portion-weight accuracy is the product, so not the cheapest tier. */
export const VISION_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
export const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-transcribe';

const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE || 20);
const WINDOW_MS = 60_000;

const hits = new Map<string, number[]>();

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function fail(message: string, status: number): Response {
  return json({ error: message }, status);
}

export function requireApiKey(): string | null {
  return process.env.OPENAI_API_KEY || null;
}

/**
 * The endpoint is publicly reachable, so an unguarded deploy lets anyone burn
 * the owner's OpenAI credit. The code is a light gate, the IP limit is the
 * backstop for when it leaks.
 */
export function checkAccess(request: Request): Response | null {
  const expected = process.env.APP_ACCESS_CODE;
  if (expected && request.headers.get('x-app-code') !== expected) {
    return fail('Неверный код доступа. Введите его в профиле.', 401);
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'local';

  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    return fail('Слишком много запросов. Подождите минуту.', 429);
  }
  recent.push(now);
  hits.set(ip, recent);

  return null;
}

export async function callOpenAI(path: string, init: RequestInit): Promise<Response> {
  const key = requireApiKey();
  if (!key) return fail('OPENAI_API_KEY не задан на сервере.', 500);

  const response = await fetch(`${OPENAI_BASE}${path}`, {
    ...init,
    headers: { ...(init.headers as Record<string, string>), authorization: `Bearer ${key}` },
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[openai] ${path} ${response.status}: ${detail.slice(0, 800)}`);
    return fail(
      response.status === 429
        ? 'OpenAI ограничил частоту запросов. Попробуйте через минуту.'
        : 'OpenAI не смог обработать запрос.',
      502,
    );
  }

  return response;
}
