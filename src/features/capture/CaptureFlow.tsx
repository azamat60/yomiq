import { useAppStore } from '@/shared/store/app';
import { CaptureMenuSheet } from './CaptureMenuSheet';
import { TextCaptureSheet } from './TextCaptureSheet';
import { VoiceCaptureSheet } from './VoiceCaptureSheet';
import { ManualEntrySheet } from './ManualEntrySheet';
import { AnalyzingOverlay } from './AnalyzingOverlay';
import { DraftEditorSheet } from '@/features/entry-editor/DraftEditorSheet';

export function CaptureFlow() {
  const capture = useAppStore((s) => s.capture);
  const status = useAppStore((s) => s.status);
  const draft = useAppStore((s) => s.draft);

  return (
    <>
      <CaptureMenuSheet open={capture === 'menu'} />
      <TextCaptureSheet open={capture === 'text'} />
      <VoiceCaptureSheet open={capture === 'voice'} />
      <ManualEntrySheet open={capture === 'manual'} />
      <AnalyzingOverlay open={status === 'loading'} />
      <DraftEditorSheet draft={draft} />
    </>
  );
}
