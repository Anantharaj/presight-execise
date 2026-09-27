import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '@presight/shared';
import { fetchUserFacets, fetchUsers, type UserFilterParams } from '@/api/users.api';
import type { UserViewState } from '@/state/user-view-state';

/** Hierarchical keys so related queries can be invalidated together (e.g. `userKeys.all`). */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (state: UserViewState) => [...userKeys.lists(), state] as const,
  facets: (filters: UserFilterParams) => [...userKeys.all, 'facets', filters] as const,
};

export function useUsersInfiniteQuery(state: UserViewState, pageSize = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: userKeys.list(state),
    queryFn: ({ pageParam, signal }) =>
      fetchUsers({ ...state, limit: pageSize, cursor: pageParam }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor ?? undefined,
    // Keep showing the previous result set while a new filter combination loads.
    placeholderData: keepPreviousData,
  });
}

/** Sorting does not affect counts, so only filters are part of the key. */
export function useUserFacetsQuery({ search, nationality, hobby }: UserFilterParams) {
  const filters = { search, nationality, hobby };
  return useQuery({
    queryKey: userKeys.facets(filters),
    queryFn: ({ signal }) => fetchUserFacets(filters, signal),
    placeholderData: keepPreviousData,
  });
}
