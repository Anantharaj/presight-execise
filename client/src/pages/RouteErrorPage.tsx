import { useEffect } from 'react';
import { useRouteError } from 'react-router';
import { ErrorState } from '@/components/ui';
import { logger } from '@/lib/logger';

/** Last-resort boundary for unexpected render errors. */
export function RouteErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    logger.error('Route render error', { error });
  }, [error]);

  return (
    <ErrorState
      className="h-dvh"
      title="Something went wrong"
      message={error instanceof Error ? error.message : 'An unexpected error occurred.'}
      onRetry={() => window.location.reload()}
    />
  );
}
