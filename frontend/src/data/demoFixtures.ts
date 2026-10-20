/**
 * Demo environment seed — used ONLY when the app runs with demoMode enabled
 * (for previewing without the Spring Boot backend). Live mode never reads this file.
 */
import type { IncidentStatus, IncidentType, Severity } from '../types/incident';
import type { Role } from '../types/auth';

export interface DemoUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  createdDaysAgo: number;
}

export const demoUsers: DemoUser[] = [
{ id: 1, username: 'mchen', email: 'maya.chen@helix.corp', fullName: 'Maya Chen', role: 'ANALYST', createdDaysAgo: 410 },
{ id: 2, username: 'dokafor', email: 'daniel.okafor@helix.corp', fullName: 'Daniel Okafor', role: 'ADMIN', createdDaysAgo: 620 },
{ id: 3, username: 'praman', email: 'priya.raman@helix.corp', fullName: 'Priya Raman', role: 'ANALYST', createdDaysAgo: 288 },
{ id: 4, username: 'lferreira', email: 'lucas.ferreira@helix.corp', fullName: 'Lucas Ferreira', role: 'EMPLOYEE', createdDaysAgo: 190 },
{ id: 5, username: 'smarin', email: 'sofia.marin@helix.corp', fullName: 'Sofia Marin', role: 'EMPLOYEE', createdDaysAgo: 144 },
{ id: 6, username: 'tbecker', email: 'tom.becker@helix.corp', fullName: 'Tom Becker', role: 'EMPLOYEE', createdDaysAgo: 96 },
{ id: 7, username: 'akarim', email: 'aisha.karim@helix.corp', fullName: 'Aisha Karim', role: 'EMPLOYEE', createdDaysAgo: 58 },
{ id: 8, username: 'jweber', email: 'jonas.weber@helix.corp', fullName: 'Jonas Weber', role: 'ANALYST', createdDaysAgo: 33 }];


export interface DemoIncidentSeed {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  reporterId: number;
  assigneeId: number | null;
  ageHours: number;
  updatedHoursAgo: number;
}

export const demoIncidentSeeds: DemoIncidentSeed[] = [
{ id: 1041, title: 'Credential-harvest email impersonating the payroll portal', description: 'Received an email from "payroll-helix.com" asking me to re-confirm bank details before Friday. The link opened a login page that looked identical to our SSO. I entered my username before noticing the domain.', type: 'PHISHING', severity: 'HIGH', status: 'INVESTIGATING', reporterId: 4, assigneeId: 1, ageHours: 30, updatedHoursAgo: 3 },
{ id: 1042, title: 'EDR flagged Emotet loader on FIN-WS-114', description: 'Endpoint protection quarantined a macro-enabled invoice attachment, but a child PowerShell process ran for ~40 seconds before isolation. Workstation belongs to accounts payable.', type: 'MALWARE', severity: 'CRITICAL', status: 'CONTAINED', reporterId: 6, assigneeId: 3, ageHours: 52, updatedHoursAgo: 6 },
{ id: 1043, title: 'Impossible-travel sign-in: Frankfurt → São Paulo in 40 minutes', description: 'I got an alert that my account signed in from Brazil while I was in the Frankfurt office. I did not travel and did not approve any MFA prompt.', type: 'SUSPICIOUS_LOGIN', severity: 'HIGH', status: 'TRIAGED', reporterId: 5, assigneeId: 8, ageHours: 19, updatedHoursAgo: 15 },
{ id: 1044, title: 'Contractor account browsing HR share outside project scope', description: 'A contractor account from the facilities project opened several folders under \\\\hr-fs\\compensation this morning. They should only have access to the building-plans share.', type: 'UNAUTHORIZED_ACCESS', severity: 'MEDIUM', status: 'REPORTED', reporterId: 7, assigneeId: null, ageHours: 5, updatedHoursAgo: 5 },
{ id: 1045, title: 'Customer export CSV discovered on a public paste site', description: 'A partner notified us that a CSV containing ~3,200 customer names, emails and phone numbers was posted publicly. Column headers match our CRM export format.', type: 'DATA_BREACH', severity: 'CRITICAL', status: 'INVESTIGATING', reporterId: 4, assigneeId: 1, ageHours: 14, updatedHoursAgo: 1 },
{ id: 1046, title: 'Shared admin password posted in team chat', description: 'The firewall admin password was pasted into the #infra-ops channel, which has 60+ members including external contractors.', type: 'PASSWORD_COMPROMISE', severity: 'HIGH', status: 'RESOLVED', reporterId: 6, assigneeId: 3, ageHours: 216, updatedHoursAgo: 150 },
{ id: 1047, title: 'USB device triggered autorun on reception kiosk', description: 'A visitor plugged a USB stick into the reception kiosk. A command window flashed briefly before the session locked.', type: 'MALWARE', severity: 'MEDIUM', status: 'CLOSED', reporterId: 7, assigneeId: 8, ageHours: 504, updatedHoursAgo: 430 },
{ id: 1048, title: 'MFA fatigue attack — 37 push prompts to the CFO account', description: 'The CFO received 37 MFA push notifications between 02:10 and 02:25. None were approved according to her, but she wants this checked urgently.', type: 'SUSPICIOUS_LOGIN', severity: 'CRITICAL', status: 'REPORTED', reporterId: 5, assigneeId: null, ageHours: 2, updatedHoursAgo: 2 },
{ id: 1049, title: 'Spoofed vendor invoice requesting bank account change', description: 'An email that appeared to come from our packaging supplier asked us to update their IBAN. The reply-to address was a lookalike domain.', type: 'PHISHING', severity: 'MEDIUM', status: 'RESOLVED', reporterId: 4, assigneeId: 1, ageHours: 288, updatedHoursAgo: 240 },
{ id: 1050, title: 'Unknown SSH key added to the build server', description: 'Configuration drift scan found an authorized_keys entry for user "deploy" on build-02 that is not in our infrastructure-as-code repository.', type: 'UNAUTHORIZED_ACCESS', severity: 'HIGH', status: 'INVESTIGATING', reporterId: 3, assigneeId: 8, ageHours: 72, updatedHoursAgo: 8 },
{ id: 1051, title: 'Browser extension exfiltrating session cookies', description: 'A "PDF converter" Chrome extension installed on several marketing laptops makes requests to an unknown domain with cookie payloads.', type: 'MALWARE', severity: 'HIGH', status: 'TRIAGED', reporterId: 6, assigneeId: 3, ageHours: 20, updatedHoursAgo: 12 },
{ id: 1052, title: 'Laptop reported stolen from parked vehicle', description: 'Company laptop stolen from a car outside a client site. Device is BitLocker-encrypted.', type: 'OTHER', severity: 'LOW', status: 'CLOSED', reporterId: 5, assigneeId: 1, ageHours: 624, updatedHoursAgo: 600 },
{ id: 1053, title: 'QR-code phishing poster in the parking garage', description: 'Poster offering "free parking validation" links to a page requesting corporate credentials.', type: 'PHISHING', severity: 'LOW', status: 'RESOLVED', reporterId: 7, assigneeId: 8, ageHours: 408, updatedHoursAgo: 380 },
{ id: 1054, title: 'Ransomware note on shared drive \\\\fs02\\design', description: 'Files in the design share were renamed with a .lck extension and a README_RESTORE.txt appeared. Two users reported being unable to open files.', type: 'MALWARE', severity: 'CRITICAL', status: 'RESOLVED', reporterId: 4, assigneeId: 3, ageHours: 144, updatedHoursAgo: 40 },
{ id: 1055, title: 'Password reuse detected in breach corpus (42 accounts)', description: 'Credential monitoring matched 42 corporate emails with passwords from a third-party breach dataset.', type: 'PASSWORD_COMPROMISE', severity: 'MEDIUM', status: 'INVESTIGATING', reporterId: 1, assigneeId: 1, ageHours: 96, updatedHoursAgo: 20 },
{ id: 1056, title: 'Service account used interactively at 03:12', description: 'svc-backup logged into a jump host via RDP at 03:12. This account should only run scheduled jobs.', type: 'SUSPICIOUS_LOGIN', severity: 'MEDIUM', status: 'REPORTED', reporterId: 6, assigneeId: null, ageHours: 9, updatedHoursAgo: 9 },
{ id: 1057, title: 'Storage bucket listing exposed via misconfigured policy', description: 'Object storage bucket "helix-reports-archive" allowed anonymous list operations after a policy change.', type: 'DATA_BREACH', severity: 'HIGH', status: 'CONTAINED', reporterId: 3, assigneeId: 8, ageHours: 168, updatedHoursAgo: 30 },
{ id: 1058, title: 'Suspicious OAuth consent grant to "DocuSlgn"', description: 'I clicked "Accept" on a permissions screen for an app named DocuSlgn that asked to read my mail and files. The name looked slightly off afterwards.', type: 'PHISHING', severity: 'HIGH', status: 'REPORTED', reporterId: 7, assigneeId: null, ageHours: 1, updatedHoursAgo: 1 },
{ id: 1059, title: 'Former employee badge used at the loading dock', description: 'Access logs show a badge belonging to an employee who left in March was used at dock door 3.', type: 'UNAUTHORIZED_ACCESS', severity: 'MEDIUM', status: 'TRIAGED', reporterId: 5, assigneeId: 3, ageHours: 28, updatedHoursAgo: 22 },
{ id: 1060, title: 'Tailgating observed at the server room door', description: 'An unbadged person followed an engineer into the server room. They left after ~2 minutes.', type: 'OTHER', severity: 'LOW', status: 'REPORTED', reporterId: 4, assigneeId: null, ageHours: 70, updatedHoursAgo: 70 },
{ id: 1061, title: 'Cryptominer process on GPU render node', description: 'render-07 showed 100% GPU utilisation overnight with a process named "xmrig-cuda".', type: 'MALWARE', severity: 'MEDIUM', status: 'CLOSED', reporterId: 6, assigneeId: 8, ageHours: 360, updatedHoursAgo: 320 },
{ id: 1062, title: 'Helpdesk vishing call requesting MFA reset', description: 'Caller claiming to be a regional VP asked the helpdesk to reset their MFA device. Caller ID was spoofed.', type: 'PHISHING', severity: 'MEDIUM', status: 'TRIAGED', reporterId: 5, assigneeId: 1, ageHours: 11, updatedHoursAgo: 7 },
{ id: 1063, title: 'VPN gateway brute-force from 212 source IPs', description: 'Distributed password-spraying against the VPN gateway over 3 hours. 4 accounts were temporarily locked.', type: 'SUSPICIOUS_LOGIN', severity: 'HIGH', status: 'RESOLVED', reporterId: 8, assigneeId: 8, ageHours: 100, updatedHoursAgo: 60 },
{ id: 1064, title: 'Payroll records emailed to a personal account', description: 'DLP alert: a spreadsheet with salary data was forwarded from a finance mailbox to a personal Gmail address.', type: 'DATA_BREACH', severity: 'HIGH', status: 'TRIAGED', reporterId: 6, assigneeId: 3, ageHours: 46, updatedHoursAgo: 26 }];


export const demoInvestigationSeeds: {
  incidentId: number;
  analystId: number;
  findings: string;
  rootCause: string;
  actionsTaken: string;
  recommendations: string;
  updatedHoursAgo: number;
}[] = [
{ incidentId: 1041, analystId: 1, findings: 'Lookalike domain registered 6 days ago via a privacy-protected registrar. 14 employees received the same message; 2 submitted usernames, 0 submitted passwords per proxy logs.', rootCause: 'Gateway filtering did not flag the newly registered domain; message passed SPF for the attacker-controlled domain.', actionsTaken: 'Domain blocked at proxy and mail gateway. Message purged from all mailboxes. Forced session revocation for the 2 affected users.', recommendations: 'Enable newly-registered-domain quarantine. Run targeted payroll-themed awareness module for finance.', updatedHoursAgo: 3 },
{ incidentId: 1042, analystId: 3, findings: 'PowerShell spawned from WINWORD.EXE downloaded a second-stage DLL. No lateral movement observed in 48h of EDR telemetry.', rootCause: 'Macros allowed for the finance OU via a legacy GPO exception.', actionsTaken: 'Host isolated and reimaged. Hash and C2 domains added to blocklists. Legacy GPO exception removed.', recommendations: 'Block macros from internet-origin files organisation-wide. Review remaining GPO exceptions.', updatedHoursAgo: 6 },
{ incidentId: 1045, analystId: 1, findings: 'Export matches a CRM report generated on the 2nd by a sales operations account. Account shows a sign-in from an unmanaged device the same day.', rootCause: 'Under investigation — likely compromised sales-ops credentials combined with absent device-trust policy on the CRM.', actionsTaken: 'Paste removal requested and confirmed. Sales-ops account disabled pending review. CRM export permission restricted to 3 named users.', recommendations: 'Enforce device compliance for CRM access. Notify DPO to assess regulatory notification obligations.', updatedHoursAgo: 1 },
{ incidentId: 1050, analystId: 8, findings: 'Key fingerprint not associated with any employee. Added 9 days ago during a maintenance window; no commands logged from the key yet.', rootCause: 'Deployment user writable authorized_keys and no file-integrity monitoring on build hosts.', actionsTaken: 'Key removed, deploy user rotated, build-02 snapshot preserved for forensics.', recommendations: 'Manage authorized_keys via configuration management only; enable FIM on all build hosts.', updatedHoursAgo: 8 },
{ incidentId: 1055, analystId: 1, findings: '42 accounts matched; 11 still used the exact breached password. None show anomalous sign-ins.', rootCause: 'Password reuse across personal and corporate services.', actionsTaken: 'Forced password reset for all 42 accounts. Added breached-password screening at reset.', recommendations: 'Roll out passkeys for high-privilege groups first.', updatedHoursAgo: 20 },
{ incidentId: 1057, analystId: 8, findings: 'Bucket was listable for 41 hours. Access logs show 3 anonymous LIST calls from a scanner ASN; no GET of objects.', rootCause: 'Policy template copied from a public-assets bucket during reorganisation.', actionsTaken: 'Public access block re-enabled; policy reverted; account-level public access block enforced.', recommendations: 'Add policy-as-code check in CI to reject anonymous principals.', updatedHoursAgo: 30 }];


export const demoEvidenceSeeds: {
  id: number;
  incidentId: number;
  fileName: string;
  contentType: string;
  size: number;
  uploadedById: number;
  hoursAgo: number;
  sha256: string;
}[] = [
{ id: 501, incidentId: 1041, fileName: 'payroll-email-headers.txt', contentType: 'text/plain', size: 6214, uploadedById: 4, hoursAgo: 29, sha256: '9f2c41a7e0b3d6f8a1c5e9b2d4f7a0c3e6b9d2f5a8c1e4b7d0f3a6c9e2b5d8f1' },
{ id: 502, incidentId: 1041, fileName: 'fake-sso-page.png', contentType: 'image/png', size: 482_113, uploadedById: 4, hoursAgo: 29, sha256: '1a4d7b0e3c6f9a2d5b8e1c4f7a0d3b6e9c2f5a8d1b4e7c0f3a6d9b2e5c8f1a4d' },
{ id: 503, incidentId: 1042, fileName: 'edr-process-tree.pdf', contentType: 'application/pdf', size: 1_204_551, uploadedById: 3, hoursAgo: 48, sha256: 'c3f6a9d2b5e8c1f4a7d0b3e6c9f2a5d8b1e4c7f0a3d6b9e2c5f8a1d4b7e0c3f6' },
{ id: 504, incidentId: 1045, fileName: 'paste-site-capture.png', contentType: 'image/png', size: 903_420, uploadedById: 4, hoursAgo: 13, sha256: 'e5b8c1f4a7d0e3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1d4e7b0c3f6a9d2e5b8' },
{ id: 505, incidentId: 1045, fileName: 'crm-export-audit.csv', contentType: 'text/csv', size: 18_330, uploadedById: 1, hoursAgo: 4, sha256: '7d0a3f6c9e2b5d8a1f4c7e0b3d6a9f2c5e8b1d4a7f0c3e6b9d2a5f8c1e4b7d0a' },
{ id: 506, incidentId: 1050, fileName: 'authorized_keys-diff.txt', contentType: 'text/plain', size: 1_120, uploadedById: 8, hoursAgo: 70, sha256: 'b2e5f8a1d4c7b0e3f6a9d2c5b8e1f4a7d0c3b6e9f2a5d8c1b4e7f0a3d6c9b2e5' },
{ id: 507, incidentId: 1048, fileName: 'mfa-push-log.csv', contentType: 'text/csv', size: 4_802, uploadedById: 5, hoursAgo: 2, sha256: '4c7f0a3d6b9e2c5f8a1d4b7e0c3f6a9d2b5e8c1f4a7d0b3e6c9f2a5d8b1e4c7f' }];


export const demoAuditSeeds: {
  action: string;
  actorId: number | null;
  entityType: string;
  entityId: string;
  details: string;
  ip: string;
  hoursAgo: number;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
}[] = [
{ action: 'LOGIN_FAILURE', actorId: null, entityType: 'USER', entityId: 'admin', details: 'Invalid credentials for username "admin"', ip: '185.220.101.44', hoursAgo: 0.6, outcome: 'FAILURE' },
{ action: 'LOGIN_FAILURE', actorId: null, entityType: 'USER', entityId: 'admin', details: 'Invalid credentials for username "admin"', ip: '185.220.101.44', hoursAgo: 0.62, outcome: 'FAILURE' },
{ action: 'INVESTIGATION_UPDATED', actorId: 1, entityType: 'INCIDENT', entityId: '1045', details: 'Updated findings and actions taken', ip: '10.20.4.18', hoursAgo: 1, outcome: 'SUCCESS' },
{ action: 'EVIDENCE_UPLOADED', actorId: 5, entityType: 'INCIDENT', entityId: '1048', details: 'Uploaded mfa-push-log.csv (4.7 KB)', ip: '10.20.9.77', hoursAgo: 2, outcome: 'SUCCESS' },
{ action: 'AI_ANALYSIS_REQUESTED', actorId: 1, entityType: 'INCIDENT', entityId: '1045', details: 'Analyze incident via Copilot', ip: '10.20.4.18', hoursAgo: 2.5, outcome: 'SUCCESS' },
{ action: 'STATUS_CHANGED', actorId: 1, entityType: 'INCIDENT', entityId: '1041', details: 'TRIAGED → INVESTIGATING', ip: '10.20.4.18', hoursAgo: 3, outcome: 'SUCCESS' },
{ action: 'EVIDENCE_DOWNLOADED', actorId: 1, entityType: 'INCIDENT', entityId: '1045', details: 'Downloaded paste-site-capture.png', ip: '10.20.4.18', hoursAgo: 3.5, outcome: 'SUCCESS' },
{ action: 'ACCESS_DENIED', actorId: 7, entityType: 'INCIDENT', entityId: '1042', details: 'Employee attempted to view incident owned by another user', ip: '10.20.11.3', hoursAgo: 4, outcome: 'DENIED' },
{ action: 'STATUS_CHANGED', actorId: 3, entityType: 'INCIDENT', entityId: '1042', details: 'INVESTIGATING → CONTAINED', ip: '10.20.4.52', hoursAgo: 6, outcome: 'SUCCESS' },
{ action: 'INCIDENT_ASSIGNED', actorId: 1, entityType: 'INCIDENT', entityId: '1062', details: 'Assigned to Maya Chen', ip: '10.20.4.18', hoursAgo: 7, outcome: 'SUCCESS' },
{ action: 'INVESTIGATION_UPDATED', actorId: 8, entityType: 'INCIDENT', entityId: '1050', details: 'Updated root cause', ip: '10.20.4.90', hoursAgo: 8, outcome: 'SUCCESS' },
{ action: 'LOGIN_SUCCESS', actorId: 2, entityType: 'USER', entityId: '2', details: 'Interactive sign-in', ip: '10.20.1.5', hoursAgo: 9, outcome: 'SUCCESS' },
{ action: 'ROLE_CHANGED', actorId: 2, entityType: 'USER', entityId: '8', details: 'EMPLOYEE → ANALYST', ip: '10.20.1.5', hoursAgo: 26, outcome: 'SUCCESS' },
{ action: 'STATUS_CHANGED', actorId: 3, entityType: 'INCIDENT', entityId: '1054', details: 'CONTAINED → RESOLVED', ip: '10.20.4.52', hoursAgo: 40, outcome: 'SUCCESS' },
{ action: 'EXPORT_REQUESTED', actorId: 2, entityType: 'AUDIT_LOG', entityId: '-', details: 'Exported 30-day audit trail', ip: '10.20.1.5', hoursAgo: 52, outcome: 'SUCCESS' },
{ action: 'STATUS_CHANGED', actorId: 8, entityType: 'INCIDENT', entityId: '1063', details: 'CONTAINED → RESOLVED', ip: '10.20.4.90', hoursAgo: 60, outcome: 'SUCCESS' },
{ action: 'LOGIN_FAILURE', actorId: null, entityType: 'USER', entityId: 'svc-backup', details: 'Interactive login blocked for service account', ip: '10.30.2.14', hoursAgo: 75, outcome: 'DENIED' },
{ action: 'AI_REMEDIATION_REQUESTED', actorId: 3, entityType: 'INCIDENT', entityId: '1054', details: 'Generate remediation plan via Copilot', ip: '10.20.4.52', hoursAgo: 120, outcome: 'SUCCESS' },
{ action: 'ROLE_CHANGED', actorId: 2, entityType: 'USER', entityId: '3', details: 'EMPLOYEE → ANALYST', ip: '10.20.1.5', hoursAgo: 260, outcome: 'SUCCESS' }];