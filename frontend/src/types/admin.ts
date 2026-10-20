import type { Role } from './auth';

export type CountMap = Record<string, number>;

export interface TrendPoint {
  date: string;
  count: number;
}

export interface ManagedUser {
  id: number;
  username: string;
  email?: string;
  fullName: string;
  role: Role;
  createdAt?: string;
  enabled?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorRole?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
  outcome?: string;
}

export interface IncidentAnalytics {
  total: number;
  open: number;
  bySeverity: CountMap;
  byStatus: CountMap;
  byType: CountMap;
  trend: TrendPoint[];
}

export interface AuditAnalytics {
  total: number;
  byAction: CountMap;
  byActor: CountMap;
  trend: TrendPoint[];
}