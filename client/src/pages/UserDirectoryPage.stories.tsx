import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { installMockApi, type MockApiOptions } from '@/mocks/mock-api';
import { UserDirectoryPage } from './UserDirectoryPage';

function PageHarness({ initialUrl }: { initialUrl: string }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [router] = useState(() =>
    createMemoryRouter([{ path: '/', element: <UserDirectoryPage /> }], {
      initialEntries: [initialUrl],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Pages/UserDirectoryPage',
  component: PageHarness,
  parameters: {
    layout: 'fullscreen',
    mockApi: {} satisfies MockApiOptions,
    docs: {
      description: {
        component:
          'The full page wired to an in-memory mock API (`src/mocks/mock-api.ts`), so it runs without the server. Uses a memory router; `initialUrl` shows how URL state restores the view.',
      },
    },
  },
  args: { initialUrl: '/' },
  beforeEach: ({ parameters }) => installMockApi(parameters.mockApi as MockApiOptions),
} satisfies Meta<typeof PageHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** State restored from the URL: search, filters and sort. */
export const RestoredFromUrl: Story = {
  args: { initialUrl: '/?q=a&hobby=Chess&nationality=British&nationality=German&sort=age&order=desc' },
};

export const SlowNetwork: Story = { parameters: { mockApi: { delayMs: 2500 } } };
export const Empty: Story = { parameters: { mockApi: { mode: 'empty' } } };
export const ServerError: Story = { parameters: { mockApi: { mode: 'error' } } };
