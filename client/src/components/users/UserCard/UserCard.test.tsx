import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockUsers } from '@/mocks/users';
import { UserCard } from './UserCard';
import { summarizeHobbies } from './user-card.utils';

describe('summarizeHobbies', () => {
  it.each([
    [[], [], 0],
    [['a'], ['a'], 0],
    [['a', 'b'], ['a', 'b'], 0],
    [['a', 'b', 'c', 'd'], ['a', 'b'], 2],
  ])('%j -> visible %j, +%i', (hobbies, visible, remaining) => {
    expect(summarizeHobbies(hobbies)).toEqual({ visible, remaining });
  });
});

describe('UserCard', () => {
  it('shows name, nationality, age, two hobbies and +n', () => {
    render(<UserCard user={mockUsers[0]!} />);
    const card = screen.getByRole('article', { name: 'Ada Lovelace' });
    expect(within(card).getByRole('heading')).toHaveTextContent('Ada Lovelace');
    expect(card).toHaveTextContent('British');
    expect(card).toHaveTextContent('36');

    const hobbies = within(card).getByRole('list', { name: 'Hobbies' });
    expect(within(hobbies).getAllByRole('listitem')).toHaveLength(3);
    expect(hobbies).toHaveTextContent('Chess');
    expect(hobbies).toHaveTextContent('Music');
    expect(hobbies).toHaveTextContent('+3');
    expect(hobbies).not.toHaveTextContent('Reading');
  });

  it('omits +n when there are two or fewer hobbies', () => {
    render(<UserCard user={mockUsers[1]!} />);
    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument();
  });

  it('handles users without hobbies', () => {
    render(<UserCard user={mockUsers[3]!} />);
    expect(screen.getByText('No hobbies')).toBeInTheDocument();
  });
});
