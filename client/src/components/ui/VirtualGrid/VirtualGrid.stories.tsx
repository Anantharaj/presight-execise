import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useState } from 'react';
import { Spinner } from '../Spinner';
import { VirtualGrid } from './VirtualGrid';

interface DemoItem {
  id: number;
  label: string;
}

const makeItems = (from: number, count: number): DemoItem[] =>
  Array.from({ length: count }, (_, i) => ({ id: from + i, label: `Item #${from + i + 1}` }));

const renderItem = (item: DemoItem) => (
  <div className="flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm">
    {item.label}
  </div>
);

const meta = {
  title: 'UI/VirtualGrid',
  component: VirtualGrid<DemoItem>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Generic virtualized grid. Resize the viewport to see columns adapt. Only visible rows exist in the DOM.',
      },
    },
  },
  args: {
    items: makeItems(0, 10_000),
    getItemKey: (item) => item.id,
    renderItem,
    estimateRowHeight: 96,
    minColumnWidth: 220,
    gap: 16,
  },
  decorators: [(Story) => <div className="h-[500px] bg-slate-50 p-4">{Story()}</div>],
} satisfies Meta<typeof VirtualGrid<DemoItem>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TenThousandItems: Story = {};

/** Loads 50 more items (with a fake delay) whenever you approach the end. */
export const InfiniteLoading: Story = {
  render: function Render(args) {
    const [items, setItems] = useState(() => makeItems(0, 50));
    const [loading, setLoading] = useState(false);
    const hasMore = items.length < 500;

    const loadMore = useCallback(() => {
      setLoading(true);
      setTimeout(() => {
        setItems((prev) => [...prev, ...makeItems(prev.length, 50)]);
        setLoading(false);
      }, 600);
    }, []);

    return (
      <VirtualGrid
        {...args}
        items={items}
        hasMore={hasMore}
        isLoadingMore={loading}
        onLoadMore={loadMore}
        footer={
          <div className="flex justify-center py-4 text-sm text-slate-500">
            {loading ? <Spinner label="Loading more" /> : hasMore ? null : 'End of list'}
          </div>
        }
      />
    );
  },
};
