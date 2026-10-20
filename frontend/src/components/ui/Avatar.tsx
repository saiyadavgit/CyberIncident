import React from 'react';
import { twMerge } from 'tailwind-merge';
import { initials } from '../../utils/format';

export function Avatar({ name, className }: {name: string;className?: string;}) {
  return (
    <span
      aria-hidden
      className={twMerge(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line-strong bg-raised font-mono text-[10px] font-semibold text-muted',
        className
      )}>
      
      {initials(name)}
    </span>);

}