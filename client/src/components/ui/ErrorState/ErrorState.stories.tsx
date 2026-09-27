import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ErrorState } from './ErrorState';

const meta = {
  title: 'UI/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  args: {
    title: "Couldn't load users",
    message: 'Unable to reach the server. Check your connection.',
    onRetry: fn(),
  },
  argTypes: { variant: { control: 'inline-radio', options: ['block', 'inline'] } },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {};
export const Inline: Story = { args: { variant: 'inline', message: 'Failed to load more users' } };
export const WithoutRetry: Story = { args: { onRetry: undefined } };
