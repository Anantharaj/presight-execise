import { Button, Chip } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface ActiveFiltersProps {
  search: string;
  nationality: readonly string[];
  hobby: readonly string[];
  onClearSearch: () => void;
  onRemoveNationality: (value: string) => void;
  onRemoveHobby: (value: string) => void;
  onClearAll: () => void;
  className?: string;
}

/** Removable chips summarizing the applied filters. Renders nothing when none are active. */
export function ActiveFilters({
  search,
  nationality,
  hobby,
  onClearSearch,
  onRemoveNationality,
  onRemoveHobby,
  onClearAll,
  className,
}: ActiveFiltersProps) {
  if (!search && nationality.length === 0 && hobby.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Active filters">
      {search && (
        <Chip variant="brand" onRemove={onClearSearch} removeLabel="Clear search">
          “{search}”
        </Chip>
      )}
      {nationality.map((value) => (
        <Chip
          key={`n-${value}`}
          variant="brand"
          onRemove={() => onRemoveNationality(value)}
          removeLabel={`Remove nationality ${value}`}
        >
          {value}
        </Chip>
      ))}
      {hobby.map((value) => (
        <Chip
          key={`h-${value}`}
          variant="brand"
          onRemove={() => onRemoveHobby(value)}
          removeLabel={`Remove hobby ${value}`}
        >
          {value}
        </Chip>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
