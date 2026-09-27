import { useCallback, useMemo, type ReactNode } from 'react';
import { Button, EmptyState, ErrorState, Spinner, VirtualGrid } from '@/components/ui';
import { ResultSummary, USER_CARD_HEIGHT, UserCard, UserCardSkeleton } from '@/components/users';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { useUsersInfiniteQuery } from '@/queries/users.queries';
import { countActiveFilters } from '@/state/user-view-state';
import { useUserViewState } from '@/state/useUserViewState';

const MIN_CARD_WIDTH = 300;
const GAP = 16;

/** Connects the URL view state to the paginated users query and renders the virtual list. */
export function UserListContainer({ className }: { className?: string }) {
  const { state, clearFilters } = useUserViewState();
  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useUsersInfiniteQuery(state);

  const users = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const total = data?.pages[0]?.pageInfo.total;
  const loadMore = useCallback(() => void fetchNextPage(), [fetchNextPage]);
  const resetScrollKey = useMemo(() => JSON.stringify(state), [state]);

  let content: ReactNode;
  if (isPending) {
    content = (
      <div
        className="grid gap-4 overflow-hidden px-4"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_CARD_WIDTH}px, 1fr))` }}
        aria-hidden
      >
        {Array.from({ length: 9 }, (_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  } else if (isError && !isFetchNextPageError) {
    content = (
      <ErrorState
        title="Couldn't load users"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  } else if (users.length === 0) {
    content = (
      <EmptyState
        title="No users found"
        description="No one matches the current search and filters. Try removing some filters."
        action={
          countActiveFilters(state) > 0 && (
            <Button variant="primary" onClick={clearFilters}>
              Clear filters
            </Button>
          )
        }
      />
    );
  } else {
    const footer = isFetchNextPageError ? (
      <ErrorState variant="inline" message="Couldn't load more users." onRetry={loadMore} />
    ) : isFetchingNextPage ? (
      <div className="flex justify-center py-4">
        <Spinner label="Loading more users" />
      </div>
    ) : !hasNextPage ? (
      <p className="py-4 text-center text-sm text-slate-400">
        You’ve reached the end · {formatNumber(users.length)} users
      </p>
    ) : null;

    content = (
      <VirtualGrid
        aria-label="User results"
        items={users}
        getItemKey={(user) => user.id}
        renderItem={(user) => <UserCard user={user} />}
        estimateRowHeight={USER_CARD_HEIGHT}
        minColumnWidth={MIN_CARD_WIDTH}
        gap={GAP}
        // Don't page the stale result set, and don't auto-retry a failed page in a loop.
        hasMore={hasNextPage && !isPlaceholderData && !isFetchNextPageError}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={loadMore}
        footer={footer}
        resetScrollKey={resetScrollKey}
        busy={isPlaceholderData}
        className={cn('px-4 transition-opacity', isPlaceholderData && 'opacity-60')}
      />
    );
  }

  return (
    <section aria-label="Users" className={cn('flex flex-col gap-3', className)}>
      <ResultSummary
        className="px-4"
        total={isPlaceholderData ? undefined : total}
        isUpdating={isFetching && !isFetchingNextPage && !isPending}
      />
      <div className="min-h-0 flex-1">{content}</div>
    </section>
  );
}
