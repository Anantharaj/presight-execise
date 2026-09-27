import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
} as const;

export interface ChipProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  /** Renders a remove button; `removeLabel` is its accessible name. */
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

/** Compact label for tags (e.g. hobbies) and removable active filters. */
export function Chip({ children, variant = 'neutral', onRemove, removeLabel, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        onRemove && 'pr-1',
        className,
      )}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? 'Remove'}
          className="rounded-full p-0.5 hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  );
}
