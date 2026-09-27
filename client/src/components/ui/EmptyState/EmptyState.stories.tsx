import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No users found',
    description: 'Try a different search or remove some filters.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: { action: <Button variant="primary">Clear filters</Button> },
};
