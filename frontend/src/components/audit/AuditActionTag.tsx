import React from 'react';
import { twMerge } from 'tailwind-merge';
import { auditCategory } from '../../utils/audit';

const TONE = {
  auth: 'text-low',
  access: 'text-crit',
  admin: 'text-high',
  incident: 'text-accent',
  evidence: 'text-muted',
  ai: 'text-muted',
  other: 'text-muted'
} as const;

export function AuditActionTag({ action, outcome }: {action: string;outcome?: string;}) {
  const failed = /FAIL|DENIED/i.test(outcome ?? '') || /FAIL|DENIED/i.test(action);
  return (
    <span className={twMerge('inline-flex min-w-0 items-center gap-2 font-mono text-2xs', failed ? 'text-crit' : TONE[auditCategory(action)])}>
      <span className={twMerge('h-1.5 w-1.5 shrink-0 rounded-full', failed ? 'bg-crit' : 'bg-current opacity-70')} aria-hidden />
      <span className="truncate">{action}</span>
    </span>);

}