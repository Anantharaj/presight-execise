import { RefreshCw, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Inline renders a compact single row (e.g. inside a list or sidebar). */
  variant?: 'block' | 'inline';
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  variant = 'block',
  className,
}: ErrorStateProps) {
  const retry = onRetry && (
    <Button size="sm" onClick={onRetry}>
      <RefreshCw className="size-3.5" aria-hidden /> Retry
    </Button>
  );

  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700',
          className,
        )}
      >
        <span className="flex items-center gap-2">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          {message ?? title}
        </span>
        {retry}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center gap-3 p-10 text-center', className)}
    >
      <div className="rounded-full bg-red-50 p-3 text-red-600">
        <TriangleAlert className="size-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
      {retry}
    </div>
  );
}
