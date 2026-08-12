import { lazy, Suspense, useState } from 'react';
import { useAppStore } from '@/shared/store/app';
import { CaptureMenuSheet } from './CaptureMenuSheet';
import { TextCaptureSheet } from './TextCaptureSheet';
import { VoiceCaptureSheet } from './VoiceCaptureSheet';
import { ManualEntrySheet } from './ManualEntrySheet';
import { AnalyzingOverlay } from './AnalyzingOverlay';
import { DraftEditorSheet } from '@/features/entry-editor/DraftEditorSheet';

// The zxing decoder is ~125 KB gzipped — split it out so everyone else's
// bundle stays light and it only loads when the barcode sheet actually opens.
const BarcodeCaptureSheet = lazy(() =>
  import('./BarcodeCaptureSheet').then((m) => ({ default: m.BarcodeCaptureSheet })),
);

export function CaptureFlow() {
  const capture = useAppStore((s) => s.capture);
  const status = useAppStore((s) => s.status);
  const draft = useAppStore((s) => s.draft);

  // Stays mounted after the first open so the sheet can animate closed
  // instead of vanishing instantly once the lazy chunk has loaded.
  const [barcodeLoaded, setBarcodeLoaded] = useState(false);
  if (capture === 'barcode' && !barcodeLoaded) setBarcodeLoaded(true);

  return (
    <>
      <CaptureMenuSheet open={capture === 'menu'} />
      <TextCaptureSheet open={capture === 'text'} />
      <VoiceCaptureSheet open={capture === 'voice'} />
      <ManualEntrySheet open={capture === 'manual'} />
      {barcodeLoaded && (
        <Suspense fallback={null}>
          <BarcodeCaptureSheet open={capture === 'barcode'} />
        </Suspense>
      )}
      <AnalyzingOverlay open={status === 'loading'} />
      <DraftEditorSheet draft={draft} />
    </>
  );
}
