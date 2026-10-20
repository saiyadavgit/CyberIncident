/**
 * In-browser stand-in for the Spring Boot API, used ONLY when demoMode is on.
 * It honours the same endpoints, payloads and RBAC rules so the UI can be previewed
 * end-to-end. In live mode this adapter is never installed.
 */
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import {
  demoAuditSeeds,
  demoEvidenceSeeds,
  demoIncidentSeeds,
  demoInvestigationSeeds,
  demoUsers,
  type DemoUser } from
'../data/demoFixtures';
import type { IncidentStatus, IncidentType, Severity } from '../types/incident';
import type { Role } from '../types/auth';
import { INCIDENT_TYPES, LIFECYCLE, OPEN_STATUSES, SEVERITIES } from './incidentMeta';
import { demoAiResponse } from './demoAi';

const H = 3_600_000;
const iso = (hoursAgo: number) => new Date(Date.now() - hoursAgo * H).toISOString();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface DemoInvestigation {
  id: number;
  findings: string;
  rootCause: string;
  actionsTaken: string;
  recommendations: string;
  analystId: number;
  updatedAt: string;
}
interface DemoIncident {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  reporterId: number;
  assigneeId: number | null;
  createdAt: string;
  updatedAt: string;
  investigation: DemoInvestigation | null;
}
interface DemoEvidence {
  id: number;
  incidentId: number;
  fileName: string;
  contentType: string;
  size: number;
  uploadedById: number;
  uploadedAt: string;
  sha256: string;
}
interface DemoAudit {
  id: number;
  action: string;
  actorUsername: string;
  actorRole: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  outcome: string;
}
interface Db {
  users: DemoUser[];
  incidents: DemoIncident[];
  evidence: DemoEvidence[];
  audit: DemoAudit[];
  seq: {incident: number;evidence: number;audit: number;user: number;investigation: number;};
}

let store: Db | null = null;

function db(): Db {
  if (store) return store;
  const users = demoUsers.map((u) => ({ ...u }));
  const incidents: DemoIncident[] = demoIncidentSeeds.map((s) => {
    const inv = demoInvestigationSeeds.find((i) => i.incidentId === s.id);
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      type: s.type,
      severity: s.severity,
      status: s.status,
      reporterId: s.reporterId,
      assigneeId: s.assigneeId,
      createdAt: iso(s.ageHours),
      updatedAt: iso(s.updatedHoursAgo),
      investigation: inv ?
      { id: 9000 + s.id, findings: inv.findings, rootCause: inv.rootCause, actionsTaken: inv.actionsTaken, recommendations: inv.recommendations, analystId: inv.analystId, updatedAt: iso(inv.updatedHoursAgo) } :
      null
    };
  });
  const evidence = demoEvidenceSeeds.map((e) => ({ ...e, uploadedAt: iso(e.hoursAgo) }));
  const audit: DemoAudit[] = demoAuditSeeds.map((a, idx) => {
    const actor = users.find((u) => u.id === a.actorId);
    return {
      id: idx + 1,
      action: a.action,
      actorUsername: actor?.username ?? 'anonymous',
      actorRole: actor?.role ?? 'NONE',
      entityType: a.entityType,
      entityId: a.entityId,
      details: a.details,
      ipAddress: a.ip,
      timestamp: iso(a.hoursAgo),
      outcome: a.outcome
    };
  });
  incidents.forEach((inc) => {
    const actor = users.find((u) => u.id === inc.reporterId);
    audit.push({
      id: audit.length + 1,
      action: 'INCIDENT_CREATED',
      actorUsername: actor?.username ?? 'unknown',
      actorRole: actor?.role ?? 'EMPLOYEE',
      entityType: 'INCIDENT',
      entityId: String(inc.id),
      details: `${inc.type} · ${inc.severity} — ${inc.title}`,
      ipAddress: `10.20.${inc.id % 12 + 1}.${inc.id * 7 % 200}`,
      timestamp: inc.createdAt,
      outcome: 'SUCCESS'
    });
  });
  store = {
    users,
    incidents,
    evidence,
    audit,
    seq: { incident: 1065, evidence: 600, audit: audit.length + 1, user: 9, investigation: 20000 }
  };
  return store;
}

function respond(config: InternalAxiosRequestConfig, data: unknown, status = 200, headers: Record<string, string> = {}): AxiosResponse {
  return { data, status, statusText: String(status), headers, config };
}

function fail(config: InternalAxiosRequestConfig, status: number, message: string): never {
  const response = respond(config, { status, message });
  throw new AxiosError(message, status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, null, response);
}

function session(config: InternalAxiosRequestConfig): DemoUser | null {
  const header = String(config.headers?.get?.('Authorization') ?? config.headers?.Authorization ?? '');
  const m = header.match(/^Bearer demo-token:(\w+):(\d+)$/);
  if (!m) return null;
  return db().users.find((u) => u.id === Number(m[2])) ?? null;
}

function requireRole(config: InternalAxiosRequestConfig, roles?: Role[]): DemoUser {
  const user = session(config);
  if (!user) fail(config, 401, 'Authentication required');
  if (roles && !roles.includes(user.role)) fail(config, 403, 'Access denied for your role');
  return user;
}

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  const d: unknown = config.data;
  if (typeof d === 'string') {
    try {
      const parsed: unknown = JSON.parse(d);
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return d && typeof d === 'object' && !(d instanceof FormData) ? d as Record<string, unknown> : {};
}

const userRef = (id: number | null) => {
  const u = id ? db().users.find((x) => x.id === id) : undefined;
  return u ? { id: u.id, fullName: u.fullName, username: u.username, email: u.email } : null;
};

function incidentDto(inc: DemoIncident) {
  return {
    id: inc.id,
    title: inc.title,
    description: inc.description,
    incidentType: inc.type,
    severity: inc.severity,
    status: inc.status,
    reporter: userRef(inc.reporterId),
    assignee: userRef(inc.assigneeId),
    createdAt: inc.createdAt,
    updatedAt: inc.updatedAt,
    investigation: inc.investigation ? { ...inc.investigation, analyst: userRef(inc.investigation.analystId) } : null
  };
}

function evidenceDto(e: DemoEvidence) {
  return { id: e.id, fileName: e.fileName, contentType: e.contentType, size: e.size, uploadedAt: e.uploadedAt, uploadedBy: userRef(e.uploadedById), sha256: e.sha256 };
}

function log(actor: DemoUser | null, action: string, entityType: string, entityId: string, details: string, outcome = 'SUCCESS') {
  const s = db();
  s.audit.push({
    id: s.seq.audit++,
    action,
    actorUsername: actor?.username ?? 'anonymous',
    actorRole: actor?.role ?? 'NONE',
    entityType,
    entityId,
    details,
    ipAddress: '10.20.4.18',
    timestamp: new Date().toISOString(),
    outcome
  });
}

function findIncident(config: InternalAxiosRequestConfig, id: number, user: DemoUser): DemoIncident {
  const inc = db().incidents.find((i) => i.id === id);
  if (!inc) fail(config, 404, `Incident ${id} not found`);
  if (user.role === 'EMPLOYEE' && inc.reporterId !== user.id) {
    log(user, 'ACCESS_DENIED', 'INCIDENT', String(id), 'Employee attempted to access an incident owned by another user', 'DENIED');
    fail(config, 403, 'You do not have access to this incident');
  }
  return inc;
}

const countBy = <T,>(items: T[], key: (t: T) => string) =>
items.reduce<Record<string, number>>((acc, it) => {
  const k = key(it);
  acc[k] = (acc[k] ?? 0) + 1;
  return acc;
}, {});

function dailyTrend(dates: string[], days: number) {
  const out: {date: string;count: number;}[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * H).toISOString().slice(0, 10);
    out.push({ date: d, count: dates.filter((x) => x.slice(0, 10) === d).length });
  }
  return out;
}

async function route(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const s = db();
  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  const params = (config.params ?? {}) as Record<string, unknown>;
  const body = parseBody(config);
  let m: RegExpMatchArray | null;

  if (path === '/api/health' && method === 'get') return respond(config, { status: 'UP' });

  if (path === '/api/auth/login' && method === 'post') {
    const ident = String(body.username ?? body.email ?? '').toLowerCase();
    const user = s.users.find((u) => u.username.toLowerCase() === ident || u.email.toLowerCase() === ident);
    if (!user || !String(body.password ?? '')) {
      log(null, 'LOGIN_FAILURE', 'USER', ident || '-', `Invalid credentials for "${ident}"`, 'FAILURE');
      fail(config, 401, 'Invalid username or password');
    }
    log(user, 'LOGIN_SUCCESS', 'USER', String(user.id), 'Interactive sign-in');
    return respond(config, {
      token: `demo-token:${user.role}:${user.id}`,
      user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role }
    });
  }

  if (path === '/api/auth/register' && method === 'post') {
    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '').trim();
    if (!username || !email || String(body.password ?? '').length < 8) fail(config, 400, 'Username, email and an 8+ character password are required');
    if (s.users.some((u) => u.username === username || u.email === email)) fail(config, 409, 'Username or email already registered');
    const user: DemoUser = { id: s.seq.user++, username, email, fullName: String(body.fullName ?? username), role: 'EMPLOYEE', createdDaysAgo: 0 };
    s.users.push(user);
    log(user, 'USER_REGISTERED', 'USER', String(user.id), 'Self-registration');
    return respond(config, { message: 'Registration successful' }, 201);
  }

  if (path === '/api/incidents' && method === 'post') {
    const user = requireRole(config);
    const title = String(body.title ?? '').trim();
    if (!title) fail(config, 400, 'Title is required');
    const type = String(body.type ?? body.incidentType ?? 'OTHER') as IncidentType;
    const severity = String(body.severity ?? 'MEDIUM') as Severity;
    const now = new Date().toISOString();
    const inc: DemoIncident = {
      id: s.seq.incident++,
      title,
      description: String(body.description ?? ''),
      type: INCIDENT_TYPES.includes(type) ? type : 'OTHER',
      severity: SEVERITIES.includes(severity) ? severity : 'MEDIUM',
      status: 'REPORTED',
      reporterId: user.id,
      assigneeId: null,
      createdAt: now,
      updatedAt: now,
      investigation: null
    };
    s.incidents.push(inc);
    log(user, 'INCIDENT_CREATED', 'INCIDENT', String(inc.id), `${inc.type} · ${inc.severity} — ${inc.title}`);
    return respond(config, incidentDto(inc), 201);
  }

  if (path === '/api/employee/incidents' && method === 'get') {
    const user = requireRole(config);
    return respond(config, s.incidents.filter((i) => i.reporterId === user.id).map(incidentDto));
  }

  if ((m = path.match(/^\/api\/incidents\/(\d+)\/evidence\/(\d+)\/download$/)) && method === 'get') {
    const user = requireRole(config);
    findIncident(config, Number(m[1]), user);
    const ev = s.evidence.find((e) => e.id === Number(m![2]) && e.incidentId === Number(m![1]));
    if (!ev) fail(config, 404, 'Evidence not found');
    log(user, 'EVIDENCE_DOWNLOADED', 'INCIDENT', m[1], `Downloaded ${ev.fileName}`);
    const blob = new Blob([`Demo evidence placeholder for ${ev.fileName}\nSHA-256: ${ev.sha256}\n`], { type: 'text/plain' });
    return respond(config, blob, 200, { 'content-disposition': `attachment; filename="${ev.fileName}.txt"` });
  }

  if (m = path.match(/^\/api\/incidents\/(\d+)\/evidence$/)) {
    const user = requireRole(config);
    const inc = findIncident(config, Number(m[1]), user);
    if (method === 'get') return respond(config, s.evidence.filter((e) => e.incidentId === inc.id).map(evidenceDto));
    if (method === 'post') {
      const file = config.data instanceof FormData ? config.data.get('file') : null;
      if (!(file instanceof File)) fail(config, 400, 'No file provided');
      const allowed = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain', 'text/csv'];
      if (file.type && !allowed.includes(file.type)) fail(config, 415, 'Unsupported file type');
      if (file.size > 10 * 1024 * 1024) fail(config, 413, 'File exceeds 10 MB limit');
      await sleep(500);
      const ev: DemoEvidence = {
        id: s.seq.evidence++,
        incidentId: inc.id,
        fileName: file.name.replace(/[\\/]/g, '_'),
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        uploadedById: user.id,
        uploadedAt: new Date().toISOString(),
        sha256: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
      };
      s.evidence.push(ev);
      inc.updatedAt = ev.uploadedAt;
      log(user, 'EVIDENCE_UPLOADED', 'INCIDENT', String(inc.id), `Uploaded ${ev.fileName}`);
      return respond(config, evidenceDto(ev), 201);
    }
  }

  if ((m = path.match(/^\/api\/incidents\/(\d+)$/)) && method === 'get') {
    const user = requireRole(config);
    return respond(config, incidentDto(findIncident(config, Number(m[1]), user)));
  }

  if (path === '/api/analyst/incidents' && method === 'get') {
    requireRole(config, ['ANALYST', 'ADMIN']);
    return respond(config, s.incidents.map(incidentDto));
  }

  if ((m = path.match(/^\/api\/analyst\/incidents\/(\d+)\/assign$/)) && method === 'post') {
    const user = requireRole(config, ['ANALYST', 'ADMIN']);
    const inc = findIncident(config, Number(m[1]), user);
    const assignee = s.users.find((u) => u.id === Number(params.assigneeId));
    if (!assignee || assignee.role === 'EMPLOYEE') fail(config, 400, 'Assignee must be an analyst or admin');
    inc.assigneeId = assignee.id;
    inc.updatedAt = new Date().toISOString();
    log(user, 'INCIDENT_ASSIGNED', 'INCIDENT', String(inc.id), `Assigned to ${assignee.fullName}`);
    return respond(config, incidentDto(inc));
  }

  if ((m = path.match(/^\/api\/analyst\/incidents\/(\d+)\/status$/)) && method === 'post') {
    const user = requireRole(config, ['ANALYST', 'ADMIN']);
    const inc = findIncident(config, Number(m[1]), user);
    const status = String(params.status ?? '') as IncidentStatus;
    if (!LIFECYCLE.includes(status)) fail(config, 400, 'Invalid status');
    const prev = inc.status;
    inc.status = status;
    inc.updatedAt = new Date().toISOString();
    log(user, 'STATUS_CHANGED', 'INCIDENT', String(inc.id), `${prev} → ${status}`);
    return respond(config, incidentDto(inc));
  }

  if ((m = path.match(/^\/api\/analyst\/incidents\/(\d+)\/investigation$/)) && (method === 'post' || method === 'put')) {
    const user = requireRole(config, ['ANALYST', 'ADMIN']);
    const inc = findIncident(config, Number(m[1]), user);
    if (method === 'post' && inc.investigation) fail(config, 409, 'Investigation already exists');
    if (method === 'put' && !inc.investigation) fail(config, 404, 'No investigation to update');
    const now = new Date().toISOString();
    inc.investigation = {
      id: inc.investigation?.id ?? s.seq.investigation++,
      findings: String(body.findings ?? ''),
      rootCause: String(body.rootCause ?? ''),
      actionsTaken: String(body.actionsTaken ?? ''),
      recommendations: String(body.recommendations ?? ''),
      analystId: user.id,
      updatedAt: now
    };
    inc.updatedAt = now;
    log(user, method === 'post' ? 'INVESTIGATION_CREATED' : 'INVESTIGATION_UPDATED', 'INCIDENT', String(inc.id), 'Investigation record saved');
    return respond(config, { ...inc.investigation, analyst: userRef(user.id) }, method === 'post' ? 201 : 200);
  }

  if (path === '/api/admin/users' && method === 'get') {
    requireRole(config, ['ADMIN']);
    return respond(config, s.users.map((u) => ({ id: u.id, username: u.username, email: u.email, fullName: u.fullName, role: u.role, enabled: true, createdAt: iso(u.createdDaysAgo * 24) })));
  }

  if ((m = path.match(/^\/api\/admin\/users\/(\d+)\/role$/)) && method === 'put') {
    const admin = requireRole(config, ['ADMIN']);
    const target = s.users.find((u) => u.id === Number(m![1]));
    if (!target) fail(config, 404, 'User not found');
    if (target.id === admin.id) fail(config, 400, 'You cannot change your own role');
    const role = String(body.role ?? params.role ?? '') as Role;
    if (!['EMPLOYEE', 'ANALYST', 'ADMIN'].includes(role)) fail(config, 400, 'Invalid role');
    const prev = target.role;
    target.role = role;
    log(admin, 'ROLE_CHANGED', 'USER', String(target.id), `${prev} → ${role}`);
    return respond(config, { id: target.id, username: target.username, email: target.email, fullName: target.fullName, role: target.role });
  }

  if (path === '/api/admin/audit-logs' && method === 'get') {
    requireRole(config, ['ADMIN']);
    return respond(config, [...s.audit].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }

  if (path === '/api/analytics/incidents' && method === 'get') {
    requireRole(config, ['ADMIN', 'ANALYST']);
    return respond(config, {
      totalIncidents: s.incidents.length,
      openIncidents: s.incidents.filter((i) => OPEN_STATUSES.includes(i.status)).length,
      bySeverity: countBy(s.incidents, (i) => i.severity),
      byStatus: countBy(s.incidents, (i) => i.status),
      byType: countBy(s.incidents, (i) => i.type),
      trend: dailyTrend(s.incidents.map((i) => i.createdAt), 30)
    });
  }

  if (path === '/api/analytics/audit' && method === 'get') {
    requireRole(config, ['ADMIN', 'ANALYST']);
    return respond(config, {
      totalEvents: s.audit.length,
      byAction: countBy(s.audit, (a) => a.action),
      byUser: countBy(s.audit, (a) => a.actorUsername),
      trend: dailyTrend(s.audit.map((a) => a.timestamp), 14)
    });
  }

  if ((m = path.match(/^\/api\/ai\/(analyze-incident|remediation-plan|summarize-investigation)$/)) && method === 'post') {
    const user = requireRole(config);
    const inc = findIncident(config, Number(body.incidentId), user);
    await sleep(1200);
    const mode = m[1] === 'analyze-incident' ? 'analyze' : m[1] === 'remediation-plan' ? 'remediation' : 'summarize';
    log(user, mode === 'analyze' ? 'AI_ANALYSIS_REQUESTED' : mode === 'remediation' ? 'AI_REMEDIATION_REQUESTED' : 'AI_SUMMARY_REQUESTED', 'INCIDENT', String(inc.id), 'Copilot request');
    const text = demoAiResponse(mode, {
      id: inc.id,
      title: inc.title,
      description: inc.description,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      hasInvestigation: Boolean(inc.investigation),
      findings: inc.investigation?.findings,
      rootCause: inc.investigation?.rootCause,
      actionsTaken: inc.investigation?.actionsTaken
    });
    return respond(config, { incidentId: inc.id, result: text, model: 'demo' });
  }

  fail(config, 404, `No demo route for ${method.toUpperCase()} ${path}`);
}

export const demoAdapter: AxiosAdapter = async (config) => {
  await sleep(180 + Math.random() * 220);
  return route(config);
};