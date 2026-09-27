import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'UI/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  args: {
    value: '',
    onValueChange: fn(),
    placeholder: 'Search by first or last name…',
    debounceMs: 300,
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithValue: Story = { args: { value: 'john' } };

/** Controlled usage: the committed value appears below after the debounce. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-2">
        <SearchInput {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-slate-500">
          Committed: <code>{JSON.stringify(value)}</code>
        </p>
      </div>
    );
  },
};
