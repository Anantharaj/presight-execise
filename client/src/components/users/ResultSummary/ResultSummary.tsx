import { Spinner } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

export interface ResultSummaryProps {
  total?: number;
  isUpdating?: boolean;
  className?: string;
}

/** Live region announcing the number of matching users. */
export function ResultSummary({ total, isUpdating = false, className }: ResultSummaryProps) {
  return (
    <div className={cn('flex h-6 items-center gap-2 text-sm text-slate-600', className)}>
      <p aria-live="polite" aria-atomic>
        {total === undefined ? (
          'Loading users…'
        ) : (
          <>
            <span className="font-semibold text-slate-900 tabular-nums">{formatNumber(total)}</span>{' '}
            {total === 1 ? 'user' : 'users'}
          </>
        )}
      </p>
      {isUpdating && <Spinner label="Updating results" />}
    </div>
  );
}
