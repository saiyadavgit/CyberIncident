import { format, startOfDay, subDays } from 'date-fns';
import type { Incident, IncidentStatus, IncidentType, Severity } from '../types/incident';
import { INCIDENT_TYPES, LIFECYCLE, SEVERITIES, SEVERITY_META, isOpen } from './incidentMeta';
import { hoursSince, toDate } from './format';

export function countBySeverity(items: Incident[]): Record<Severity, number> {
  const out = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  items.forEach((i) => out[i.severity] += 1);
  return out;
}

export function countByStatus(items: Incident[]): Record<IncidentStatus, number> {
  const out = Object.fromEntries(LIFECYCLE.map((s) => [s, 0])) as Record<IncidentStatus, number>;
  items.forEach((i) => out[i.status] += 1);
  return out;
}

export function countByType(items: Incident[]): Record<IncidentType, number> {
  const out = Object.fromEntries(INCIDENT_TYPES.map((t) => [t, 0])) as Record<IncidentType, number>;
  items.forEach((i) => out[i.type] += 1);
  return out;
}

export interface DailySeverityPoint {
  label: string;
  iso: string;
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
  total: number;
}

export function dailyTrend(items: Incident[], days: number): DailySeverityPoint[] {
  const today = startOfDay(new Date());
  const buckets: DailySeverityPoint[] = Array.from({ length: days }, (_, idx) => {
    const d = subDays(today, days - 1 - idx);
    return { label: format(d, 'dd MMM'), iso: format(d, 'yyyy-MM-dd'), CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, total: 0 };
  });
  const index = new Map(buckets.map((b) => [b.iso, b]));
  items.forEach((i) => {
    const d = toDate(i.createdAt);
    if (!d) return;
    const b = index.get(format(d, 'yyyy-MM-dd'));
    if (b) {
      b[i.severity] += 1;
      b.total += 1;
    }
  });
  return buckets;
}

export type PostureLevel = 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';

export function threatPosture(items: Incident[]): {level: PostureLevel;reason: string;} {
  const open = items.filter((i) => isOpen(i.status));
  const crit = open.filter((i) => i.severity === 'CRITICAL').length;
  const high = open.filter((i) => i.severity === 'HIGH').length;
  if (crit >= 2) return { level: 'SEVERE', reason: `${crit} critical incidents open` };
  if (crit === 1 || high >= 3) return { level: 'HIGH', reason: crit ? '1 critical incident open' : `${high} high-severity incidents open` };
  if (high >= 1 || open.length >= 5) return { level: 'ELEVATED', reason: `${open.length} open incidents` };
  return { level: 'GUARDED', reason: open.length ? `${open.length} low-impact incidents open` : 'No open incidents' };
}

export function meanOpenAgeHours(items: Incident[]): number {
  const open = items.filter((i) => isOpen(i.status));
  if (!open.length) return 0;
  return open.reduce((sum, i) => sum + hoursSince(i.createdAt), 0) / open.length;
}

export function byPriority(a: Incident, b: Incident): number {
  const sev = SEVERITY_META[b.severity].rank - SEVERITY_META[a.severity].rank;
  if (sev !== 0) return sev;
  return (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0);
}

export function byRecent(a: Incident, b: Incident): number {
  return (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0);
}

export function byLastActivity(a: Incident, b: Incident): number {
  const ta = toDate(a.updatedAt ?? a.createdAt)?.getTime() ?? 0;
  const tb = toDate(b.updatedAt ?? b.createdAt)?.getTime() ?? 0;
  return tb - ta;
}

export { SEVERITIES };