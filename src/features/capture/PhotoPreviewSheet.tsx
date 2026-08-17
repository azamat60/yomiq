import { useEffect, useRef, useState } from 'react';
import { useObjectUrl } from '@/shared/lib/useObjectUrl';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { IconCamera, IconLibrary } from '@/shared/ui/icons';
import { ErrorNotice } from './ErrorNotice';
import { PHOTO_HINT_MAX_CHARS } from './constants';
import { useAnalyze } from './useAnalyze';

export function PhotoPreviewSheet({ open, file }: { open: boolean; file: File | null }) {
  const closeCapture = useAppStore((s) => s.closeCapture);
  const popCapture = useAppStore((s) => s.popCapture);
  const replaceCapture = useAppStore((s) => s.replaceCapture);
  const { fromPhoto } = useAnalyze();

  const [hint, setHint] = useState('');
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);

  // Keeps the image on screen while the sheet animates out after the stack pops.
  const [shown, setShown] = useState<File | null>(file);
  useEffect(() => {
    if (file) setShown(file);
  }, [file]);

  useEffect(() => {
    if (!open) setHint('');
  }, [open]);

  // Raw File, not the compressed one: <img> applies EXIF orientation by default,
  // which is what prepareImage bakes in, so the preview matches what gets sent.
  const url = useObjectUrl(shown ?? undefined);

  const replace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    event.target.value = '';
    if (!next) return;
    haptic('select');
    replaceCapture({ kind: 'photo', file: next });
  };

  return (
    <Sheet
      open={open}
      onClose={closeCapture}
      onBack={popCapture}
      title="Check the photo"
      tall
      footer={
        <Button
          size="lg"
          block
          disabled={!shown}
          onClick={() => {
            haptic('select');
            if (shown) void fromPhoto(shown, hint.trim() || undefined);
          }}
        >
          Analyse
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <ErrorNotice />

        {url && (
          <img
            src={url}
            alt=""
            className="max-h-[42dvh] w-full rounded-card border border-line object-contain"
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => cameraInput.current?.click()}>
            <IconCamera size={18} />
            Retake
          </Button>
          <Button variant="secondary" onClick={() => libraryInput.current?.click()}>
            <IconLibrary size={18} />
            Library
          </Button>
        </div>

        <Field
          label="Anything to add?"
          placeholder="e.g. fried in 2 tbsp of oil"
          maxLength={PHOTO_HINT_MAX_CHARS}
          value={hint}
          onChange={(event) => setHint(event.target.value)}
        />
        <p className="-mt-2 px-1 text-[12.5px] leading-snug text-faint">
          A note about oil, sauce, or portion size makes the estimate noticeably better.
        </p>
      </div>

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={replace}
      />
      <input ref={libraryInput} type="file" accept="image/*" hidden onChange={replace} />
    </Sheet>
  );
}
