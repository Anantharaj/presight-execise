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
  clientLogs: '/api/client-logs',
} as const;

/** Correlation header set by nginx (or the API) and echoed on every response. */
export const REQUEST_ID_HEADER = 'x-request-id';

export const CLIENT_LOG_LEVELS = ['info', 'warn', 'error'] as const;
export type ClientLogLevel = (typeof CLIENT_LOG_LEVELS)[number];
export const MAX_CLIENT_LOG_BATCH = 10;
export const MAX_CLIENT_LOG_MESSAGE = 1000;
export const MAX_CLIENT_LOG_STACK = 4000;
