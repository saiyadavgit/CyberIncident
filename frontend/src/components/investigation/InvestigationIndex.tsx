import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ScanSearchIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getAllIncidents } from '../../services/incidentService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../ui/PageHeader';
import { Segmented } from '../ui/Segmented';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { byPriority } from '../../utils/incidentStats';
import { SEVERITY_META } from '../../utils/incidentMeta';
import { incidentCode, relTime } from '../../utils/format';
import type { Incident } from '../../types/incident';

export function InvestigationIndex() {
  const { user } = useAuth();
  const { data, error, reload } = useAsync(getAllIncidents, []);
  const [scope, setScope] = useState<'all' | 'mine'>('all');

  const groups = useMemo(() => {
    const list = (data ?? []).filter((i) => scope === 'all' || i.assignee?.id === user?.id);
    return [
    { key: 'active', title: 'Active investigations', subtitle: 'Investigating or contained', items: list.filter((i) => i.status === 'INVESTIGATING' || i.status === 'CONTAINED').sort(byPriority) },
    { key: 'ready', title: 'Ready to investigate', subtitle: 'Triaged and waiting for an investigator', items: list.filter((i) => i.status === 'TRIAGED').sort(byPriority) }];

  }, [data, scope, user?.id]);

  return (
    <div>
      <PageHeader
        title="Investigations"
        description="Document findings, root cause and actions for incidents under active investigation."
        actions={
        <Segmented
          label="Scope"
          value={scope}
          onChange={setScope}
          options={[
          { value: 'all', label: 'All analysts' },
          { value: 'mine', label: 'Assigned to me' }]
          } />

        } />
      
      {error && !data ?
      <ErrorState message={error} onRetry={reload} /> :
      !data ?
      <LoadingState rows={6} /> :

      <div className="space-y-8">
          {groups.map((g) =>
        <section key={g.key} aria-labelledby={`grp-${g.key}`}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 id={`grp-${g.key}`} className="text-sm font-semibold text-ink">
                    {g.title} <span className="ml-1 font-mono text-xs text-faint">{g.items.length}</span>
                  </h2>
                  <p className="text-xs text-muted">{g.subtitle}</p>
                </div>
              </div>
              {g.items.length === 0 ?
          <div className="rounded-xl border border-line bg-surface">
                  <EmptyState icon={ScanSearchIcon} title="Nothing here" description={scope === 'mine' ? 'No incidents in this state are assigned to you.' : 'No incidents are in this state.'} />
                </div> :

          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                  {g.items.map((inc) =>
            <Row key={inc.id} incident={inc} />
            )}
                </ul>
          }
            </section>
        )}
        </div>
      }
    </div>);

}

function Row({ incident: inc }: {incident: Incident;}) {
  return (
    <li>
      <Link to={`/analyst/investigations/${inc.id}`} className="group grid items-center gap-3 px-5 py-4 transition-colors duration-150 ease-out hover:bg-raised/50 md:grid-cols-[minmax(0,1fr)_120px_150px_150px_130px_20px]">
        <div className="flex min-w-0 items-start gap-3">
          <span className={twMerge('mt-1.5 h-2 w-2 shrink-0 rounded-full', SEVERITY_META[inc.severity].bg)} aria-hidden />
          <div className="min-w-0">
            <p className="font-mono text-2xs text-faint">{incidentCode(inc.id)}</p>
            <p className="truncate text-sm font-medium text-ink">{inc.title}</p>
          </div>
        </div>
        <SeverityBadge severity={inc.severity} />
        <StatusBadge status={inc.status} />
        <span className="truncate text-sm text-muted">{inc.assignee?.name ?? <span className="font-mono text-2xs text-high">Unassigned</span>}</span>
        <span className={twMerge('font-mono text-2xs', inc.investigation ? 'text-accent' : 'text-faint')}>
          {inc.investigation ? `Documented ${relTime(inc.investigation.updatedAt)}` : 'Not documented'}
        </span>
        <ArrowRightIcon className="hidden h-4 w-4 text-faint transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-ink md:block" aria-hidden />
      </Link>
    </li>);

}