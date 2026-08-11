import { callOpenAI, checkAccess, fail, json, TRANSCRIBE_MODEL } from './_shared';

const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  const blocked = checkAccess(request);
  if (blocked) return blocked;

  let audio: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get('audio');
    if (value instanceof File) audio = value;
  } catch {
    return fail('Ожидается multipart/form-data с полем audio.', 400);
  }

  if (!audio) return fail('Аудио не получено.', 400);
  if (audio.size === 0) return fail('Запись пустая — скажите что-нибудь.', 400);
  if (audio.size > MAX_BYTES) return fail('Запись слишком длинная.', 413);

  const upstream = new FormData();
  upstream.append('file', audio, fileNameFor(audio.type));
  upstream.append('model', TRANSCRIBE_MODEL);
  upstream.append('language', 'ru');
  upstream.append(
    'prompt',
    'Пользователь перечисляет съеденную еду и её количество: граммы, штуки, порции, ложки.',
  );

  const response = await callOpenAI('/audio/transcriptions', { method: 'POST', body: upstream });
  if (!response.ok) return response;

  const payload = (await response.json()) as { text?: string };
  const text = payload.text?.trim();
  if (!text) return fail('Ничего не удалось расслышать.', 422);

  return json({ text });
}

/** OpenAI picks the decoder from the extension, so the container must be named. */
function fileNameFor(mimeType: string): string {
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'speech.mp4';
  if (mimeType.includes('mpeg')) return 'speech.mp3';
  if (mimeType.includes('wav')) return 'speech.wav';
  return 'speech.webm';
}
