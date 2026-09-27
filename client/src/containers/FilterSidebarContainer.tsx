import { ErrorState } from '@/components/ui';
import { FacetGroup } from '@/components/users';
import { cn } from '@/lib/cn';
import { useUserFacetsQuery } from '@/queries/users.queries';
import { useUserViewState } from '@/state/useUserViewState';

/** Top-20 hobby and nationality facets for the current result set. */
export function FilterSidebarContainer({ className }: { className?: string }) {
  const { state, toggleHobby, toggleNationality } = useUserViewState();
  const { data, isPending, isError, isPlaceholderData, refetch } = useUserFacetsQuery(state);

  return (
    <div
      className={cn('space-y-6 p-4 transition-opacity', isPlaceholderData && 'opacity-60', className)}
      aria-busy={isPending || isPlaceholderData}
    >
      {isError && (
        <ErrorState variant="inline" message="Couldn't load filters." onRetry={() => void refetch()} />
      )}
      <FacetGroup
        title="Nationalities"
        hint="Match any"
        items={data?.nationalities ?? []}
        selected={state.nationality}
        onToggle={toggleNationality}
        isLoading={isPending}
      />
      <FacetGroup
        title="Hobbies"
        hint="Match all"
        items={data?.hobbies ?? []}
        selected={state.hobby}
        onToggle={toggleHobby}
        isLoading={isPending}
      />
    </div>
  );
}
