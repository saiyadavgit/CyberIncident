import React from 'react';
import { useParams } from 'react-router-dom';
import { InvestigationIndex } from '../../components/investigation/InvestigationIndex';
import { InvestigationWorkspace } from '../../components/investigation/InvestigationWorkspace';
import { ErrorState } from '../../components/ui/ErrorState';

export function InvestigationPage() {
  const { incidentId } = useParams();
  if (!incidentId) return <InvestigationIndex />;
  const id = Number(incidentId);
  if (!Number.isFinite(id)) return <ErrorState title="Invalid incident" message="The incident ID in the address is not valid." />;
  return <InvestigationWorkspace incidentId={id} />;
}