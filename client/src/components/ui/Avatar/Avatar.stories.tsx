import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    name: 'Ada Lovelace',
    src: 'https://api.dicebear.com/9.x/personas/svg?seed=Ada',
    size: 'md',
  },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { size: 'lg' } };
export const Small: Story = { args: { size: 'sm' } };
/** Shown when there is no `src` or the image fails to load. */
export const InitialsFallback: Story = { args: { src: 'https://invalid.example/broken.png' } };
