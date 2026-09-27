import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ActiveFilters } from './ActiveFilters';

const meta = {
  title: 'Users/ActiveFilters',
  component: ActiveFilters,
  tags: ['autodocs'],
  args: {
    search: 'jo',
    nationality: ['American', 'French'],
    hobby: ['Chess'],
    onClearSearch: fn(),
    onRemoveNationality: fn(),
    onRemoveHobby: fn(),
    onClearAll: fn(),
  },
} satisfies Meta<typeof ActiveFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OnlyHobbies: Story = { args: { search: '', nationality: [], hobby: ['Chess', 'Hiking'] } };
/** Renders nothing when no filters are active. */
export const None: Story = { args: { search: '', nationality: [], hobby: [] } };
