import { useLiveQuery } from 'dexie-react-hooks';
import { getProfile } from './repository';
import type { Profile } from './types';

/**
 * `undefined` means IndexedDB has not answered yet, `null` means there is no
 * profile. Without that distinction the gate cannot tell a cold start from a
 * first run, and either flashes onboarding or hangs on the splash.
 */
export function useProfile(): Profile | null | undefined {
  return useLiveQuery(async () => (await getProfile()) ?? null, [], undefined);
}
