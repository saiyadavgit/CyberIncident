import React from 'react';
import { relTime } from '../../utils/format';
import type { Investigation } from '../../types/incident';

const ROWS: {key: keyof Pick<Investigation, 'findings' | 'rootCause' | 'actionsTaken' | 'recommendations'>;label: string;}[] = [
{ key: 'findings', label: 'Findings' },
{ key: 'rootCause', label: 'Root cause' },
{ key: 'actionsTaken', label: 'Actions taken' },
{ key: 'recommendations', label: 'Recommendations' }];


export function InvestigationReadout({ investigation }: {investigation: Investigation;}) {
  return (
    <div>
      <dl className="divide-y divide-line">
        {ROWS.map((r) =>
        <div key={r.key} className="grid gap-1 py-4 first:pt-0 sm:grid-cols-[160px_1fr] sm:gap-6">
            <dt className="text-xs font-medium text-muted">{r.label}</dt>
            <dd className="whitespace-pre-line text-sm leading-relaxed text-ink">
              {investigation[r.key] || <span className="text-faint">Not recorded</span>}
            </dd>
          </div>
        )}
      </dl>
      {(investigation.analyst || investigation.updatedAt) &&
      <p className="mt-2 border-t border-line pt-3 font-mono text-2xs text-faint">
          {investigation.analyst ? `Recorded by ${investigation.analyst.name}` : 'Recorded'}
          {investigation.updatedAt ? ` · ${relTime(investigation.updatedAt)}` : ''}
        </p>
      }
    </div>);

}