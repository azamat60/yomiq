import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';

export function Field({
  label,
  suffix,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; suffix?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="px-1 text-[13px] font-medium text-muted">{label}</span>}
      <span className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 focus-within:border-accent">
        <input
          {...rest}
          className={cn(
            'tnum min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint',
            className,
          )}
        />
        {suffix && <span className="shrink-0 text-[15px] text-faint">{suffix}</span>}
      </span>
    </label>
  );
}

type OptionProps<T extends string> = {
  value: T;
  selected: T;
  onSelect: (value: T) => void;
  title: string;
  hint?: string;
  icon?: ReactNode;
};

export function OptionRow<T extends string>({
  value,
  selected,
  onSelect,
  title,
  hint,
  icon,
}: OptionProps<T>) {
  const active = value === selected;

  return (
    <button
      onClick={() => {
        haptic('select');
        onSelect(value);
      }}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors',
        active ? 'border-accent bg-accent-soft' : 'border-line bg-surface active:bg-surface-2',
      )}
    >
      {icon && <span className="shrink-0 text-xl">{icon}</span>}
      <span className="flex-1">
        <span className="block text-[16px] font-semibold">{title}</span>
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-full border-2',
          active ? 'border-accent bg-accent' : 'border-line-strong',
        )}
      >
        {active && <span className="size-1.5 rounded-full bg-on-accent" />}
      </span>
    </button>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-surface-2 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            haptic('select');
            onChange(option.value);
          }}
          className={cn(
            'flex-1 rounded-full py-2.5 text-[15px] font-semibold whitespace-nowrap transition-colors',
            option.value === value ? 'bg-accent text-on-accent' : 'text-muted active:bg-surface-3',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
