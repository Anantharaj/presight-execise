import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlidersHorizontal } from 'lucide-react';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Button', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'icon'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = {};
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <SlidersHorizontal className="size-4" aria-hidden /> Filters
      </>
    ),
  },
};
export const IconOnly: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Filters',
    children: <SlidersHorizontal className="size-4" aria-hidden />,
  },
};
