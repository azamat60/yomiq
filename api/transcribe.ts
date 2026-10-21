import { callOpenAI, checkAccess, fail, json, languageOf, TRANSCRIBE_MODEL } from './_shared.js';

const MAX_BYTES = 20 * 1024 * 1024;

/** Written in the spoken language — the prompt biases the transcript towards it. */
const TRANSCRIBE_PROMPT = {
  en: 'The user is listing food they ate and its amount: grams, pieces, servings, spoonfuls.',
  ru: 'Пользователь перечисляет, что съел, и количество: граммы, штуки, порции, ложки.',
} as const;

export async function POST(request: Request): Promise<Response> {
  const blocked = checkAccess(request);
  if (blocked) return blocked;

  let audio: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get('audio');
    if (value instanceof File) audio = value;
  } catch {
    return fail('Expected multipart/form-data with an audio field.', 400);
  }

  if (!audio) return fail('No audio received.', 400);
  if (audio.size === 0) return fail('The recording is empty — say something.', 400);
  if (audio.size > MAX_BYTES) return fail('The recording is too long.', 413);

  const upstream = new FormData();
  upstream.append('file', audio, fileNameFor(audio.type));
  upstream.append('model', TRANSCRIBE_MODEL);
  const language = languageOf(request);
  upstream.append('language', language);
  upstream.append('prompt', TRANSCRIBE_PROMPT[language]);

  const response = await callOpenAI('/audio/transcriptions', { method: 'POST', body: upstream });
  if (!response.ok) return response;

  const payload = (await response.json()) as { text?: string };
  const text = payload.text?.trim();
  if (!text) return fail('Could not make out any speech.', 422);

  return json({ text });
}

/** OpenAI picks the decoder from the extension, so the container must be named. */
function fileNameFor(mimeType: string): string {
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'speech.mp4';
  if (mimeType.includes('mpeg')) return 'speech.mp3';
  if (mimeType.includes('wav')) return 'speech.wav';
  return 'speech.webm';
}
