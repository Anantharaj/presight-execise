import { Search, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/cn';

export interface SearchInputProps {
  /** Committed value (e.g. from the URL). External changes reset the draft. */
  value: string;
  /** Called with the draft after the user stops typing for `debounceMs`, or immediately on clear. */
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/** Text input with a local draft, debounced commit and a clear button. */
export function SearchInput({
  value,
  onValueChange,
  label = 'Search',
  placeholder = 'Search…',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);

  // Sync the draft when the committed value changes externally (e.g. browser Back).
  if (value !== committed) {
    setCommitted(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft.trim() === value.trim()) return;
    const timer = setTimeout(() => onValueChange(draft.trim()), debounceMs);
    return () => clearTimeout(timer);
  }, [draft, value, debounceMs, onValueChange]);

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => setDraft(e.target.value)}
        className={cn(
          'h-10 w-full rounded-lg border-0 bg-white pr-9 pl-9 text-sm text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset',
          'placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft('');
            onValueChange('');
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
