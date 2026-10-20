import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: {value: T;label: string;count?: number;}[];
  label: string;
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  const groupId = React.useId();
  return (
    <div role="radiogroup" aria-label={label} className={twMerge('inline-flex rounded-md border border-line bg-base p-0.5', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={twMerge(
              'relative flex h-8 items-center gap-1.5 whitespace-nowrap rounded px-3 text-xs font-medium transition-colors duration-150 ease-out',
              active ? 'text-ink' : 'text-muted hover:text-ink'
            )}>
            
            {active &&
            <motion.span
              layoutId={`seg-${groupId}`}
              className="absolute inset-0 rounded bg-raised ring-1 ring-line-strong"
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }} />

            }
            <span className="relative">{o.label}</span>
            {o.count !== undefined && <span className="relative font-mono text-2xs text-faint tabular">{o.count}</span>}
          </button>);

      })}
    </div>);

}