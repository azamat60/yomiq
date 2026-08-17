import { useEffect, useState } from 'react';

export type MicPermission = 'granted' | 'prompt' | 'denied' | 'unknown';

/**
 * Lets the UI explain a blocked microphone before the user taps, instead of
 * after a failed attempt. Safari has no 'microphone' descriptor and throws
 * rather than rejecting, so 'unknown' is a normal outcome, not an error.
 */
export function useMicPermission(): MicPermission {
  const [state, setState] = useState<MicPermission>('unknown');

  useEffect(() => {
    let status: PermissionStatus | null = null;
    let active = true;

    void (async () => {
      try {
        const result = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        if (!active) return;
        status = result;
        setState(result.state as MicPermission);
        result.onchange = () => setState(result.state as MicPermission);
      } catch {
        setState('unknown');
      }
    })();

    return () => {
      active = false;
      if (status) status.onchange = null;
    };
  }, []);

  return state;
}
