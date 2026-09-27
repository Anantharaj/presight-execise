import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { SortField, SortOrder } from '@presight/shared';
import { fn } from 'storybook/test';
import { SortControls } from './SortControls';

const meta = {
  title: 'Users/SortControls',
  component: SortControls,
  tags: ['autodocs'],
  args: { sortBy: 'first_name', sortOrder: 'asc', onChange: fn() },
} satisfies Meta<typeof SortControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ascending: Story = {};
export const Descending: Story = { args: { sortBy: 'age', sortOrder: 'desc' } };
export const Interactive: Story = {
  render: function Render() {
    const [sort, setSort] = useState<{ sortBy: SortField; sortOrder: SortOrder }>({
      sortBy: 'first_name',
      sortOrder: 'asc',
    });
    return (
      <div className="space-y-2">
        <SortControls {...sort} onChange={(sortBy, sortOrder) => setSort({ sortBy, sortOrder })} />
        <code className="text-sm text-slate-500">{JSON.stringify(sort)}</code>
      </div>
    );
  },
};
