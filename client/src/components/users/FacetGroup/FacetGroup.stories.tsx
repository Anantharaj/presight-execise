import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { mockHobbyFacets } from '@/mocks/users';
import { FacetGroup } from './FacetGroup';

const meta = {
  title: 'Users/FacetGroup',
  component: FacetGroup,
  tags: ['autodocs'],
  args: {
    title: 'Hobbies',
    hint: 'Match all',
    items: mockHobbyFacets,
    selected: ['Cooking'],
    onToggle: fn(),
  },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
} satisfies Meta<typeof FacetGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { items: [], selected: [], isLoading: true } };
export const Empty: Story = { args: { items: [], selected: [] } };
/** A selected value outside the top list is pinned to the top without a count. */
export const SelectedOutsideTopList: Story = { args: { selected: ['Origami'] } };

export const Interactive: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <FacetGroup
        {...args}
        selected={selected}
        onToggle={(v) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))}
      />
    );
  },
};
