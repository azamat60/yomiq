import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 60;
/** iOS Safari only produces audio/mp4; Chrome and Firefox prefer webm/opus. */
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'];

export type RecorderState = 'idle' | 'recording';

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolver = useRef<((blob: Blob | null) => void) | null>(null);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    void audioContext.current?.close();
    audioContext.current = null;
    recorder.current = null;
    setLevel(0);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;

      const mimeType = MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
      const instance = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
      chunks.current = [];

      instance.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      instance.onstop = () => {
        const blob = new Blob(chunks.current, { type: instance.mimeType || 'audio/webm' });
        cleanup();
        setState('idle');
        resolver.current?.(blob.size > 0 ? blob : null);
        resolver.current = null;
      };

      recorder.current = instance;
      instance.start();
      setState('recording');
      setSeconds(0);

      timer.current = setInterval(() => {
        setSeconds((current) => {
          if (current + 1 >= MAX_SECONDS) instance.stop();
          return current + 1;
        });
      }, 1000);

      meter(media);
    } catch {
      setError('No microphone access. Please allow it in your browser settings.');
      cleanup();
      setState('idle');
    }
  }, [cleanup]);

  const meter = (media: MediaStream) => {
    const context = new AudioContext();
    audioContext.current = context;
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(media).connect(analyser);

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(buffer);
      let peak = 0;
      for (const value of buffer) peak = Math.max(peak, Math.abs(value - 128) / 128);
      setLevel(peak);
      frame.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const stop = useCallback((): Promise<Blob | null> => {
    if (!recorder.current || recorder.current.state === 'inactive') return Promise.resolve(null);
    return new Promise((resolve) => {
      resolver.current = resolve;
      recorder.current?.stop();
    });
  }, []);

  const cancel = useCallback(() => {
    resolver.current = null;
    if (recorder.current?.state !== 'inactive') recorder.current?.stop();
    cleanup();
    setState('idle');
  }, [cleanup]);

  return { state, seconds, level, error, start, stop, cancel, maxSeconds: MAX_SECONDS };
}
