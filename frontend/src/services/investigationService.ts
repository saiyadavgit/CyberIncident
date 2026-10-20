import { api, getStatus } from '../utils/api';
import { normalizeInvestigation } from '../utils/normalize';
import type { Investigation, InvestigationInput } from '../types/incident';

function toPayload(input: InvestigationInput) {
  return {
    findings: input.findings,
    rootCause: input.rootCause,
    actionsTaken: input.actionsTaken,
    recommendations: input.recommendations
  };
}

export async function createInvestigation(incidentId: number, input: InvestigationInput): Promise<Investigation | null> {
  const { data } = await api.post(`/api/analyst/incidents/${incidentId}/investigation`, toPayload(input));
  return normalizeInvestigation(data);
}

export async function updateInvestigation(incidentId: number, input: InvestigationInput): Promise<Investigation | null> {
  const { data } = await api.put(`/api/analyst/incidents/${incidentId}/investigation`, toPayload(input));
  return normalizeInvestigation(data);
}

/** Creates the investigation if none exists yet, otherwise updates it. */
export async function saveInvestigation(
incidentId: number,
input: InvestigationInput,
exists: boolean)
: Promise<Investigation | null> {
  if (exists) return updateInvestigation(incidentId, input);
  try {
    return await createInvestigation(incidentId, input);
  } catch (error) {
    if (getStatus(error) === 409) return updateInvestigation(incidentId, input);
    throw error;
  }
}