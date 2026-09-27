import {
  API_ROUTES,
  type PaginatedResponse,
  type SortField,
  type SortOrder,
  type User,
  type UserFacets,
} from '@presight/shared';
import { httpGet } from '@/lib/http';

export interface UserFilterParams {
  search: string;
  nationality: string[];
  hobby: string[];
}

export interface UserListParams extends UserFilterParams {
  sortBy: SortField;
  sortOrder: SortOrder;
  limit: number;
  cursor?: string;
}

export function fetchUsers(params: UserListParams, signal?: AbortSignal) {
  return httpGet<PaginatedResponse<User>>(API_ROUTES.users, { ...params }, signal);
}

export function fetchUserFacets(params: UserFilterParams, signal?: AbortSignal) {
  return httpGet<UserFacets>(API_ROUTES.userFacets, { ...params }, signal);
}
