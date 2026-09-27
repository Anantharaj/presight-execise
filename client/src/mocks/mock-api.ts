import {
  API_ROUTES,
  FACET_LIMIT,
  type FacetItem,
  type PaginatedResponse,
  type User,
  type UserFacets,
} from '@presight/shared';

export interface MockApiOptions {
  mode?: 'ok' | 'empty' | 'error';
  delayMs?: number;
  userCount?: number;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Linus', 'Margaret', 'Tim', 'Barbara', 'Dennis', 'Radia', 'Ken'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Torvalds', 'Hamilton', 'Berners-Lee', 'Liskov', 'Ritchie', 'Perlman', 'Thompson'];
const NATIONALITIES = ['American', 'British', 'Indian', 'German', 'French', 'Canadian', 'Emirati', 'Japanese'];
const HOBBIES = ['Reading', 'Chess', 'Hiking', 'Cooking', 'Music', 'Gaming', 'Yoga', 'Running', 'Painting', 'Travel', 'Photography', 'Cycling'];

/** Deterministic pseudo-random users, so stories look the same on every load. */
export function generateMockUsers(count: number): User[] {
  let seed = 42;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]!;

  return Array.from({ length: count }, (_, i) => {
    const first_name = pick(FIRST);
    const last_name = pick(LAST);
    const hobbies = [...new Set(Array.from({ length: Math.floor(rand() * 11) }, () => pick(HOBBIES)))];
    return {
      id: i + 1,
      first_name,
      last_name,
      avatar: `https://api.dicebear.com/9.x/personas/svg?seed=${first_name}-${last_name}-${i}`,
      age: 18 + Math.floor(rand() * 60),
      nationality: pick(NATIONALITIES),
      hobbies: hobbies.sort(),
    };
  });
}

function topCounts(values: string[]): FacetItem[] {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, FACET_LIMIT);
}

function wait(ms: number, signal?: AbortSignal | null) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/**
 * Replaces `fetch` with an in-memory implementation of the users API (same filter semantics
 * as the server, offset-based cursor). Returns a function that restores the original fetch.
 */
export function installMockApi({ mode = 'ok', delayMs = 400, userCount = 1000 }: MockApiOptions = {}) {
  const original = globalThis.fetch;
  const all = mode === 'empty' ? [] : generateMockUsers(userCount);

  globalThis.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input), window.location.origin);
    if (!url.pathname.startsWith('/api/')) return original(input, init);

    await wait(delayMs, init?.signal);
    if (mode === 'error') {
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message: 'The mock server is configured to fail.' } },
        { status: 500 },
      );
    }

    const p = url.searchParams;
    const search = (p.get('search') ?? '').toLowerCase();
    const nationality = p.getAll('nationality');
    const hobby = p.getAll('hobby');
    const bySearchAndHobby = all.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search) &&
        hobby.every((h) => u.hobbies.includes(h)),
    );
    const filtered = bySearchAndHobby.filter(
      (u) => nationality.length === 0 || nationality.includes(u.nationality),
    );

    if (url.pathname === API_ROUTES.userFacets) {
      const body: UserFacets = {
        hobbies: topCounts(filtered.flatMap((u) => u.hobbies)),
        nationalities: topCounts(bySearchAndHobby.map((u) => u.nationality)),
      };
      return Response.json(body);
    }

    const sortBy = (p.get('sortBy') ?? 'first_name') as keyof User;
    const dir = p.get('sortOrder') === 'desc' ? -1 : 1;
    const limit = Number(p.get('limit') ?? 30);
    const offset = Number(p.get('cursor') ?? 0);
    const sorted = [...filtered].sort(
      (a, b) => dir * (String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, { numeric: true }) || a.id - b.id),
    );
    const data = sorted.slice(offset, offset + limit);
    const hasMore = offset + limit < sorted.length;
    const body: PaginatedResponse<User> = {
      data,
      pageInfo: { hasMore, nextCursor: hasMore ? String(offset + limit) : null, total: sorted.length },
    };
    return Response.json(body);
  };

  return () => {
    globalThis.fetch = original;
  };
}
