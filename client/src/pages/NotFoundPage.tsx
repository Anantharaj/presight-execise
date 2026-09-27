import { Link } from 'react-router';
import { EmptyState } from '@/components/ui';

export function NotFoundPage() {
  return (
    <EmptyState
      className="h-dvh"
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Link to="/" className="text-sm font-medium text-brand-600 hover:underline">
          Go to the directory
        </Link>
      }
    />
  );
}
