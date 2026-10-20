import { api } from '../utils/api';
import { normalizeIncident, unwrapList } from '../utils/normalize';
import type { Incident, IncidentInput, IncidentStatus } from '../types/incident';

export async function createIncident(input: IncidentInput): Promise<Incident> {
  const { data } = await api.post('/api/incidents', {
    title: input.title,
    description: input.description,
    type: input.type,
    incidentType: input.type,
    severity: input.severity
  });
  return normalizeIncident(data);
}

export async function getMyIncidents(): Promise<Incident[]> {
  const { data } = await api.get('/api/incidents/my');
  return unwrapList(data).map(normalizeIncident);
}

export async function getIncident(incidentId: number | string): Promise<Incident> {
  const { data } = await api.get(`/api/incidents/${incidentId}`);
  return normalizeIncident(data);
}

export async function getAllIncidents(): Promise<Incident[]> {
  const { data } = await api.get('/api/analyst/incidents');
  return unwrapList(data).map(normalizeIncident);
}

export async function assignIncident(incidentId: number, assigneeId: number): Promise<Incident | null> {
  const { data } = await api.post(`/api/analyst/incidents/${incidentId}/assign`, null, { params: { assigneeId } });
  return data && typeof data === 'object' ? normalizeIncident(data) : null;
}

export async function updateIncidentStatus(incidentId: number, status: IncidentStatus): Promise<Incident | null> {
  const { data } = await api.post(`/api/analyst/incidents/${incidentId}/status`, null, { params: { status } });
  return data && typeof data === 'object' ? normalizeIncident(data) : null;
}