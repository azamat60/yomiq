import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { fillFavoritePhoto, nextFavoriteWithoutPhoto } from '@/db/repository';
import type { FavoritePhoto } from '@/db/types';
import { post } from '@/shared/api/client';
import { useOnline } from '@/shared/lib/useOnline';

const RETRY_DELAY = 60_000;
let inFlight: Promise<void> | undefined;

export function useFavoritePhotos() {
  const online = useOnline();
  const id = useLiveQuery(async () => (await nextFavoriteWithoutPhoto())?.id);

  useEffect(() => {
    if (!online || !id) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const run = async () => {
      if (inFlight) await inFlight.catch(() => undefined);
      if (!active) return;

      const fill = () => fillFavoritePhoto(id, findPhoto);
      const job = (async () => {
        if (navigator.locks) await navigator.locks.request('yomiq:favorite-photo', fill);
        else await fill();
      })();
      inFlight = job;
      try {
        await job;
      } catch {
        if (active) timer = setTimeout(() => void run(), RETRY_DELAY);
      } finally {
        if (inFlight === job) inFlight = undefined;
      }
    };

    void run();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id, online]);
}

async function findPhoto(name: string): Promise<FavoritePhoto | null> {
  const payload = (await post('/api/favorite-photo', {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name }),
    signal: AbortSignal.timeout(55_000),
  })) as { photo?: FavoritePhoto | null };

  if (payload.photo === undefined) throw new Error('Missing photo response');
  return payload.photo;
}
