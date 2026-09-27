import type { SortField, User } from '@presight/shared';

/** Raw row returned by the user queries; `hobbies` is a JSON array string built by SQLite. */
export interface UserRow {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string;
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    avatar: row.avatar,
    first_name: row.first_name,
    last_name: row.last_name,
    age: row.age,
    nationality: row.nationality,
    hobbies: JSON.parse(row.hobbies) as string[],
  };
}

/** Whitelist mapping API sort fields to SQL columns; never interpolate user input directly. */
export const USER_SORT_COLUMNS: Record<SortField, string> = {
  first_name: 'u.first_name',
  last_name: 'u.last_name',
  age: 'u.age',
  nationality: 'u.nationality',
};
