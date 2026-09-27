import { QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/http';
import { logger } from '@/lib/logger';

export const queryClient = new QueryClient({
  // One central place to report failed requests; components only render error states.
  queryCache: new QueryCache({
    onError: (error, query) => {
      const apiError = error instanceof ApiError ? error : undefined;
      const serverSide = !apiError || apiError.status === 0 || apiError.status >= 500;
      logger[serverSide ? 'error' : 'warn']('API request failed', {
        error,
        requestId: apiError?.requestId,
        // Only the key prefix (e.g. "users.list"): the rest can hold user-typed search text.
        context: {
          query: query.queryKey.slice(0, 2).join('.'),
          status: apiError?.status ?? null,
          code: apiError?.code ?? null,
        },
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Client errors (4xx) will not succeed on retry.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < 2,
    },
  },
});
