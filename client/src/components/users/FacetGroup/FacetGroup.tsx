import type { FacetItem } from '@presight/shared';
import { useId } from 'react';
import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

export interface FacetGroupProps {
  title: string;
  items: readonly FacetItem[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  isLoading?: boolean;
  /** Short hint about how multiple selections combine, e.g. "Match all". */
  hint?: string;
  className?: string;
}

/**
 * Checkbox list of facet values with counts. Selected values that fall outside the
 * returned top list are still shown (without a count) so they can be unchecked.
 */
export function FacetGroup({
  title,
  items,
  selected,
  onToggle,
  isLoading = false,
  hint,
  className,
}: FacetGroupProps) {
  const headingId = useId();
  const present = new Set(items.map((i) => i.value));
  const rows: { value: string; count?: number }[] = [
    ...selected.filter((value) => !present.has(value)).map((value) => ({ value })),
    ...items,
  ];

  return (
    <section aria-labelledby={headingId} className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between">
        <h3 id={headingId} className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {title}
        </h3>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="space-y-2" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-400">No values for the current results.</p>
      ) : (
        <ul className="space-y-0.5">
          {rows.map(({ value, count }) => {
            const checked = selected.includes(value);
            return (
              <li key={value}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100',
                    checked && 'bg-brand-50 text-brand-700 hover:bg-brand-100',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(value)}
                    className="size-4 rounded border-slate-300 accent-brand-600"
                  />
                  <span className="flex-1 truncate">{value}</span>
                  {count !== undefined && (
                    <span className="text-xs text-slate-500 tabular-nums">
                      {formatNumber(count)}
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
