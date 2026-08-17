import { Suspense, useEffect, useRef, useState } from 'react';
import { lazyChunk } from '@/shared/lib/lazyChunk';
import { useAppStore, useCaptureStep } from '@/shared/store/app';
import { ComposerSheet } from './ComposerSheet';
import { PhotoPreviewSheet } from './PhotoPreviewSheet';
import { QuickAddStepSheet } from './QuickAddStepSheet';
import { ManualEntrySheet } from './ManualEntrySheet';
import { AnalyzingOverlay } from './AnalyzingOverlay';
import { DraftEditorSheet } from '@/features/entry-editor/DraftEditorSheet';

// The zxing decoder is ~125 KB gzipped — split it out so the diary's first
// paint never pays for a scanner most sessions never open.
const BarcodeCaptureSheet = lazyChunk(() =>
  import('./BarcodeCaptureSheet').then((m) => ({ default: m.BarcodeCaptureSheet })),
);

export function CaptureFlow() {
  const step = useCaptureStep();
  const kind = step?.kind ?? null;
  const status = useAppStore((s) => s.status);
  const draft = useAppStore((s) => s.draft);

  // Stays mounted after the first open so the sheet can animate closed.
  const [barcodeLoaded, setBarcodeLoaded] = useState(false);
  if (kind === 'barcode' && !barcodeLoaded) setBarcodeLoaded(true);

  useHardwareBack();

  return (
    <>
      <ComposerSheet open={kind === 'composer'} />
      <PhotoPreviewSheet open={kind === 'photo'} file={step?.kind === 'photo' ? step.file : null} />
      <QuickAddStepSheet
        open={kind === 'quickAdd'}
        favorite={step?.kind === 'quickAdd' ? step.favorite : null}
      />
      <ManualEntrySheet open={kind === 'manual'} />
      {barcodeLoaded && (
        <Suspense fallback={null}>
          <BarcodeCaptureSheet open={kind === 'barcode'} />
        </Suspense>
      )}
      <AnalyzingOverlay open={status === 'loading'} />
      <DraftEditorSheet draft={draft} />
    </>
  );
}

/**
 * Mirrors the capture stack onto history entries so Android's back gesture
 * steps back through the flow instead of leaving the app.
 */
function useHardwareBack() {
  const depth = useAppStore((s) => s.captureStack.length);
  const popCapture = useAppStore((s) => s.popCapture);
  const pushed = useRef(0);
  // Our own history.back() calls also fire popstate; swallow those so closing a
  // sheet in the UI does not pop the stack a second time.
  const pending = useRef(0);

  useEffect(() => {
    const onPopState = () => {
      if (pending.current > 0) {
        pending.current -= 1;
        return;
      }
      if (pushed.current === 0) return;
      pushed.current -= 1;
      popCapture();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [popCapture]);

  useEffect(() => {
    while (pushed.current < depth) {
      pushed.current += 1;
      history.pushState({ capture: pushed.current }, '');
    }
    while (pushed.current > depth) {
      pushed.current -= 1;
      pending.current += 1;
      history.back();
    }
  }, [depth]);
}
