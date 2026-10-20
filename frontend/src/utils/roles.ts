import type { Role } from '../types/auth';

export const ROLE_HOME: Record<Role, string> = {
  EMPLOYEE: '/employee/dashboard',
  ANALYST: '/analyst/dashboard',
  ADMIN: '/admin/dashboard'
};

export const ROLE_LABEL: Record<Role, string> = {
  EMPLOYEE: 'Employee',
  ANALYST: 'SOC Analyst',
  ADMIN: 'Administrator'
};

export const ROLES: Role[] = ['EMPLOYEE', 'ANALYST', 'ADMIN'];

export const ALL_ROLES: Role[] = ROLES;
export const SOC_ROLES: Role[] = ['ANALYST', 'ADMIN'];
export const ADMIN_ROLES: Role[] = ['ADMIN'];

export function isPrivileged(role?: Role): boolean {
  return role === 'ANALYST' || role === 'ADMIN';
}