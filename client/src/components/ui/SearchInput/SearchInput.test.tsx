import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('commits the trimmed value once after the debounce', () => {
    const onValueChange = vi.fn();
    render(<SearchInput value="" onValueChange={onValueChange} debounceMs={300} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'jo' } });
    fireEvent.change(input, { target: { value: 'john ' } });
    act(() => vi.advanceTimersByTime(299));
    expect(onValueChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('john');
  });

  it('clears immediately and syncs external value changes', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<SearchInput value="ann" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onValueChange).toHaveBeenCalledWith('');

    rerender(<SearchInput value="bob" onValueChange={onValueChange} />);
    expect(screen.getByRole('searchbox')).toHaveValue('bob');
  });
});
