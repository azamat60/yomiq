import { useState } from 'react';
import type { Favorite, FavoritePhoto } from '@/db/types';
import { portionMacros } from '@/shared/lib/nutrition';
import { haptic } from '@/shared/lib/haptics';
import { MacroChips } from '@/shared/ui/MacroBar';
import { useT } from '@/shared/i18n';
import { IconMeal } from '@/shared/ui/icons';
import { cn } from '@/shared/lib/cn';

export function QuickRow({
  favorite,
  onPick,
  chips,
  showPhoto,
  detail,
  trailing,
}: {
  favorite: Favorite;
  onPick: () => void;
  chips?: boolean;
  showPhoto?: boolean;
  detail?: string;
  trailing?: React.ReactNode;
}) {
  const t = useT();
  const macros = portionMacros(favorite.per100, favorite.defaultGrams);

  return (
    <li className="flex items-center border-b border-line last:border-b-0">
      <div className="min-w-0 flex-1">
        <button
          onClick={() => {
            haptic('tap');
            onPick();
          }}
          className={cn(
            'flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-2',
            showPhoto && favorite.photo && 'pb-0.5',
          )}
        >
          {showPhoto && <FoodThumbnail key={favorite.photo?.url} photo={favorite.photo} />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15.5px] font-medium">{favorite.name}</span>
            <span className="tnum block text-[13px] text-faint">
              {t.foods.entry(favorite.defaultGrams, macros.kcal)}
              {detail && ` · ${detail}`}
            </span>
            {chips && (
              <span className="mt-1 block">
                <MacroChips macros={macros} />
              </span>
            )}
          </span>
        </button>
        {showPhoto && favorite.photo && (
          <a
            href={favorite.photo.source}
            target="_blank"
            rel="noreferrer"
            className="mx-4 mb-2 ml-[4.25rem] block truncate text-[11px] text-faint underline"
          >
            {favorite.photo.author || 'Wikimedia Commons'} · {favorite.photo.license}
          </a>
        )}
      </div>

      {trailing}
    </li>
  );
}

function FoodThumbnail({ photo }: { photo?: FavoritePhoto | null }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2 text-faint">
      {photo && !failed ? (
        <img
          src={photo.url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      ) : (
        <IconMeal size={17} aria-hidden="true" />
      )}
    </span>
  );
}
