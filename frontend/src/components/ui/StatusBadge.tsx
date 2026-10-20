import React from 'react';
import { twMerge } from 'tailwind-merge';
import { LIFECYCLE, STATUS_META, isOpen } from '../../utils/incidentMeta';
import type { IncidentStatus } from '../../types/incident';

interface StatusBadgeProps {
  status: IncidentStatus;
  showTrack?: boolean;
  className?: string;
}

export function StatusBadge({ status, showTrack = true, className }: StatusBadgeProps) {
  const step = LIFECYCLE.indexOf(status);
  const open = isOpen(status);
  const tone = status === 'REPORTED' ? 'text-ink' : open ? 'text-accent' : 'text-ok';
  const fill = status === 'REPORTED' ? 'bg-ink' : open ? 'bg-accent' : 'bg-ok/70';
  return (
    <span className={twMerge('inline-flex items-center gap-2', className)}>
      {showTrack &&
      <span className="flex gap-[2px]" aria-hidden>
          {LIFECYCLE.map((s, i) =>
        <span key={s} className={twMerge('h-[3px] w-2 rounded-full', i <= step ? fill : 'bg-line-strong')} />
        )}
        </span>
      }
      <span className={twMerge('font-mono text-2xs font-medium uppercase tracking-wide', tone)}>{STATUS_META[status].label}</span>
    </span>);

}