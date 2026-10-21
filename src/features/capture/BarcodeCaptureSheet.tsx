import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
import { useAppStore } from '@/shared/store/app';
import { haptic } from '@/shared/lib/haptics';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { useAnalyze } from './useAnalyze';
import { getT, useT } from '@/shared/i18n';
import { ErrorNotice } from './ErrorNotice';

const RETAIL_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
];

const HINTS = new Map([[DecodeHintType.POSSIBLE_FORMATS, RETAIL_FORMATS]]);

export function BarcodeCaptureSheet({ open }: { open: boolean }) {
  const closeCapture = useAppStore((s) => s.closeCapture);
  const popCapture = useAppStore((s) => s.popCapture);
  const status = useAppStore((s) => s.status);
  const { fromBarcode } = useAnalyze();
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const submitted = useRef<string | null>(null);
  // The camera keeps decoding the same code every frame; without this a failed
  // lookup would be retried in a loop as long as the barcode stays in view.
  const failed = useRef<string | null>(null);

  const submit = (code: string, fromCamera = false) => {
    if (submitted.current) return;
    if (fromCamera && code === failed.current) return;
    submitted.current = code;
    haptic('success');
    void fromBarcode(code);
  };

  useEffect(() => {
    if (status !== 'error' || !submitted.current) return;
    failed.current = submitted.current;
    submitted.current = null;
  }, [status]);

  useEffect(() => {
    if (!open) {
      submitted.current = null;
      failed.current = null;
      setCameraError(null);
      setManualCode('');
      return;
    }

    const reader = new BrowserMultiFormatReader(HINTS);
    const controls = reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, videoRef.current!, (result, error) => {
        if (result) submit(result.getText(), true);
        // NotFoundException fires on every frame with no barcode — expected noise, not a real error.
        else if (error && !(error instanceof NotFoundException)) {
          setCameraError(getT().barcode.cameraUnavailable);
        }
      })
      .catch(() => {
        setCameraError(getT().barcode.noCamera);
        return null;
      });

    return () => void controls.then((c) => c?.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submitManual = () => {
    const code = manualCode.trim();
    if (code.length < 6) return;
    submit(code);
  };

  return (
    <Sheet open={open} onClose={closeCapture} onBack={popCapture} title={t.barcode.title}>
      <div className="flex flex-col gap-4">
        <ErrorNotice />

        <div className="relative aspect-square w-full overflow-hidden rounded-card bg-black">
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
        </div>

        {cameraError && (
          <p className="rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-[14px] leading-snug">
            {cameraError}
          </p>
        )}

        <p className="text-center text-[13px] text-muted">
          {t.barcode.pointCamera}
        </p>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[12px] text-faint">{t.barcode.orType}</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <Field
          label={t.barcode.numberLabel}
          inputMode="numeric"
          placeholder={t.barcode.numberPlaceholder}
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 14))}
        />
        <Button size="lg" block disabled={manualCode.trim().length < 6} onClick={submitManual}>
          {t.barcode.lookUp}
        </Button>
      </div>
    </Sheet>
  );
}
