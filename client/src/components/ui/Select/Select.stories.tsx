import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Select } from './Select';

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    label: 'Sort by',
    value: 'first_name',
    onChange: fn(),
    options: [
      { value: 'first_name', label: 'First name' },
      { value: 'last_name', label: 'Last name' },
      { value: 'age', label: 'Age' },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HiddenLabel: Story = { args: { hideLabel: true } };
