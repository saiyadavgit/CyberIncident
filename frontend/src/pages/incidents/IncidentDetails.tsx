import React, { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ScanSearchIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getIncident } from '../../services/incidentService';
import { listAuditLogs } from '../../services/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Segmented } from '../../components/ui/Segmented';
import { Panel } from '../../components/ui/Panel';
import { IncidentIdentity } from '../../components/incidents/IncidentIdentity';
import { IncidentActions } from '../../components/incidents/IncidentActions';
import { EvidencePanel } from '../../components/incidents/EvidencePanel';
import { IncidentTimeline } from '../../components/incidents/IncidentTimeline';
import { InvestigationReadout } from '../../components/incidents/InvestigationReadout';
import { CopilotConsole } from '../../components/copilot/CopilotConsole';
import { isPrivileged } from '../../utils/roles';
import { buildIncidentTimeline } from '../../utils/timeline';
import type { Evidence } from '../../types/incident';
import type { AuditLog } from '../../types/admin';

type Tab = 'overview' | 'evidence' | 'investigation' | 'activity';

export function IncidentDetailsPage() {
  const { incidentId } = useParams();
  const id = Number(incidentId);
  const { user } = useAuth();
  const privileged = isPrivileged(user?.role);
  const incident = useAsync(() => getIncident(id), [id]);
  const audit = useAsync<AuditLog[]>(
    () => user?.role === 'ADMIN' ? listAuditLogs({ silent: true }).catch(() => []) : Promise.resolve([]),
    [user?.role]
  );
  const [evidence, setEvidence] = useState<Evidence[] | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const rootRef = useStaggerReveal<HTMLDivElement>(Boolean(incident.data));

  const onEvidenceLoaded = useCallback((list: Evidence[]) => setEvidence(list), []);
  const refresh = useCallback(() => {
    void incident.reload();
    void audit.reload();
  }, [incident, audit]);

  const timeline = useMemo(
    () => incident.data ? buildIncidentTimeline(incident.data, evidence ?? [], audit.data ?? []) : [],
    [incident.data, evidence, audit.data]
  );

  const back = privileged ? { to: '/analyst/queue', label: 'Incident queue' } : { to: '/employee/incidents', label: 'My incidents' };

  if (!Number.isFinite(id)) return <ErrorState title="Invalid incident" message="The incident ID in the address is not valid." />;

  if (incident.error && !incident.data) {
    return (
      <div className="space-y-6">
        <BackLink {...back} />
        <ErrorState title="Couldn't open this incident" message={incident.error} onRetry={incident.reload} />
      </div>);

  }

  if (!incident.data) {
    return (
      <div className="space-y-6">
        <BackLink {...back} />
        <LoadingState rows={6} label="Loading incident" />
      </div>);

  }

  const inc = incident.data;

  return (
    <div ref={rootRef} className="space-y-6">
      <BackLink {...back} />

      <div data-reveal>
        <IncidentIdentity incident={inc} evidenceCount={evidence?.length ?? null} />
      </div>

      {privileged &&
      <section data-reveal aria-label="Workflow" className="rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <div className="flex-1">
              <IncidentActions incident={inc} onChanged={refresh} />
            </div>
            <ButtonLink to={`/analyst/investigations/${inc.id}`} icon={ScanSearchIcon} className="w-full lg:w-auto">
              Investigation workspace
            </ButtonLink>
          </div>
        </section>
      }

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div data-reveal className="min-w-0 space-y-4">
          <div className="overflow-x-auto">
            <Segmented
              label="Incident sections"
              value={tab}
              onChange={setTab}
              options={[
              { value: 'overview', label: 'Overview' },
              { value: 'evidence', label: 'Evidence', count: evidence?.length },
              { value: 'investigation', label: 'Investigation' },
              { value: 'activity', label: 'Activity', count: timeline.length }]
              } />
            
          </div>

          <div hidden={tab !== 'overview'} className="space-y-6">
            <Panel title="Report">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{inc.description || 'No description was provided.'}</p>
            </Panel>
            <Panel title="Recent activity" action={<button type="button" onClick={() => setTab('activity')} className="text-xs text-muted hover:text-ink">View all</button>}>
              <IncidentTimeline events={timeline.slice(0, 4)} />
            </Panel>
          </div>

          <div hidden={tab !== 'evidence'}>
            <Panel title="Evidence" subtitle="Files are validated and stored server-side. Storage paths are never exposed.">
              <EvidencePanel incidentId={inc.id} onLoaded={onEvidenceLoaded} onUploaded={() => void audit.reload()} />
            </Panel>
          </div>

          <div hidden={tab !== 'investigation'}>
            <Panel
              title="Investigation record"
              action={
              privileged ?
              <Link to={`/analyst/investigations/${inc.id}`} className="text-xs text-muted hover:text-ink">
                    {inc.investigation ? 'Edit in workspace' : 'Start investigation'}
                  </Link> :
              undefined
              }>
              
              {inc.investigation ?
              <InvestigationReadout investigation={inc.investigation} /> :

              <p className="py-6 text-center text-sm text-muted">
                  {privileged ? 'No investigation has been documented yet.' : 'The security team has not published investigation notes yet.'}
                </p>
              }
            </Panel>
          </div>

          <div hidden={tab !== 'activity'}>
            <Panel title="Activity" subtitle={user?.role === 'ADMIN' ? 'Includes audit trail entries for this incident' : 'Derived from the incident record and evidence'}>
              <IncidentTimeline events={timeline} />
            </Panel>
          </div>
        </div>

        <div data-reveal className={twMerge('min-w-0 xl:sticky xl:top-20 xl:h-fit')}>
          <CopilotConsole incident={inc} evidenceCount={evidence?.length ?? null} />
        </div>
      </div>
    </div>);

}

function BackLink({ to, label }: {to: string;label: string;}) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-ink">
      <ArrowLeftIcon className="h-4 w-4" aria-hidden />
      {label}
    </Link>);

}