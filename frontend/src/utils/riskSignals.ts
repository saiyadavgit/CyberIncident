import type { Incident, IncidentType } from '../types/incident';
import { SEVERITY_META, isOpen, lifecycleIndex } from './incidentMeta';
import { fmtDuration, hoursSince } from './format';

export interface RiskSignal {
  key: string;
  label: string;
  value: string;
  level: 1 | 2 | 3 | 4;
}

const VECTOR_WEIGHT: Record<IncidentType, 1 | 2 | 3 | 4> = {
  DATA_BREACH: 4,
  MALWARE: 3,
  UNAUTHORIZED_ACCESS: 3,
  PASSWORD_COMPROMISE: 3,
  SUSPICIOUS_LOGIN: 3,
  PHISHING: 2,
  OTHER: 1
};

const VECTOR_LABEL: Record<IncidentType, string> = {
  DATA_BREACH: 'Data exfiltration',
  MALWARE: 'Code execution',
  UNAUTHORIZED_ACCESS: 'Access control',
  PASSWORD_COMPROMISE: 'Credential exposure',
  SUSPICIOUS_LOGIN: 'Identity',
  PHISHING: 'Social engineering',
  OTHER: 'Unclassified'
};

/** Deterministic indicators computed from the incident record — shown separately from AI output. */
export function computeRiskSignals(incident: Incident, evidenceCount: number | null): RiskSignal[] {
  const open = isOpen(incident.status);
  const age = hoursSince(incident.createdAt);
  const signals: RiskSignal[] = [
  { key: 'severity', label: 'Severity', value: SEVERITY_META[incident.severity].label, level: SEVERITY_META[incident.severity].rank as 1 | 2 | 3 | 4 },
  { key: 'vector', label: 'Vector', value: VECTOR_LABEL[incident.type], level: VECTOR_WEIGHT[incident.type] },
  {
    key: 'dwell',
    label: open ? 'Open for' : 'Lifecycle',
    value: open ? fmtDuration(age) : 'Closed out',
    level: !open ? 1 : age > 72 ? 4 : age > 24 ? 3 : age > 8 ? 2 : 1
  },
  {
    key: 'owner',
    label: 'Ownership',
    value: incident.assignee ? incident.assignee.name : 'Unassigned',
    level: !incident.assignee && open ? incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 4 : 3 : 1
  }];

  if (evidenceCount !== null) {
    signals.push({ key: 'evidence', label: 'Evidence', value: evidenceCount ? `${evidenceCount} file${evidenceCount > 1 ? 's' : ''}` : 'None attached', level: evidenceCount ? 1 : 2 });
  }
  const needsInv = lifecycleIndex(incident.status) >= lifecycleIndex('INVESTIGATING');
  signals.push({
    key: 'investigation',
    label: 'Investigation',
    value: incident.investigation ? 'Documented' : needsInv ? 'Not documented' : 'Not started',
    level: incident.investigation ? 1 : needsInv ? 3 : 2
  });
  return signals;
}