import React from 'react';
import { twMerge } from 'tailwind-merge';
import { SEVERITY_META } from '../../utils/incidentMeta';
import type { Severity } from '../../types/incident';

interface SeverityBadgeProps {
  severity: Severity;
  showLabel?: boolean;
  className?: string;
}

/** Four ascending bars filled to the severity rank — readable without relying on color alone. */
export function SeverityBadge({ severity, showLabel = true, className }: SeverityBadgeProps) {
  const meta = SEVERITY_META[severity];
  return (
    <span className={twMerge('inline-flex items-center gap-2', className)} aria-label={`Severity ${meta.label}`}>
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[1, 2, 3, 4].map((n) =>
        <span
          key={n}
          className={twMerge('w-[3px] rounded-[1px]', n <= meta.rank ? meta.bg : 'bg-line-strong')}
          style={{ height: `${4 + n * 2}px` }} />

        )}
      </span>
      {showLabel && <span className={twMerge('font-mono text-2xs font-medium uppercase tracking-wide', meta.text)}>{meta.label}</span>}
    </span>);

}