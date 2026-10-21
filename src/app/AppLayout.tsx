import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';
import { useTodayRollover } from '@/shared/lib/useTodayRollover';
import { useAppStore } from '@/shared/store/app';
import { useT } from '@/shared/i18n';
import { SplashScreen } from '@/shared/ui/SplashScreen';
import { IconCoach, IconDiary, IconPlus, IconStar, IconUser } from '@/shared/ui/icons';
import { CaptureFlow } from '@/features/capture/CaptureFlow';

export function AppLayout() {
  const openCapture = useAppStore((s) => s.openCapture);
  const t = useT();
  useTodayRollover();

  return (
    <div className="min-h-dvh bg-bg">
      <main className="mx-auto max-w-lg pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Five columns, not four: the capture button has to sit in the middle cell. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg-elevated/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-center px-1">
          <Tab to="/" label={t.nav.diary} Icon={IconDiary} />
          <Tab to="/coach" label={t.nav.coach} Icon={IconCoach} />

          <div className="flex justify-center">
            <button
              onClick={() => {
                haptic('select');
                openCapture();
              }}
              aria-label={t.nav.addFood}
              className="-mt-7 grid size-16 place-items-center rounded-full bg-accent text-on-accent shadow-[0_10px_28px_-8px_var(--accent)] transition-transform duration-150 active:scale-90"
            >
              <IconPlus size={30} />
            </button>
          </div>

          <Tab to="/favorites" label={t.nav.foods} Icon={IconStar} />
          <Tab to="/profile" label={t.nav.profile} Icon={IconUser} />
        </div>
        <div className="h-safe-bottom" />
      </nav>

      <CaptureFlow />
    </div>
  );
}

function Tab({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: (props: { size?: number }) => React.ReactElement;
}) {
  return (
    <NavLink
      to={to}
      end
      onClick={() => haptic('tap')}
      className={({ isActive }) =>
        cn(
          'flex min-h-14 flex-col items-center justify-center gap-1 px-0.5 pt-2 pb-1.5 transition-colors',
          isActive ? 'text-accent' : 'text-faint active:text-muted',
        )
      }
    >
      <Icon size={23} />
      <span className="text-[11px] font-medium">{label}</span>
    </NavLink>
  );
}
