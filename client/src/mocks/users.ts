import type { FacetItem, User } from '@presight/shared';

/** Deterministic fixtures for stories and tests. */
export const mockUsers: User[] = [
  {
    id: 1,
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Ada',
    first_name: 'Ada',
    last_name: 'Lovelace',
    age: 36,
    nationality: 'British',
    hobbies: ['Chess', 'Music', 'Reading', 'Writing', 'Astronomy'],
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Grace',
    first_name: 'Grace',
    last_name: 'Hopper',
    age: 85,
    nationality: 'American',
    hobbies: ['Sailing', 'Reading'],
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Alan',
    first_name: 'Alan',
    last_name: 'Turing',
    age: 41,
    nationality: 'British',
    hobbies: ['Running'],
  },
  {
    id: 4,
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Katherine',
    first_name: 'Katherine',
    last_name: 'Johnson-Goble-Moore',
    age: 101,
    nationality: 'American',
    hobbies: [],
  },
];

export function makeMockUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const base = mockUsers[i % mockUsers.length]!;
    return { ...base, id: i + 1, first_name: `${base.first_name} ${i + 1}` };
  });
}

export const mockHobbyFacets: FacetItem[] = [
  { value: 'Reading', count: 2412 },
  { value: 'Traveling', count: 2301 },
  { value: 'Cooking', count: 2188 },
  { value: 'Photography', count: 2090 },
  { value: 'Hiking', count: 1975 },
  { value: 'Gaming', count: 1850 },
  { value: 'Music', count: 1766 },
  { value: 'Running', count: 1644 },
];

export const mockNationalityFacets: FacetItem[] = [
  { value: 'American', count: 640 },
  { value: 'British', count: 618 },
  { value: 'Indian', count: 597 },
  { value: 'German', count: 571 },
  { value: 'French', count: 549 },
  { value: 'Canadian', count: 530 },
];
