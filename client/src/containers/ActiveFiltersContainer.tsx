import { ActiveFilters } from '@/components/users';
import { useUserViewState } from '@/state/useUserViewState';

export function ActiveFiltersContainer({ className }: { className?: string }) {
  const { state, setSearch, toggleHobby, toggleNationality, clearFilters } = useUserViewState();

  return (
    <ActiveFilters
      className={className}
      search={state.search}
      nationality={state.nationality}
      hobby={state.hobby}
      onClearSearch={() => setSearch('')}
      onRemoveNationality={toggleNationality}
      onRemoveHobby={toggleHobby}
      onClearAll={clearFilters}
    />
  );
}
