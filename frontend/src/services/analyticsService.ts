import { api } from '../utils/api';
import { normalizeAuditAnalytics, normalizeIncidentAnalytics } from '../utils/normalize';
import type { AuditAnalytics, IncidentAnalytics } from '../types/admin';

export async function getIncidentAnalytics(): Promise<IncidentAnalytics> {
  const { data } = await api.get('/api/analytics/incidents');
  return normalizeIncidentAnalytics(data);
}

export async function getAuditAnalytics(): Promise<AuditAnalytics> {
  const { data } = await api.get('/api/analytics/audit');
  return normalizeAuditAnalytics(data);
}