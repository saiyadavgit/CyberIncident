import type {
  Evidence,
  Incident,
  IncidentStatus,
  IncidentType,
  Investigation,
  Severity,
  UserRef } from
'../types/incident';
import type { AuthUser, Role } from '../types/auth';
import type { AuditAnalytics, AuditLog, CountMap, IncidentAnalytics, ManagedUser, TrendPoint } from '../types/admin';
import { INCIDENT_TYPES, LIFECYCLE, OPEN_STATUSES, SEVERITIES } from './incidentMeta';

export type Raw = Record<string, unknown>;

export function isObj(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function pickStr(o: Raw, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v;
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

export function pickNum(o: Raw, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

export function unwrapList(data: unknown): Raw[] {
  if (Array.isArray(data)) return data.filter(isObj);
  if (isObj(data)) {
    for (const k of ['content', 'data', 'items', 'results', 'incidents', 'users', 'logs', 'auditLogs', 'evidence']) {
      const v = data[k];
      if (Array.isArray(v)) return v.filter(isObj);
      if (isObj(v) && k === 'data') return unwrapList(v);
    }
  }
  return [];
}

export function unwrapObject(data: unknown): Raw {
  if (!isObj(data)) return {};
  if (isObj(data.data) && data.id === undefined) return data.data;
  return data;
}

function asEnum<T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T {
  const u = (v ?? '').toUpperCase().replace(/[\s-]/g, '_');
  return (allowed as readonly string[]).includes(u) ? u as T : fallback;
}

export function normalizeRole(v: unknown): Role {
  let s: string | undefined;
  if (typeof v === 'string') s = v;else
  if (Array.isArray(v) && v.length) {
    const first: unknown = v[0];
    s = typeof first === 'string' ? first : isObj(first) ? pickStr(first, 'name', 'authority', 'role') : undefined;
  } else if (isObj(v)) s = pickStr(v, 'name', 'authority', 'role');
  const r = (s ?? '').toUpperCase().replace(/^ROLE_/, '');
  return r === 'ADMIN' || r === 'ANALYST' ? r : 'EMPLOYEE';
}

function personName(o: Raw): string | undefined {
  const full = pickStr(o, 'fullName', 'name', 'displayName');
  if (full) return full;
  const parts = [pickStr(o, 'firstName'), pickStr(o, 'lastName')].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return pickStr(o, 'username', 'email');
}

export function normalizeUserRef(v: unknown, fallbackName?: string, fallbackId?: number): UserRef | null {
  if (isObj(v)) return { id: pickNum(v, 'id', 'userId') ?? 0, name: personName(v) ?? 'Unknown', email: pickStr(v, 'email') };
  if (typeof v === 'string' && v.trim()) return { id: fallbackId ?? 0, name: v };
  if (fallbackName) return { id: fallbackId ?? 0, name: fallbackName };
  if (fallbackId) return { id: fallbackId, name: `User #${fallbackId}` };
  return null;
}

export function normalizeInvestigation(v: unknown): Investigation | null {
  if (!isObj(v)) return null;
  return {
    id: pickNum(v, 'id', 'investigationId'),
    findings: pickStr(v, 'findings', 'finding') ?? '',
    rootCause: pickStr(v, 'rootCause', 'cause') ?? '',
    actionsTaken: pickStr(v, 'actionsTaken', 'actions', 'containmentActions') ?? '',
    recommendations: pickStr(v, 'recommendations', 'recommendation', 'remediation', 'notes') ?? '',
    updatedAt: pickStr(v, 'updatedAt', 'lastUpdated', 'createdAt'),
    analyst: normalizeUserRef(v.analyst ?? v.investigator ?? v.createdBy, pickStr(v, 'analystName'))
  };
}

export function normalizeIncident(raw: unknown): Incident {
  const o = unwrapObject(raw);
  return {
    id: pickNum(o, 'id', 'incidentId') ?? 0,
    title: pickStr(o, 'title', 'summary', 'name') ?? 'Untitled incident',
    description: pickStr(o, 'description', 'details') ?? '',
    type: asEnum<IncidentType>(pickStr(o, 'type', 'incidentType', 'category'), INCIDENT_TYPES, 'OTHER'),
    severity: asEnum<Severity>(pickStr(o, 'severity', 'priority'), SEVERITIES, 'MEDIUM'),
    status: asEnum<IncidentStatus>(pickStr(o, 'status', 'state'), LIFECYCLE, 'REPORTED'),
    reporter: normalizeUserRef(
      o.reporter ?? o.reportedBy ?? o.createdBy ?? o.employee,
      pickStr(o, 'reporterName', 'reporterUsername', 'reportedByName', 'reporterEmail'),
      pickNum(o, 'reporterId', 'reportedById')
    ),
    assignee: normalizeUserRef(
      o.assignee ?? o.assignedTo ?? o.analyst,
      pickStr(o, 'assigneeName', 'assigneeUsername', 'assignedToName'),
      pickNum(o, 'assigneeId', 'assignedToId')
    ),
    createdAt: pickStr(o, 'createdAt', 'reportedAt', 'created', 'createdDate') ?? new Date().toISOString(),
    updatedAt: pickStr(o, 'updatedAt', 'lastUpdated', 'modifiedAt'),
    investigation: normalizeInvestigation(o.investigation)
  };
}

export function normalizeEvidence(raw: unknown): Evidence {
  const o = unwrapObject(raw);
  const id = pickNum(o, 'id', 'evidenceId') ?? 0;
  const by = o.uploadedBy;
  return {
    id,
    fileName: pickStr(o, 'fileName', 'originalFilename', 'originalFileName', 'filename', 'name') ?? `evidence-${id}`,
    contentType: pickStr(o, 'contentType', 'mimeType', 'fileType'),
    size: pickNum(o, 'size', 'fileSize', 'sizeBytes'),
    uploadedAt: pickStr(o, 'uploadedAt', 'createdAt'),
    uploadedBy: isObj(by) ? personName(by) : typeof by === 'string' ? by : pickStr(o, 'uploaderName', 'uploadedByName'),
    checksum: pickStr(o, 'sha256', 'checksum', 'hash')
  };
}

export function normalizeAuthUser(raw: unknown): AuthUser {
  const o = unwrapObject(raw);
  return {
    id: pickNum(o, 'id', 'userId') ?? 0,
    username: pickStr(o, 'username', 'email', 'sub') ?? 'user',
    email: pickStr(o, 'email'),
    fullName: personName(o) ?? 'Operator',
    role: normalizeRole(o.role ?? o.roles ?? o.authorities)
  };
}

export function normalizeManagedUser(raw: unknown): ManagedUser {
  const o = unwrapObject(raw);
  const enabled = o.enabled ?? o.active;
  return {
    id: pickNum(o, 'id', 'userId') ?? 0,
    username: pickStr(o, 'username', 'email') ?? 'user',
    email: pickStr(o, 'email'),
    fullName: personName(o) ?? 'Unknown',
    role: normalizeRole(o.role ?? o.roles ?? o.authorities),
    createdAt: pickStr(o, 'createdAt', 'registeredAt'),
    enabled: typeof enabled === 'boolean' ? enabled : undefined
  };
}

export function normalizeAuditLog(raw: unknown, index: number): AuditLog {
  const o = unwrapObject(raw);
  const actor = o.actor ?? o.user ?? o.performedBy;
  const meta = o.metadata;
  return {
    id: pickStr(o, 'id', 'logId') ?? `log-${index}`,
    action: pickStr(o, 'action', 'eventType', 'event', 'type') ?? 'UNKNOWN',
    actor: isObj(actor) ?
    personName(actor) ?? 'system' :
    typeof actor === 'string' ?
    actor :
    pickStr(o, 'actorUsername', 'username', 'userEmail', 'actorEmail') ?? 'system',
    actorRole: pickStr(o, 'actorRole', 'role'),
    entityType: pickStr(o, 'entityType', 'resourceType', 'targetType'),
    entityId: pickStr(o, 'entityId', 'resourceId', 'targetId'),
    details: pickStr(o, 'details', 'description', 'message') ?? (isObj(meta) ? JSON.stringify(meta) : undefined),
    ipAddress: pickStr(o, 'ipAddress', 'ip', 'sourceIp'),
    timestamp: pickStr(o, 'timestamp', 'createdAt', 'occurredAt', 'time') ?? new Date(0).toISOString(),
    outcome: pickStr(o, 'outcome', 'result', 'status')
  };
}

export function toCounts(v: unknown): CountMap {
  const out: CountMap = {};
  if (isObj(v)) {
    Object.entries(v).forEach(([k, val]) => {
      const n = typeof val === 'number' ? val : Number(val);
      if (Number.isFinite(n)) out[k.toUpperCase()] = n;
    });
  } else if (Array.isArray(v)) {
    v.filter(isObj).forEach((x) => {
      const key = pickStr(x, 'key', 'name', 'label', 'severity', 'status', 'type', 'action', 'category', 'user', 'actor');
      const val = pickNum(x, 'count', 'value', 'total');
      if (key && val !== undefined) out[key.toUpperCase()] = val;
    });
  }
  return out;
}

function toTrend(v: unknown): TrendPoint[] {
  if (Array.isArray(v)) {
    return v.
    filter(isObj).
    map((x) => ({ date: pickStr(x, 'date', 'day', 'period', 'label') ?? '', count: pickNum(x, 'count', 'value', 'total') ?? 0 })).
    filter((p) => p.date);
  }
  if (isObj(v)) return Object.entries(v).map(([date, c]) => ({ date, count: Number(c) || 0 }));
  return [];
}

const sum = (m: CountMap) => Object.values(m).reduce((a, b) => a + b, 0);

export function normalizeIncidentAnalytics(raw: unknown): IncidentAnalytics {
  const o = unwrapObject(raw);
  const bySeverity = toCounts(o.bySeverity ?? o.severityCounts ?? o.incidentsBySeverity ?? o.severityDistribution);
  const byStatus = toCounts(o.byStatus ?? o.statusCounts ?? o.incidentsByStatus ?? o.statusDistribution);
  const byType = toCounts(o.byType ?? o.typeCounts ?? o.incidentsByType ?? o.typeDistribution);
  return {
    total: pickNum(o, 'total', 'totalIncidents', 'count') ?? sum(bySeverity),
    open: pickNum(o, 'open', 'openIncidents') ?? OPEN_STATUSES.reduce((a, s) => a + (byStatus[s] ?? 0), 0),
    bySeverity,
    byStatus,
    byType,
    trend: toTrend(o.trend ?? o.dailyTrend ?? o.incidentsOverTime ?? o.timeline ?? o.byDate)
  };
}

export function normalizeAuditAnalytics(raw: unknown): AuditAnalytics {
  const o = unwrapObject(raw);
  const byAction = toCounts(o.byAction ?? o.actionCounts ?? o.eventsByAction);
  return {
    total: pickNum(o, 'total', 'totalEvents', 'count') ?? sum(byAction),
    byAction,
    byActor: toCounts(o.byActor ?? o.byUser ?? o.eventsByUser),
    trend: toTrend(o.trend ?? o.dailyTrend ?? o.eventsOverTime ?? o.byDate)
  };
}