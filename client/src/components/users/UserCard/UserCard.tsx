import type { User } from '@presight/shared';
import { Avatar, Chip, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { summarizeHobbies } from './user-card.utils';

export const USER_CARD_HEIGHT = 124;

export interface UserCardProps {
  user: User;
  /** Maximum hobbies shown before collapsing the rest into `+n`. */
  maxHobbies?: number;
  className?: string;
}

/**
 * ```
 * | avatar      first_name last_name |
 * |             nationality      age |
 * |             (hobby) (hobby) (+n) |
 * ```
 */
export function UserCard({ user, maxHobbies = 2, className }: UserCardProps) {
  const fullName = `${user.first_name} ${user.last_name}`;
  const { visible, remaining } = summarizeHobbies(user.hobbies, maxHobbies);

  return (
    <article
      aria-label={fullName}
      className={cn(
        'flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
      style={{ minHeight: USER_CARD_HEIGHT }}
    >
      <Avatar src={user.avatar} name={fullName} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-base font-semibold text-slate-900" title={fullName}>
          {fullName}
        </h3>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-sm text-slate-500">
          <span className="truncate">{user.nationality}</span>
          <span className="shrink-0 tabular-nums">
            <span className="sr-only">Age </span>
            {user.age}
          </span>
        </div>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-3" aria-label="Hobbies">
          {visible.map((hobby) => (
            <li key={hobby}>
              <Chip>{hobby}</Chip>
            </li>
          ))}
          {remaining > 0 && (
            <li>
              <Chip variant="brand" className="tabular-nums">
                <span aria-hidden>+{remaining}</span>
                <span className="sr-only">
                  and {remaining} more {remaining === 1 ? 'hobby' : 'hobbies'}
                </span>
              </Chip>
            </li>
          )}
          {user.hobbies.length === 0 && <li className="text-xs text-slate-400">No hobbies</li>}
        </ul>
      </div>
    </article>
  );
}

export function UserCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('flex gap-4 rounded-xl border border-slate-200 bg-white p-4', className)}
      style={{ minHeight: USER_CARD_HEIGHT }}
    >
      <Skeleton className="size-16 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-auto flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
