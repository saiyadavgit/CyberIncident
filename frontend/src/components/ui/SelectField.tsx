import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SelectFieldProps {
  value: string;
  onChange: (v: string) => void;
  options: {value: string;label: string;disabled?: boolean;}[];
  label: string;
  hideLabel?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SelectField({ value, onChange, options, label, hideLabel = true, className, disabled }: SelectFieldProps) {
  const id = React.useId();
  return (
    <div className={twMerge('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-xs font-medium text-muted'}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-md border border-line bg-base pl-3 pr-8 text-sm text-ink transition-colors duration-150 ease-out focus:border-accent/60 focus:outline-none disabled:opacity-50">
          
          {options.map((o) =>
          <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          )}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
      </div>
    </div>);

}