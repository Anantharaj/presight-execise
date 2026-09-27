import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FacetGroup } from './FacetGroup';

const items = [
  { value: 'Chess', count: 1200 },
  { value: 'Hiking', count: 30 },
];

describe('FacetGroup', () => {
  it('renders values with formatted counts and reflects selection', () => {
    render(<FacetGroup title="Hobbies" items={items} selected={['Hiking']} onToggle={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: /Chess/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Hiking/ })).toBeChecked();
    expect(screen.getByText((1200).toLocaleString())).toBeInTheDocument();
  });

  it('calls onToggle with the value', () => {
    const onToggle = vi.fn();
    render(<FacetGroup title="Hobbies" items={items} selected={[]} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Chess/ }));
    expect(onToggle).toHaveBeenCalledWith('Chess');
  });

  it('keeps selected values that are not in the top list', () => {
    render(<FacetGroup title="Hobbies" items={items} selected={['Origami']} onToggle={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Origami' })).toBeChecked();
  });
});
