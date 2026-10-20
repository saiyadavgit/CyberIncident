import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowUpRightIcon } from 'lucide-react';
import { getIncident } from '../../services/incidentService';
import { useAsync } from '../../hooks/useAsync';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { Panel } from '../ui/Panel';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { IncidentIdentity } from '../incidents/IncidentIdentity';
import { LifecycleTrack } from '../incidents/LifecycleTrack';
import { IncidentActions } from '../incidents/IncidentActions';
import { InvestigationForm } from '../incidents/InvestigationForm';
import { EvidencePanel } from '../incidents/EvidencePanel';
import { IncidentTimeline } from '../incidents/IncidentTimeline';
import { CopilotConsole } from '../copilot/CopilotConsole';
import { buildIncidentTimeline } from '../../utils/timeline';
import type { Evidence } from '../../types/incident';

export function InvestigationWorkspace({ incidentId }: {incidentId: number;}) {
  const incident = useAsync(() => getIncident(incidentId), [incidentId]);
  const [evidence, setEvidence] = useState<Evidence[] | null>(null);
  const onLoaded = useCallback((l: Evidence[]) => setEvidence(l), []);
  const rootRef = useStaggerReveal<HTMLDivElement>(Boolean(incident.data));
  const timeline = useMemo(() => incident.data ? buildIncidentTimeline(incident.data, evidence ?? [], []) : [], [incident.data, evidence]);

  const back =
  <Link to="/analyst/investigations" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-ink">
      <ArrowLeftIcon className="h-4 w-4" aria-hidden />
      Investigations
    </Link>;


  if (incident.error && !incident.data) {
    return (
      <div className="space-y-6">
        {back}
        <ErrorState message={incident.error} onRetry={incident.reload} />
      </div>);

  }
  if (!incident.data) {
    return (
      <div className="space-y-6">
        {back}
        <LoadingState rows={6} />
      </div>);

  }
  const inc = incident.data;

  return (
    <div ref={rootRef} className="space-y-6">
      <div className="flex items-center justify-between">
        {back}
        <Link to={`/incidents/${inc.id}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          Incident details <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div data-reveal>
        <IncidentIdentity incident={inc} evidenceCount={evidence?.length ?? null} compact />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div data-reveal className="min-w-0 space-y-6">
          <Panel title="Investigation record" subtitle="Saved records are attached to the incident and summarised by Copilot on request.">
            <InvestigationForm incident={inc} onSaved={() => void incident.reload()} />
          </Panel>
          <Panel title="Timeline">
            <IncidentTimeline events={timeline} />
          </Panel>
        </div>

        <div data-reveal className="min-w-0 space-y-6">
          <Panel title="Workflow state">
            <LifecycleTrack status={inc.status} className="mb-6" />
            <IncidentActions incident={inc} onChanged={() => void incident.reload()} layout="stack" />
          </Panel>
          <Panel title="Evidence">
            <EvidencePanel incidentId={inc.id} onLoaded={onLoaded} />
          </Panel>
          <CopilotConsole incident={inc} evidenceCount={evidence?.length ?? null} defaultMode="summarize" />
        </div>
      </div>
    </div>);

}