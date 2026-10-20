import React from 'react';
import { twMerge } from 'tailwind-merge';

export function BrandMark({ className, withWordmark = true }: {className?: string;withWordmark?: boolean;}) {
  return (
    <span className={twMerge('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path d="M12 2.2 20.5 6v6.1c0 4.7-3.5 8.3-8.5 9.7-5-1.4-8.5-5-8.5-9.7V6L12 2.2Z" fill="none" stroke="rgb(var(--c-accent))" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7.5 12h9" stroke="rgb(var(--c-accent))" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.9" fill="rgb(var(--c-accent))" />
      </svg>
      {withWordmark &&
      <span className="leading-none">
          <span className="block text-[15px] font-semibold tracking-tight text-ink">Bastion</span>
          <span className="mt-0.5 block font-mono text-[10px] text-faint">Incident Command</span>
        </span>
      }
    </span>);

}