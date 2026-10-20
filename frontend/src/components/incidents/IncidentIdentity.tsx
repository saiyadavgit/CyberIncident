import React from 'react';
import { twMerge } from 'tailwind-merge';
import { LifecycleTrack } from './LifecycleTrack';
import { SEVERITY_META, STATUS_META, TYPE_META, isOpen } from '../../utils/incidentMeta';
import { fmtDateTime, fmtDuration, hoursSince, incidentCode, relTime } from '../../utils/format';
import type { Incident } from '../../types/incident';

/** The incident "identity card": who/what/how bad/where in the lifecycle. */
export function IncidentIdentity({ incident, evidenceCount, compact }: {incident: Incident;evidenceCount: number | null;compact?: boolean;}) {
  const sev = SEVERITY_META[incident.severity];
  const TypeIcon = TYPE_META[incident.type].icon;
  const open = isOpen(incident.status);

  return (
    <section aria-label="Incident summary" className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex">
        <span className={twMerge('w-1 shrink-0', open ? sev.bg : 'bg-line-strong')} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className={twMerge('flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between', compact ? 'p-5' : '')}>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <span className="text-ink">{incidentCode(incident.id)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <TypeIcon className="h-3.5 w-3.5" aria-hidden />
                  {TYPE_META[incident.type].label}
                </span>
              </p>
              <h1 className={twMerge('mt-3 font-semibold leading-tight tracking-tight text-ink', compact ? 'text-xl' : 'text-2xl md:text-[30px]')}>{incident.title}</h1>
            </div>
            <div className="flex shrink-0 items-stretch gap-6 lg:pl-6">
              <div>
                <p className="text-2xs text-faint">Severity</p>
                <div className="mt-2 flex items-end gap-1" aria-label={`Severity ${sev.label}`}>
                  {[1, 2, 3, 4].map((n) =>
                  <span key={n} className={twMerge('w-2 rounded-[2px]', n <= sev.rank ? sev.bg : 'bg-line-strong')} style={{ height: 8 + n * 5 }} />
                  )}
                </div>
                <p className={twMerge('mt-2 font-mono text-sm font-medium', sev.text)}>{sev.label}</p>
              </div>
              <div className="w-px bg-line" aria-hidden />
              <div>
                <p className="text-2xs text-faint">Status</p>
                <p className={twMerge('mt-2 text-xl font-semibold', open ? 'text-ink' : 'text-ok')}>{STATUS_META[incident.status].label}</p>
                <p className="mt-1 max-w-[180px] text-2xs text-muted">{STATUS_META[incident.status].description}</p>
              </div>
            </div>
          </div>

          {!compact &&
          <div className="border-t border-line px-6 py-5">
              <LifecycleTrack status={incident.status} />
            </div>
          }

          <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-cols-5">
            <Meta label="Reporter" value={incident.reporter?.name ?? '—'} />
            <Meta label="Owner" value={incident.assignee?.name ?? 'Unassigned'} tone={!incident.assignee && open ? 'text-high' : undefined} />
            <Meta label="Reported" value={relTime(incident.createdAt)} title={fmtDateTime(incident.createdAt)} />
            <Meta label={open ? 'Open for' : 'Last update'} value={open ? fmtDuration(hoursSince(incident.createdAt)) : relTime(incident.updatedAt ?? incident.createdAt)} />
            <Meta label="Evidence" value={evidenceCount === null ? '…' : `${evidenceCount} file${evidenceCount === 1 ? '' : 's'}`} last />
          </dl>
        </div>
      </div>
    </section>);

}

function Meta({ label, value, title, tone, last }: {label: string;value: string;title?: string;tone?: string;last?: boolean;}) {
  return (
    <div className={twMerge('border-b border-line px-6 py-3.5 lg:border-b-0', last ? '' : 'lg:border-r')}>
      <dt className="text-2xs text-faint">{label}</dt>
      <dd className={twMerge('mt-1 truncate text-sm text-ink', tone)} title={title}>
        {value}
      </dd>
    </div>);

}