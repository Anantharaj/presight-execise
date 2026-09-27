import { SearchInput } from '@/components/ui';
import { SortControls } from '@/components/users';
import { cn } from '@/lib/cn';
import { useUserViewState } from '@/state/useUserViewState';

/** Search box and sort controls bound to the URL. */
export function UserToolbarContainer({ className }: { className?: string }) {
  const { state, setSearch, setSort } = useUserViewState();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <SearchInput
        className="flex-1"
        label="Search users by name"
        placeholder="Search by first or last name…"
        value={state.search}
        onValueChange={setSearch}
      />
      <SortControls sortBy={state.sortBy} sortOrder={state.sortOrder} onChange={setSort} />
    </div>
  );
}
