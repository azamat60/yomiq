import { useCallback } from 'react';
import type { Draft, Source } from '@/db/types';
import {
  analyzePhoto,
  analyzeText,
  lookupBarcode,
  transcribe,
  type AnalysisResult,
} from '@/shared/api/client';
import { prepareImage } from '@/shared/lib/image';
import { mealForNow } from '@/shared/lib/date';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';

export function useAnalyze() {
  const date = useAppStore((s) => s.date);
  const presetMeal = useAppStore((s) => s.presetMeal);
  const startAnalysis = useAppStore((s) => s.startAnalysis);
  const failAnalysis = useAppStore((s) => s.failAnalysis);
  const setDraft = useAppStore((s) => s.setDraft);

  const toDraft = useCallback(
    (result: AnalysisResult, source: Source, photo?: Blob): Draft => ({
      title: result.title,
      note: result.note,
      source,
      photo,
      date,
      meal: presetMeal ?? mealForNow(),
      items: result.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
    }),
    [date, presetMeal],
  );

  const run = useCallback(
    async (source: Source, task: () => Promise<{ result: AnalysisResult; photo?: Blob }>) => {
      startAnalysis();
      try {
        const { result, photo } = await task();
        if (result.items.length === 0) {
          failAnalysis(result.note || "Couldn't recognize any food. Try another photo.");
          return;
        }
        haptic('success');
        setDraft(toDraft(result, source, photo));
      } catch (error) {
        haptic('warning');
        failAnalysis(error instanceof Error ? error.message : 'Something went wrong.');
      }
    },
    [failAnalysis, setDraft, startAnalysis, toDraft],
  );

  const fromPhoto = useCallback(
    (file: File, hint?: string) =>
      run('photo', async () => {
        const { dataUrl, blob } = await prepareImage(file);
        return { result: await analyzePhoto(dataUrl, hint), photo: blob };
      }),
    [run],
  );

  const fromText = useCallback(
    (text: string) => run('text', async () => ({ result: await analyzeText(text) })),
    [run],
  );

  const fromVoice = useCallback(
    (audio: Blob) =>
      run('voice', async () => {
        const text = await transcribe(audio);
        return { result: await analyzeText(text) };
      }),
    [run],
  );

  const fromBarcode = useCallback(
    (code: string) =>
      run('barcode', async () => {
        const product = await lookupBarcode(code);
        return {
          result: {
            title: product.name,
            note: '',
            items: [{ name: product.name, grams: 100, per100: product.per100, confidence: 'high' }],
          },
        };
      }),
    [run],
  );

  return { fromPhoto, fromText, fromVoice, fromBarcode };
}
