import { createBrowserRouter } from 'react-router';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import { UserDirectoryPage } from '@/pages/UserDirectoryPage';

/** Add new pages here. */
export const router = createBrowserRouter([
  { path: '/', element: <UserDirectoryPage />, errorElement: <RouteErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
