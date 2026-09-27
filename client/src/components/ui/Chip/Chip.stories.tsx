import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Chip } from './Chip';

const meta = {
  title: 'UI/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: 'Photography' },
  argTypes: { variant: { control: 'inline-radio', options: ['neutral', 'brand'] } },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Brand: Story = { args: { variant: 'brand' } };
export const Removable: Story = {
  args: { variant: 'brand', onRemove: fn(), removeLabel: 'Remove Photography filter' },
};
