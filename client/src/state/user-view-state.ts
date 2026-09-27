import {
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
  MAX_FILTER_VALUES,
  MAX_SEARCH_LENGTH,
  SORT_FIELDS,
  SORT_ORDERS,
  type SortField,
  type SortOrder,
} from '@presight/shared';

/** Everything that defines the directory view; the URL query string is its source of truth. */
export interface UserViewState {
  search: string;
  nationality: string[];
  hobby: string[];
  sortBy: SortField;
  sortOrder: SortOrder;
}

export const DEFAULT_VIEW_STATE: UserViewState = {
  search: '',
  nationality: [],
  hobby: [],
  sortBy: DEFAULT_SORT_FIELD,
  sortOrder: DEFAULT_SORT_ORDER,
};

/** URL keys, kept short and human-readable for shareable links. */
export const URL_KEYS = {
  search: 'q',
  nationality: 'nationality',
  hobby: 'hobby',
  sortBy: 'sort',
  sortOrder: 'order',
} as const satisfies Record<keyof UserViewState, string>;

function isOneOf<T extends string>(values: readonly T[], value: string | null): value is T {
  return value !== null && (values as readonly string[]).includes(value);
}

function readList(params: URLSearchParams, key: string): string[] {
  const values = params
    .getAll(key)
    .map((v) => v.trim())
    .filter(Boolean);
  return [...new Set(values)].slice(0, MAX_FILTER_VALUES);
}

/** Lenient parse: unknown or invalid values fall back to defaults instead of erroring. */
export function parseViewState(params: URLSearchParams): UserViewState {
  const sortBy = params.get(URL_KEYS.sortBy);
  const sortOrder = params.get(URL_KEYS.sortOrder);
  return {
    search: (params.get(URL_KEYS.search) ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    nationality: readList(params, URL_KEYS.nationality),
    hobby: readList(params, URL_KEYS.hobby),
    sortBy: isOneOf(SORT_FIELDS, sortBy) ? sortBy : DEFAULT_SORT_FIELD,
    sortOrder: isOneOf(SORT_ORDERS, sortOrder) ? sortOrder : DEFAULT_SORT_ORDER,
  };
}

/** Default values are omitted to keep URLs short. */
export function serializeViewState(state: UserViewState): URLSearchParams {
  const params = new URLSearchParams();
  const search = state.search.trim();
  if (search) params.set(URL_KEYS.search, search);
  state.nationality.forEach((v) => params.append(URL_KEYS.nationality, v));
  state.hobby.forEach((v) => params.append(URL_KEYS.hobby, v));
  if (state.sortBy !== DEFAULT_SORT_FIELD) params.set(URL_KEYS.sortBy, state.sortBy);
  if (state.sortOrder !== DEFAULT_SORT_ORDER) params.set(URL_KEYS.sortOrder, state.sortOrder);
  return params;
}

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export function countActiveFilters(state: UserViewState): number {
  return state.nationality.length + state.hobby.length + (state.search ? 1 : 0);
}
