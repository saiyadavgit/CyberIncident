export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
'REPORTED' |
'TRIAGED' |
'INVESTIGATING' |
'CONTAINED' |
'RESOLVED' |
'CLOSED';

export type IncidentType =
'PHISHING' |
'MALWARE' |
'SUSPICIOUS_LOGIN' |
'UNAUTHORIZED_ACCESS' |
'DATA_BREACH' |
'PASSWORD_COMPROMISE' |
'OTHER';

export interface UserRef {
  id: number;
  name: string;
  email?: string;
}

export interface Investigation {
  id?: number;
  findings: string;
  rootCause: string;
  actionsTaken: string;
  recommendations: string;
  updatedAt?: string;
  analyst?: UserRef | null;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  reporter: UserRef | null;
  assignee: UserRef | null;
  createdAt: string;
  updatedAt?: string;
  investigation: Investigation | null;
}

export interface IncidentInput {
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
}

export interface Evidence {
  id: number;
  fileName: string;
  contentType?: string;
  size?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  checksum?: string;
}

export interface InvestigationInput {
  findings: string;
  rootCause: string;
  actionsTaken: string;
  recommendations: string;
}