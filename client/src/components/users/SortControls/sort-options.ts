import type { SortField } from '@presight/shared';
import type { SelectOption } from '@/components/ui';

export const SORT_FIELD_OPTIONS: readonly SelectOption<SortField>[] = [
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'age', label: 'Age' },
  { value: 'nationality', label: 'Nationality' },
];
