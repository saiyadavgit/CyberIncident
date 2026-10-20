import {
  FishIcon,
  BugIcon,
  LogInIcon,
  DoorOpenIcon,
  DatabaseZapIcon,
  KeyRoundIcon,
  CircleDashedIcon,
  type LucideIcon } from
'lucide-react';
import type { IncidentStatus, IncidentType, Severity } from '../types/incident';

export const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const SEVERITY_META: Record<
  Severity,
  {label: string;rank: number;hex: string;text: string;bg: string;description: string;}> =
{
  CRITICAL: {
    label: 'Critical',
    rank: 4,
    hex: '#FF4D5E',
    text: 'text-crit',
    bg: 'bg-crit',
    description: 'Active compromise, data loss, or business-critical exposure.'
  },
  HIGH: {
    label: 'High',
    rank: 3,
    hex: '#FF8A3D',
    text: 'text-high',
    bg: 'bg-high',
    description: 'Likely compromise of an account, device, or sensitive system.'
  },
  MEDIUM: {
    label: 'Medium',
    rank: 2,
    hex: '#F5C451',
    text: 'text-med',
    bg: 'bg-med',
    description: 'Suspicious activity that needs review but is contained.'
  },
  LOW: {
    label: 'Low',
    rank: 1,
    hex: '#7A8CA8',
    text: 'text-low',
    bg: 'bg-low',
    description: 'Policy concern or minor event with no evident impact.'
  }
};

export const LIFECYCLE: IncidentStatus[] = [
'REPORTED',
'TRIAGED',
'INVESTIGATING',
'CONTAINED',
'RESOLVED',
'CLOSED'];


export const OPEN_STATUSES: IncidentStatus[] = ['REPORTED', 'TRIAGED', 'INVESTIGATING', 'CONTAINED'];

export const STATUS_META: Record<IncidentStatus, {label: string;description: string;}> = {
  REPORTED: { label: 'Reported', description: 'Awaiting triage by the SOC.' },
  TRIAGED: { label: 'Triaged', description: 'Severity confirmed and queued for investigation.' },
  INVESTIGATING: { label: 'Investigating', description: 'An analyst is actively investigating.' },
  CONTAINED: { label: 'Contained', description: 'Threat contained; remediation in progress.' },
  RESOLVED: { label: 'Resolved', description: 'Remediation complete, pending closure.' },
  CLOSED: { label: 'Closed', description: 'Incident closed and archived.' }
};

export const INCIDENT_TYPES: IncidentType[] = [
'PHISHING',
'MALWARE',
'SUSPICIOUS_LOGIN',
'UNAUTHORIZED_ACCESS',
'DATA_BREACH',
'PASSWORD_COMPROMISE',
'OTHER'];


export const TYPE_META: Record<
  IncidentType,
  {label: string;code: string;icon: LucideIcon;hint: string;}> =
{
  PHISHING: { label: 'Phishing', code: 'PHI', icon: FishIcon, hint: 'Deceptive email, message, call, or link' },
  MALWARE: { label: 'Malware', code: 'MAL', icon: BugIcon, hint: 'Malicious software or unexpected processes' },
  SUSPICIOUS_LOGIN: { label: 'Suspicious login', code: 'LGN', icon: LogInIcon, hint: 'Unusual sign-in, MFA prompts, location' },
  UNAUTHORIZED_ACCESS: { label: 'Unauthorized access', code: 'UAC', icon: DoorOpenIcon, hint: 'Access to systems or areas beyond scope' },
  DATA_BREACH: { label: 'Data breach', code: 'DBR', icon: DatabaseZapIcon, hint: 'Sensitive data exposed or exfiltrated' },
  PASSWORD_COMPROMISE: { label: 'Password compromise', code: 'PWD', icon: KeyRoundIcon, hint: 'Credentials leaked, shared, or reused' },
  OTHER: { label: 'Other', code: 'OTH', icon: CircleDashedIcon, hint: 'Anything that does not fit above' }
};

export function isOpen(status: IncidentStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

export function lifecycleIndex(status: IncidentStatus): number {
  return LIFECYCLE.indexOf(status);
}