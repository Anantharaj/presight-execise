import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResultSummary } from './ResultSummary';

const meta = {
  title: 'Users/ResultSummary',
  component: ResultSummary,
  tags: ['autodocs'],
  args: { total: 10000 },
} satisfies Meta<typeof ResultSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Single: Story = { args: { total: 1 } };
export const Updating: Story = { args: { isUpdating: true } };
export const Loading: Story = { args: { total: undefined } };
