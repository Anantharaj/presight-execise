import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockUsers } from '@/mocks/users';
import { UserCard, UserCardSkeleton } from './UserCard';

const meta = {
  title: 'Users/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  args: { user: mockUsers[0]! },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** More than two hobbies: the rest collapse into `+n`. */
export const ManyHobbies: Story = {};
export const TwoHobbies: Story = { args: { user: mockUsers[1]! } };
export const OneHobby: Story = { args: { user: mockUsers[2]! } };
export const NoHobbiesLongName: Story = { args: { user: mockUsers[3]! } };
export const BrokenAvatar: Story = {
  args: { user: { ...mockUsers[0]!, avatar: 'https://invalid.example/x.png' } },
};
export const Loading: Story = { render: () => <UserCardSkeleton /> };
