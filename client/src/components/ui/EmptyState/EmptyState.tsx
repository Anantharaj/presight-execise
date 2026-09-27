import type { ReactNode } from 'react';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 p-10 text-center', className)}
    >
      <div className="rounded-full bg-slate-100 p-3 text-slate-500">
        {icon ?? <SearchX className="size-6" aria-hidden />}
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
