import { api } from '../utils/api';
import { normalizeAuditLog, normalizeManagedUser, unwrapList } from '../utils/normalize';
import type { AuditLog, ManagedUser } from '../types/admin';
import type { Role } from '../types/auth';

export async function listUsers(options: {silent?: boolean;} = {}): Promise<ManagedUser[]> {
  const { data } = await api.get('/api/admin/users', { silent: options.silent });
  return unwrapList(data).map(normalizeManagedUser);
}

export async function updateUserRole(userId: number, role: Role): Promise<ManagedUser | null> {
  const { data } = await api.put(`/api/admin/users/${userId}/role`, { role }, { params: { role } });
  return data && typeof data === 'object' ? normalizeManagedUser(data) : null;
}

export async function listAuditLogs(options: {silent?: boolean;} = {}): Promise<AuditLog[]> {
  const { data } = await api.get('/api/admin/audit-logs', { silent: options.silent });
  return unwrapList(data).map(normalizeAuditLog);
}