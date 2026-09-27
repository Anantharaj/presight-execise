import { SlidersHorizontal, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Button, Drawer } from '@/components/ui';
import {
  ActiveFiltersContainer,
  FilterSidebarContainer,
  UserListContainer,
  UserToolbarContainer,
} from '@/containers';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUserViewState } from '@/state/useUserViewState';

/** Page layout only: composes containers into a responsive shell. */
export function UserDirectoryPage() {
  const { state } = useUserViewState();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selectedCount = state.nationality.length + state.hobby.length;

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <UsersRound className="size-6 text-brand-600" aria-hidden />
            Presight Directory
          </h1>
          <UserToolbarContainer className="order-last w-full md:order-none md:ml-auto md:max-w-2xl md:flex-1" />
          {!isDesktop && (
            <Button className="ml-auto md:ml-0" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters
              {selectedCount > 0 && (
                <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white tabular-nums">
                  {selectedCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1">
        {isDesktop && (
          <aside
            aria-label="Filters"
            className="w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white"
          >
            <FilterSidebarContainer />
          </aside>
        )}
        <main className="flex min-w-0 flex-1 flex-col gap-3 pt-4">
          <ActiveFiltersContainer className="px-4" />
          <UserListContainer className="min-h-0 flex-1" />
        </main>
      </div>

      {!isDesktop && (
        <Drawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="Filters"
          footer={
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => setFiltersOpen(false)}
            >
              Show results
            </Button>
          }
        >
          <FilterSidebarContainer />
        </Drawer>
      )}
    </div>
  );
}
