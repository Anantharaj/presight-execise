import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, type Key, type ReactNode } from 'react';
import { useElementWidth } from '@/hooks/useElementWidth';
import { cn } from '@/lib/cn';

export interface VirtualGridProps<T> {
  items: readonly T[];
  getItemKey: (item: T) => Key;
  renderItem: (item: T, index: number) => ReactNode;
  /** Initial row height guess; real heights are measured after render. */
  estimateRowHeight: number;
  /** Columns = how many of these fit in the container width (min 1). */
  minColumnWidth?: number;
  gap?: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /** Start loading when this many rows remain below the viewport. */
  loadMoreThreshold?: number;
  /** Rendered as the final virtual row (loading indicator, error, end of list). */
  footer?: ReactNode;
  /** Scroll back to the top whenever this value changes. Pass a primitive (e.g. a serialized key). */
  resetScrollKey?: unknown;
  busy?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Responsive, virtualized grid with infinite loading. Only visible rows are mounted, so
 * it stays smooth with thousands of items. Follows the ARIA `feed` pattern.
 */
export function VirtualGrid<T>({
  items,
  getItemKey,
  renderItem,
  estimateRowHeight,
  minColumnWidth = 320,
  gap = 16,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreThreshold = 4,
  footer,
  resetScrollKey,
  busy = false,
  className,
  'aria-label': ariaLabel,
}: VirtualGridProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(scrollRef);
  const columns = Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
  const rowCount = Math.ceil(items.length / columns);
  const count = rowCount + (footer ? 1 : 0);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight + gap,
    overscan: 3,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const lastVisibleRow = virtualRows.at(-1)?.index ?? -1;

  useEffect(() => {
    if (hasMore && !isLoadingMore && lastVisibleRow >= rowCount - 1 - loadMoreThreshold) {
      onLoadMore?.();
    }
  }, [hasMore, isLoadingMore, lastVisibleRow, rowCount, loadMoreThreshold, onLoadMore]);

  useEffect(() => {
    virtualizer.scrollToOffset(0);
  }, [resetScrollKey, virtualizer]);

  return (
    <div
      ref={scrollRef}
      role="feed"
      aria-busy={busy || isLoadingMore}
      aria-label={ariaLabel}
      className={cn('h-full overflow-y-auto overscroll-contain', className)}
    >
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualRows.map((row) => {
          const isFooter = row.index >= rowCount;
          const start = row.index * columns;
          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${row.start}px)`, paddingBottom: gap }}
            >
              {isFooter ? (
                footer
              ) : (
                <div
                  className="grid"
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}
                >
                  {items.slice(start, start + columns).map((item, i) => (
                    <div key={getItemKey(item)}>{renderItem(item, start + i)}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
