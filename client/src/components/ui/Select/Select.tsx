import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  className?: string;
}

/** Styled native select: accessible and mobile-friendly by default. */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel = false,
  className,
}: SelectProps<T>) {
  const id = useId();
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label
        htmlFor={id}
        className={cn('text-sm whitespace-nowrap text-slate-600', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-10 appearance-none rounded-lg border-0 bg-white pr-8 pl-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
    </div>
  );
}
