import { z } from 'zod';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
  MAX_FILTER_VALUES,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  SORT_FIELDS,
  SORT_ORDERS,
} from '../constants';

/** Accepts `?k=a&k=b` (array) or `?k=a` (string); trims, drops empties and de-duplicates. */
const stringList = z
  .preprocess(
    (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]),
    z.array(z.string().trim().max(100)).max(MAX_FILTER_VALUES),
  )
  .transform((values) => [...new Set(values.filter(Boolean))]);

/** Filters shared by the user list and the facets endpoints. */
export const userFiltersSchema = z.object({
  search: z.string().trim().max(MAX_SEARCH_LENGTH).default(''),
  nationality: stringList,
  hobby: stringList,
});

export const userSortSchema = z.object({
  sortBy: z.enum(SORT_FIELDS).default(DEFAULT_SORT_FIELD),
  sortOrder: z.enum(SORT_ORDERS).default(DEFAULT_SORT_ORDER),
});

export const userListQuerySchema = userFiltersSchema.extend(userSortSchema.shape).extend({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  cursor: z.string().max(512).optional(),
});

export type UserFilters = z.infer<typeof userFiltersSchema>;
export type UserSort = z.infer<typeof userSortSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UserListQueryInput = z.input<typeof userListQuerySchema>;
