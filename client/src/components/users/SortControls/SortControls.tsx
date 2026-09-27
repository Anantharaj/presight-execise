import type { SortField, SortOrder } from '@presight/shared';
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { cn } from '@/lib/cn';
import { SORT_FIELD_OPTIONS } from './sort-options';

export interface SortControlsProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  className?: string;
}

export function SortControls({ sortBy, sortOrder, onChange, className }: SortControlsProps) {
  const ascending = sortOrder === 'asc';
  const Icon = ascending ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        label="Sort by"
        hideLabel
        value={sortBy}
        options={SORT_FIELD_OPTIONS}
        onChange={(field) => onChange(field, sortOrder)}
      />
      <Button
        size="icon"
        onClick={() => onChange(sortBy, ascending ? 'desc' : 'asc')}
        aria-label={ascending ? 'Sorted ascending, switch to descending' : 'Sorted descending, switch to ascending'}
        title={ascending ? 'Ascending' : 'Descending'}
      >
        <Icon className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
