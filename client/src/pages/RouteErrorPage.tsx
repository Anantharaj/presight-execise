import { useRouteError } from 'react-router';
import { ErrorState } from '@/components/ui';

/** Last-resort boundary for unexpected render errors. */
export function RouteErrorPage() {
  const error = useRouteError();
  return (
    <ErrorState
      className="h-dvh"
      title="Something went wrong"
      message={error instanceof Error ? error.message : 'An unexpected error occurred.'}
      onRetry={() => window.location.reload()}
    />
  );
}
