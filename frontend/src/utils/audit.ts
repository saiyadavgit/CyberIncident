import type { AuditLog } from '../types/admin';

export type AuditCategory = 'auth' | 'access' | 'incident' | 'evidence' | 'ai' | 'admin' | 'other';

export function auditCategory(action: string): AuditCategory {
  const a = action.toUpperCase();
  if (a.includes('LOGIN') || a.includes('LOGOUT') || a.includes('REGISTER') || a.includes('AUTH')) return 'auth';
  if (a.includes('DENIED') || a.includes('FORBIDDEN')) return 'access';
  if (a.includes('ROLE') || a.includes('USER') || a.includes('EXPORT')) return 'admin';
  if (a.includes('EVIDENCE')) return 'evidence';
  if (a.startsWith('AI_') || a.includes('_AI_')) return 'ai';
  if (a.includes('INCIDENT') || a.includes('STATUS') || a.includes('ASSIGN') || a.includes('INVESTIGATION')) return 'incident';
  return 'other';
}

export function isFailure(log: AuditLog): boolean {
  const o = (log.outcome ?? '').toUpperCase();
  const a = log.action.toUpperCase();
  return o === 'FAILURE' || o === 'FAILED' || o === 'DENIED' || o === 'FALSE' || a.includes('FAIL') || a.includes('DENIED');
}

export function outcomeOf(log: AuditLog): 'success' | 'failure' | 'denied' {
  const o = (log.outcome ?? '').toUpperCase();
  if (o === 'DENIED' || log.action.toUpperCase().includes('DENIED')) return 'denied';
  if (isFailure(log)) return 'failure';
  return 'success';
}

export function isSecurityRelevant(log: AuditLog): boolean {
  const c = auditCategory(log.action);
  return isFailure(log) || c === 'admin' || c === 'access' || log.action.toUpperCase().includes('STATUS');
}

export function toCsv(logs: AuditLog[]): string {
  const head = ['timestamp', 'action', 'actor', 'actorRole', 'entityType', 'entityId', 'outcome', 'ipAddress', 'details'];
  const esc = (v: string | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`;
  return [head.join(','), ...logs.map((l) => [l.timestamp, l.action, l.actor, l.actorRole, l.entityType, l.entityId, l.outcome, l.ipAddress, l.details].map(esc).join(','))].join('\n');
}