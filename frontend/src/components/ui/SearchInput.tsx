import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className, label = 'Search' }: SearchInputProps) {
  return (
    <div className={twMerge('relative', className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-line bg-base pl-9 pr-8 text-sm text-ink placeholder:text-faint transition-colors duration-150 ease-out focus:border-accent/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden" />
      
      {value &&
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-faint hover:text-ink">
        
          <XIcon className="h-3.5 w-3.5" />
        </button>
      }
    </div>);

}