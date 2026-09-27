import { cn } from '@/lib/cn';

export interface SkeletonProps {
  className?: string;
}

/** Placeholder block for loading content. Size it with Tailwind classes. */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-slate-200', className)} />;
}
