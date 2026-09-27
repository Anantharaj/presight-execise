export interface PageInfo {
  /** Opaque keyset cursor for the next page; `null` when there are no more results. */
  nextCursor: string | null;
  hasMore: boolean;
  /** Total number of users matching the current filters. */
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: PageInfo;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface HealthResponse {
  status: 'ok';
  uptime: number;
}
