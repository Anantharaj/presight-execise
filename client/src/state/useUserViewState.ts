import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { SortField, SortOrder } from '@presight/shared';
import {
  DEFAULT_VIEW_STATE,
  parseViewState,
  serializeViewState,
  toggleValue,
  type UserViewState,
} from './user-view-state';

/**
 * Reads and updates the directory view state stored in the URL.
 * Filter/sort changes push history entries (Back undoes them); typing in search replaces.
 */
export function useUserViewState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseViewState(searchParams), [searchParams]);

  const update = useCallback(
    (patch: (prev: UserViewState) => Partial<UserViewState>, replace = false) => {
      setSearchParams(
        (prev) => {
          const current = parseViewState(prev);
          return serializeViewState({ ...current, ...patch(current) });
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const actions = useMemo(
    () => ({
      setSearch: (search: string) => update(() => ({ search }), true),
      setSort: (sortBy: SortField, sortOrder: SortOrder) => update(() => ({ sortBy, sortOrder })),
      toggleNationality: (value: string) =>
        update((s) => ({ nationality: toggleValue(s.nationality, value) })),
      toggleHobby: (value: string) => update((s) => ({ hobby: toggleValue(s.hobby, value) })),
      clearFilters: () =>
        update(() => ({
          search: DEFAULT_VIEW_STATE.search,
          nationality: DEFAULT_VIEW_STATE.nationality,
          hobby: DEFAULT_VIEW_STATE.hobby,
        })),
    }),
    [update],
  );

  return { state, ...actions };
}
