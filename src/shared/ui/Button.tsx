import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent active:brightness-90',
  secondary: 'bg-surface-2 text-text active:bg-surface-3',
  ghost: 'text-muted active:bg-surface-2',
  danger: 'bg-danger/12 text-danger active:bg-danger/20',
};

const SIZE: Record<Size, string> = {
  sm: 'h-10 px-4 text-[15px] rounded-full',
  md: 'h-12 px-5 text-[16px] rounded-full',
  lg: 'h-14 px-6 text-[17px] rounded-full',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  className,
  disabled,
  onClick,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={(event) => {
        haptic('tap');
        onClick?.(event);
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-[transform,filter,background-color] duration-150 active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANT[variant],
        SIZE[size],
        block && 'w-full',
        className,
      )}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-label="Loading"
      className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
    />
  );
}
