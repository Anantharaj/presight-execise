import type { FacetItem, SortField, SortOrder, User, UserFilters } from '@presight/shared';
import type { Database } from '../db/connection';
import { toUser, USER_SORT_COLUMNS, type UserRow } from '../models/user.model';
import { escapeLike, joinWhere, placeholders, type SqlFragment } from '../utils/sql';

export interface FindUsersPageParams {
  filters: UserFilters;
  sortBy: SortField;
  sortOrder: SortOrder;
  limit: number;
  /** Keyset position to continue after. */
  after?: { value: string | number; id: number };
}

export interface FilterOptions {
  /** Drop the nationality filter (used for disjunctive nationality facets). */
  ignoreNationality?: boolean;
}

/** Data-access contract; services depend on this, so another store can be swapped in. */
export interface UserRepository {
  findPage(params: FindUsersPageParams): User[];
  count(filters: UserFilters): number;
  hobbyFacets(filters: UserFilters, limit: number): FacetItem[];
  nationalityFacets(filters: UserFilters, limit: number): FacetItem[];
}

const USER_COLUMNS = `
  u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality,
  (
    SELECT json_group_array(name) FROM (
      SELECT h.name FROM user_hobbies uh
      JOIN hobbies h ON h.id = uh.hobby_id
      WHERE uh.user_id = u.id
      ORDER BY h.name
    )
  ) AS hobbies
`;

export class SqliteUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  findPage({ filters, sortBy, sortOrder, limit, after }: FindUsersPageParams): User[] {
    const column = USER_SORT_COLUMNS[sortBy];
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const fragments = this.filterFragments(filters);

    if (after) {
      // Row-value comparison keeps (column, id) ordering strict, so no row is repeated or skipped.
      fragments.push({
        sql: `(${column}, u.id) ${sortOrder === 'asc' ? '>' : '<'} (?, ?)`,
        params: [after.value, after.id],
      });
    }

    const where = joinWhere(fragments);
    const rows = this.db
      .prepare(
        `SELECT ${USER_COLUMNS} FROM users u ${where.sql}
         ORDER BY ${column} ${direction}, u.id ${direction}
         LIMIT ?`,
      )
      .all(...where.params, limit) as unknown as UserRow[];

    return rows.map(toUser);
  }

  count(filters: UserFilters): number {
    const where = joinWhere(this.filterFragments(filters));
    const row = this.db
      .prepare(`SELECT COUNT(*) AS total FROM users u ${where.sql}`)
      .get(...where.params) as { total: number };
    return row.total;
  }

  hobbyFacets(filters: UserFilters, limit: number): FacetItem[] {
    const where = joinWhere(this.filterFragments(filters));
    return this.db
      .prepare(
        `SELECT h.name AS value, COUNT(*) AS count
         FROM user_hobbies uh
         JOIN hobbies h ON h.id = uh.hobby_id
         WHERE uh.user_id IN (SELECT u.id FROM users u ${where.sql})
         GROUP BY h.id
         ORDER BY count DESC, value ASC
         LIMIT ?`,
      )
      .all(...where.params, limit) as unknown as FacetItem[];
  }

  nationalityFacets(filters: UserFilters, limit: number): FacetItem[] {
    const where = joinWhere(this.filterFragments(filters, { ignoreNationality: true }));
    return this.db
      .prepare(
        `SELECT u.nationality AS value, COUNT(*) AS count
         FROM users u ${where.sql}
         GROUP BY u.nationality
         ORDER BY count DESC, value ASC
         LIMIT ?`,
      )
      .all(...where.params, limit) as unknown as FacetItem[];
  }

  private filterFragments(filters: UserFilters, options: FilterOptions = {}): SqlFragment[] {
    const fragments: SqlFragment[] = [];

    if (filters.search) {
      fragments.push({
        sql: `(u.first_name || ' ' || u.last_name) LIKE ? ESCAPE '\\'`,
        params: [`%${escapeLike(filters.search)}%`],
      });
    }

    // ANY of the selected nationalities.
    if (!options.ignoreNationality && filters.nationality.length > 0) {
      fragments.push({
        sql: `u.nationality IN (${placeholders(filters.nationality.length)})`,
        params: filters.nationality,
      });
    }

    // ALL of the selected hobbies.
    if (filters.hobby.length > 0) {
      fragments.push({
        sql: `u.id IN (
          SELECT uh.user_id FROM user_hobbies uh
          JOIN hobbies h ON h.id = uh.hobby_id
          WHERE h.name IN (${placeholders(filters.hobby.length)})
          GROUP BY uh.user_id
          HAVING COUNT(*) = ?
        )`,
        params: [...filters.hobby, filters.hobby.length],
      });
    }

    return fragments;
  }
}
