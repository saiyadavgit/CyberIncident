import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { BrainCircuitIcon, ArrowUpRightIcon } from 'lucide-react';
import { getAllIncidents, getIncident, getMyIncidents } from '../services/incidentService';
import { listEvidence } from '../services/evidenceService';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { ButtonLink } from '../components/ui/ButtonLink';
import { CopilotConsole } from '../components/copilot/CopilotConsole';
import { isPrivileged } from '../utils/roles';
import { byPriority } from '../utils/incidentStats';
import { STATUS_META, isOpen } from '../utils/incidentMeta';
import { incidentCode } from '../utils/format';

export function CopilotPage() {
  const { incidentId } = useParams();
  const selectedId = incidentId ? Number(incidentId) : null;
  const navigate = useNavigate();
  const { user } = useAuth();
  const privileged = isPrivileged(user?.role);
  const [query, setQuery] = useState('');

  const list = useAsync(() => privileged ? getAllIncidents() : getMyIncidents(), [privileged]);
  const incident = useAsync(() => selectedId ? getIncident(selectedId) : Promise.resolve(null), [selectedId]);
  const evidenceCount = useAsync<number | null>(
    () => selectedId ? listEvidence(selectedId).then((l) => l.length).catch(() => null) : Promise.resolve(null),
    [selectedId]
  );

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...(list.data ?? [])].
    filter((i) => !q || `${incidentCode(i.id)} ${i.title}`.toLowerCase().includes(q)).
    sort((a, b) => Number(isOpen(b.status)) - Number(isOpen(a.status)) || byPriority(a, b));
  }, [list.data, query]);

  useEffect(() => {
    if (!selectedId && list.data && list.data.length) {
      const first = [...list.data].sort((a, b) => Number(isOpen(b.status)) - Number(isOpen(a.status)) || byPriority(a, b))[0];
      navigate(`/copilot/${first.id}`, { replace: true });
    }
  }, [selectedId, list.data, navigate]);

  return (
    <div>
      <PageHeader
        title="Copilot"
        description="Advisory threat analysis, remediation planning and investigation briefs for any incident you can access. Copilot never changes incident data." />
      
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside aria-label="Incidents" className="h-fit overflow-hidden rounded-xl border border-line bg-surface lg:sticky lg:top-20">
          <div className="border-b border-line p-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Find incident…" />
          </div>
          {list.error && !list.data ?
          <div className="p-4">
              <ErrorState message={list.error} onRetry={list.reload} />
            </div> :
          !list.data ?
          <div className="p-3">
              <LoadingState rows={5} />
            </div> :
          sorted.length === 0 ?
          <EmptyState title="No incidents" description={privileged ? 'No incidents match.' : 'Report an incident to use Copilot on it.'} /> :

          <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto">
              {sorted.map((i) => {
              const active = i.id === selectedId;
              return (
                <li key={i.id}>
                    <Link
                    to={`/copilot/${i.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={twMerge(
                      'relative block px-4 py-3 transition-colors duration-150 ease-out',
                      active ? 'bg-raised' : 'hover:bg-raised/50'
                    )}>
                    
                      {active && <span className="absolute inset-y-0 left-0 w-[2px] bg-accent" aria-hidden />}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-2xs text-faint">{incidentCode(i.id)}</span>
                        <SeverityBadge severity={i.severity} showLabel={false} />
                      </div>
                      <p className={twMerge('mt-1 line-clamp-2 text-sm leading-snug', isOpen(i.status) ? 'text-ink' : 'text-muted')}>{i.title}</p>
                      <p className="mt-1 font-mono text-2xs text-faint">{STATUS_META[i.status].label}</p>
                    </Link>
                  </li>);

            })}
            </ul>
          }
        </aside>

        <div className="min-w-0">
          {!selectedId ?
          <div className="rounded-xl border border-line bg-surface">
              <EmptyState icon={BrainCircuitIcon} title="Choose an incident" description="Select an incident to open the intelligence console." />
            </div> :
          incident.error && !incident.data ?
          <ErrorState message={incident.error} onRetry={incident.reload} /> :
          !incident.data ?
          <LoadingState rows={8} /> :

          <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-2xs text-faint">{incidentCode(incident.data.id)}</p>
                  <h2 className="mt-1 truncate text-lg font-semibold text-ink">{incident.data.title}</h2>
                </div>
                <ButtonLink to={`/incidents/${incident.data.id}`} size="sm" icon={ArrowUpRightIcon}>
                  Open incident
                </ButtonLink>
              </div>
              <CopilotConsole key={incident.data.id} incident={incident.data} evidenceCount={evidenceCount.data ?? null} variant="full" />
            </div>
          }
        </div>
      </div>
    </div>);

}