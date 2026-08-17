import { useCallback, useEffect, useRef, useState } from 'react';
import { MIC_ERROR_TEXT, type MicError } from './constants';

const MAX_SECONDS = 60;
const TICK_MS = 250;

/**
 * Stopping the tracks after every recording means a fresh getUserMedia on the
 * next tap, which is a permission prompt per recording wherever the grant is
 * only held for the session. Keeping the stream alive briefly collapses a burst
 * of retries into one prompt — but a live track keeps the OS recording
 * indicator lit, so the window is short and every exit path releases early.
 */
const IDLE_RELEASE_MS = 30_000;
const IDLE_RELEASE_UNGRANTED_MS = 10_000;

/** iOS Safari only produces audio/mp4; Chrome and Firefox prefer webm/opus. */
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'];

export type RecorderState = 'idle' | 'recording';

type Options = {
  onComplete: (audio: Blob) => void;
  onEmpty?: () => void;
  /** Shortens the idle window when the grant is not known to be persistent. */
  granted?: boolean;
};

export function useRecorder({ onComplete, onEmpty, granted }: Options) {
  const [state, setState] = useState<RecorderState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<MicError | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0);
  const discard = useRef(false);

  const handlers = useRef({ onComplete, onEmpty });
  useEffect(() => {
    handlers.current = { onComplete, onEmpty };
  });

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    void audioContext.current?.suspend();
    setLevel(0);
  }, []);

  const release = useCallback(() => {
    stopMeter();
    if (idle.current) clearTimeout(idle.current);
    idle.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    void audioContext.current?.close();
    audioContext.current = null;
  }, [stopMeter]);

  const scheduleRelease = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(release, granted ? IDLE_RELEASE_MS : IDLE_RELEASE_UNGRANTED_MS);
  }, [granted, release]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') release();
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', release);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', release);
      release();
    };
  }, [release]);

  const stop = useCallback(() => {
    if (recorder.current?.state !== 'recording') return;
    discard.current = false;
    recorder.current.stop();
  }, []);

  const cancel = useCallback(() => {
    if (recorder.current?.state === 'recording') {
      discard.current = true;
      recorder.current.stop();
    } else {
      stopMeter();
      setState('idle');
    }
  }, [stopMeter]);

  const start = useCallback(async () => {
    if (recorder.current?.state === 'recording') return;
    setError(null);

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError('insecure');
      return;
    }

    let media: MediaStream;
    try {
      media = await ensureStream(stream);
    } catch (cause) {
      setError(classify(cause));
      release();
      setState('idle');
      return;
    }

    if (idle.current) clearTimeout(idle.current);
    idle.current = null;

    const mimeType = MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
    const instance = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
    chunks.current = [];
    discard.current = false;

    instance.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    // The only completion path: the 60 s cap and the stop button both land here,
    // which is what stops a maxed-out recording from being silently dropped.
    instance.onstop = () => {
      const blob = new Blob(chunks.current, { type: instance.mimeType || 'audio/webm' });
      recorder.current = null;
      stopMeter();
      setState('idle');
      scheduleRelease();

      if (discard.current) return;
      if (blob.size > 0) handlers.current.onComplete(blob);
      else handlers.current.onEmpty?.();
    };

    recorder.current = instance;
    instance.start();
    setState('recording');
    setSeconds(0);
    startedAt.current = Date.now();

    // Wall-clock rather than a counter, so a throttled tab cannot drift past the cap.
    timer.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setSeconds(Math.min(elapsed, MAX_SECONDS));
      if (elapsed >= MAX_SECONDS) stop();
    }, TICK_MS);

    meter(media, audioContext, frame, setLevel);
  }, [release, scheduleRelease, stop, stopMeter]);

  return {
    state,
    seconds,
    level,
    error: error ? MIC_ERROR_TEXT[error] : null,
    errorKind: error,
    clearError: useCallback(() => setError(null), []),
    start,
    stop,
    cancel,
    release,
    maxSeconds: MAX_SECONDS,
  };
}

async function ensureStream(stream: React.RefObject<MediaStream | null>): Promise<MediaStream> {
  const cached = stream.current;
  if (cached?.getAudioTracks().some((track) => track.readyState === 'live')) return cached;
  const media = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.current = media;
  return media;
}

function meter(
  media: MediaStream,
  context: React.RefObject<AudioContext | null>,
  frame: React.RefObject<number>,
  setLevel: (value: number) => void,
) {
  // One context for the page: Safari caps them at a handful per document.
  const audio = context.current ?? new AudioContext();
  context.current = audio;
  void audio.resume();

  const analyser = audio.createAnalyser();
  analyser.fftSize = 512;
  audio.createMediaStreamSource(media).connect(analyser);

  const buffer = new Uint8Array(analyser.frequencyBinCount);
  const tick = () => {
    analyser.getByteTimeDomainData(buffer);
    let peak = 0;
    for (const value of buffer) peak = Math.max(peak, Math.abs(value - 128) / 128);
    setLevel(peak);
    frame.current = requestAnimationFrame(tick);
  };
  tick();
}

function classify(error: unknown): MicError {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'missing';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  if (name === 'SecurityError') return 'blocked';
  return 'unknown';
}
