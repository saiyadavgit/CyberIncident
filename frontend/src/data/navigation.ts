import {
  RadarIcon,
  ListFilterIcon,
  ScanSearchIcon,
  BrainCircuitIcon,
  LayoutGridIcon,
  SirenIcon,
  InboxIcon,
  ShieldIcon,
  UsersIcon,
  ScrollTextIcon,
  ActivityIcon,
  type LucideIcon } from
'lucide-react';
import type { Role } from '../types/auth';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
{
  label: 'Operations',
  items: [
  { label: 'SOC overview', to: '/analyst/dashboard', icon: RadarIcon, roles: ['ANALYST', 'ADMIN'] },
  { label: 'Incident queue', to: '/analyst/queue', icon: ListFilterIcon, roles: ['ANALYST', 'ADMIN'] },
  { label: 'Investigations', to: '/analyst/investigations', icon: ScanSearchIcon, roles: ['ANALYST', 'ADMIN'] },
  { label: 'Copilot', to: '/copilot', icon: BrainCircuitIcon, roles: ['EMPLOYEE', 'ANALYST', 'ADMIN'] }]

},
{
  label: 'My workspace',
  items: [
  { label: 'Overview', to: '/employee/dashboard', icon: LayoutGridIcon, roles: ['EMPLOYEE'] },
  { label: 'Report incident', to: '/employee/report', icon: SirenIcon, roles: ['EMPLOYEE', 'ANALYST', 'ADMIN'] },
  { label: 'My incidents', to: '/employee/incidents', icon: InboxIcon, roles: ['EMPLOYEE', 'ANALYST', 'ADMIN'] }]

},
{
  label: 'Administration',
  items: [
  { label: 'Admin overview', to: '/admin/dashboard', icon: ShieldIcon, roles: ['ADMIN'] },
  { label: 'Users & roles', to: '/admin/users', icon: UsersIcon, roles: ['ADMIN'] },
  { label: 'Audit trail', to: '/admin/audit-logs', icon: ScrollTextIcon, roles: ['ADMIN'] },
  { label: 'Analytics', to: '/admin/analytics', icon: ActivityIcon, roles: ['ADMIN'] }]

}];