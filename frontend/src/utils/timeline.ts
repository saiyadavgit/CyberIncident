import type { Evidence, Incident } from '../types/incident';
import type { AuditLog } from '../types/admin';
import { humanize, toDate } from './format';
import { STATUS_META } from './incidentMeta';

export type TimelineKind = 'reported' | 'evidence' | 'investigation' | 'status' | 'assigned' | 'ai' | 'access' | 'update';

export interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  detail?: string;
  actor?: string;
  kind: TimelineKind;
}

const SKIP_AUDIT = new Set(['INCIDENT_CREATED', 'EVIDENCE_UPLOADED']);

function kindFor(action: string): TimelineKind {
  if (action.includes('STATUS')) return 'status';
  if (action.includes('ASSIGN')) return 'assigned';
  if (action.includes('AI_')) return 'ai';
  if (action.includes('INVESTIGATION')) return 'investigation';
  if (action.includes('DENIED') || action.includes('ACCESS')) return 'access';
  if (action.includes('EVIDENCE')) return 'evidence';
  return 'update';
}

/** Builds a chronological record purely from data the backend returned — nothing is inferred or invented. */
export function buildIncidentTimeline(incident: Incident, evidence: Evidence[], audit: AuditLog[]): TimelineEvent[] {
  const events: TimelineEvent[] = [
  {
    id: 'reported',
    at: incident.createdAt,
    title: 'Incident reported',
    detail: incident.title,
    actor: incident.reporter?.name,
    kind: 'reported'
  }];


  evidence.forEach((e) => {
    if (!e.uploadedAt) return;
    events.push({ id: `ev-${e.id}`, at: e.uploadedAt, title: 'Evidence attached', detail: e.fileName, actor: e.uploadedBy, kind: 'evidence' });
  });

  const related = audit.filter((a) => a.entityId === String(incident.id) && (!a.entityType || a.entityType.toUpperCase().includes('INCIDENT')));
  related.forEach((a) => {
    if (SKIP_AUDIT.has(a.action)) return;
    events.push({ id: `audit-${a.id}`, at: a.timestamp, title: humanize(a.action), detail: a.details, actor: a.actor, kind: kindFor(a.action) });
  });

  if (!related.length) {
    if (incident.investigation?.updatedAt) {
      events.push({
        id: 'investigation',
        at: incident.investigation.updatedAt,
        title: 'Investigation record updated',
        actor: incident.investigation.analyst?.name,
        kind: 'investigation'
      });
    }
    if (incident.updatedAt && incident.updatedAt !== incident.createdAt) {
      events.push({
        id: 'latest',
        at: incident.updatedAt,
        title: `Last update · ${STATUS_META[incident.status].label}`,
        detail: incident.assignee ? `Owner: ${incident.assignee.name}` : 'Unassigned',
        kind: 'update'
      });
    }
  }

  return events.sort((a, b) => (toDate(b.at)?.getTime() ?? 0) - (toDate(a.at)?.getTime() ?? 0));
}