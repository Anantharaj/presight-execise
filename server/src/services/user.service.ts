import {
  FACET_LIMIT,
  type PaginatedResponse,
  type User,
  type UserFacets,
  type UserFilters,
  type UserListQuery,
} from '@presight/shared';
import type { UserRepository } from '../repositories/user.repository';
import { decodeCursor, encodeCursor } from '../utils/cursor';

export class UserService {
  constructor(private readonly users: UserRepository) {}

  listUsers(query: UserListQuery): PaginatedResponse<User> {
    const { sortBy, sortOrder, limit, cursor, ...filters } = query;
    const after = cursor ? decodeCursor(cursor, sortBy, sortOrder) : undefined;

    // Fetch one extra row to know whether another page exists without a second query.
    const rows = this.users.findPage({ filters, sortBy, sortOrder, limit: limit + 1, after });
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const last = data.at(-1);

    return {
      data,
      pageInfo: {
        hasMore,
        nextCursor:
          hasMore && last
            ? encodeCursor({ sortBy, sortOrder, value: last[sortBy], id: last.id })
            : null,
        total: this.users.count(filters),
      },
    };
  }

  /**
   * Top hobbies apply every active filter. Top nationalities apply search + hobbies but not the
   * nationality filter itself, so other nationalities remain selectable (OR semantics).
   */
  getFacets(filters: UserFilters): UserFacets {
    return {
      hobbies: this.users.hobbyFacets(filters, FACET_LIMIT),
      nationalities: this.users.nationalityFacets(filters, FACET_LIMIT),
    };
  }
}
