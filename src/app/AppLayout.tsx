import { NavLink, Outlet } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';
import { useAppStore } from '@/shared/store/app';
import { IconDiary, IconPlus, IconStar } from '@/shared/ui/icons';
import { CaptureFlow } from '@/features/capture/CaptureFlow';

export function AppLayout() {
  const openCapture = useAppStore((s) => s.openCapture);

  return (
    <div className="min-h-dvh bg-bg">
      <main className="mx-auto max-w-lg pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg-elevated/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-lg grid-cols-3 items-center px-2">
          <Tab to="/" label="Diary" Icon={IconDiary} />

          <div className="flex justify-center">
            <button
              onClick={() => {
                haptic('select');
                openCapture();
              }}
              aria-label="Add food"
              className="-mt-7 grid size-16 place-items-center rounded-full bg-accent text-on-accent shadow-[0_10px_28px_-8px_var(--accent)] transition-transform duration-150 active:scale-90"
            >
              <IconPlus size={30} />
            </button>
          </div>

          <Tab to="/favorites" label="My Foods" Icon={IconStar} />
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
          'flex min-h-14 flex-col items-center justify-center gap-1 pt-2 pb-1.5 transition-colors',
          isActive ? 'text-accent' : 'text-faint active:text-muted',
        )
      }
    >
      <Icon size={23} />
      <span className="text-[11px] font-medium">{label}</span>
    </NavLink>
  );
}
