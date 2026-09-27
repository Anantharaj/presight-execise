import { describe, expect, it } from 'vitest';
import {
  DEFAULT_VIEW_STATE,
  countActiveFilters,
  parseViewState,
  serializeViewState,
  toggleValue,
} from './user-view-state';

describe('user view state <-> URL', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseViewState(new URLSearchParams())).toEqual(DEFAULT_VIEW_STATE);
  });

  it('round-trips a full state', () => {
    const state = {
      search: 'jo',
      nationality: ['French', 'American'],
      hobby: ['Chess', 'Board Games'],
      sortBy: 'age' as const,
      sortOrder: 'desc' as const,
    };
    const params = serializeViewState(state);
    expect(params.toString()).toBe(
      'q=jo&nationality=French&nationality=American&hobby=Chess&hobby=Board+Games&sort=age&order=desc',
    );
    expect(parseViewState(params)).toEqual(state);
  });

  it('omits defaults from the URL', () => {
    expect(serializeViewState(DEFAULT_VIEW_STATE).toString()).toBe('');
  });

  it('falls back to defaults for invalid sort values and dedupes lists', () => {
    const state = parseViewState(
      new URLSearchParams('sort=password&order=sideways&hobby=Chess&hobby=Chess&hobby=+'),
    );
    expect(state.sortBy).toBe('first_name');
    expect(state.sortOrder).toBe('asc');
    expect(state.hobby).toEqual(['Chess']);
  });

  it('toggles values and counts active filters', () => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b']);
    expect(countActiveFilters({ ...DEFAULT_VIEW_STATE, search: 'x', hobby: ['a', 'b'] })).toBe(3);
  });
});
