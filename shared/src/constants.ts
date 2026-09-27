export const SORT_FIELDS = ['first_name', 'last_name', 'age', 'nationality'] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_SORT_FIELD: SortField = 'first_name';
export const DEFAULT_SORT_ORDER: SortOrder = 'asc';

export const DEFAULT_PAGE_SIZE = 30;
export const MAX_PAGE_SIZE = 100;
export const FACET_LIMIT = 20;
export const MAX_SEARCH_LENGTH = 100;
export const MAX_FILTER_VALUES = 50;

export const API_ROUTES = {
  health: '/api/health',
  users: '/api/users',
  userFacets: '/api/users/facets',
} as const;
