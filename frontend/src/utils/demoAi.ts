/** Demo-only advisory text so the Copilot console can be previewed without the Groq-backed backend. */
import type { IncidentType, Severity } from '../types/incident';

interface DemoAiIncident {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  status: string;
  hasInvestigation: boolean;
  findings?: string;
  rootCause?: string;
  actionsTaken?: string;
}

const VECTOR: Record<IncidentType, {tactic: string;indicators: string[];contain: string[];eradicate: string[];}> = {
  PHISHING: {
    tactic: 'Initial Access — Phishing (T1566)',
    indicators: ['Sender domain age and lookalike spelling', 'Credential-entry pages hosted outside corporate SSO', 'Same lure delivered to multiple recipients'],
    contain: ['Block sender domain and landing URLs at mail gateway and web proxy', 'Purge the message from all mailboxes', 'Revoke active sessions for any user who interacted with the link'],
    eradicate: ['Force credential reset with MFA re-registration for exposed users', 'Hunt for inbox rules or OAuth grants created after exposure']
  },
  MALWARE: {
    tactic: 'Execution — User Execution / Command and Scripting Interpreter (T1204, T1059)',
    indicators: ['Office or browser process spawning a script interpreter', 'Outbound connections to newly observed domains', 'Persistence via scheduled tasks or run keys'],
    contain: ['Isolate affected hosts through EDR network containment', 'Block file hashes and C2 indicators across the fleet', 'Preserve volatile memory before reimaging where feasible'],
    eradicate: ['Reimage hosts from a known-good baseline', 'Sweep the estate for matching hashes and persistence artefacts']
  },
  SUSPICIOUS_LOGIN: {
    tactic: 'Credential Access / Valid Accounts (T1078, T1621)',
    indicators: ['Geographically impossible sign-in sequence', 'Burst of MFA push requests outside working hours', 'Sign-ins from anonymising infrastructure'],
    contain: ['Revoke refresh tokens and active sessions for the account', 'Temporarily require phishing-resistant MFA for the account', 'Block offending source IPs and ASNs at the identity provider'],
    eradicate: ['Reset credentials and review recent MFA device registrations', 'Enable number-matching for push approvals']
  },
  UNAUTHORIZED_ACCESS: {
    tactic: 'Privilege Escalation / Valid Accounts (T1078)',
    indicators: ['Access outside the principal’s role or project scope', 'Credentials or keys not present in the source of truth', 'Use of dormant or deprovisioned identities'],
    contain: ['Suspend the identity or credential in question', 'Restrict the affected resource to named owners', 'Snapshot affected systems for forensic review'],
    eradicate: ['Remove unmanaged keys and stale entitlements', 'Re-run access certification for the affected resource']
  },
  DATA_BREACH: {
    tactic: 'Exfiltration / Collection (T1530, T1567)',
    indicators: ['Data matching internal export formats in external locations', 'Bulk export or download events preceding disclosure', 'Access from unmanaged devices'],
    contain: ['Request takedown of exposed data and confirm removal', 'Disable or restrict the accounts and exports involved', 'Lock down public sharing on the affected data store'],
    eradicate: ['Rotate any secrets present in the exposed data', 'Engage privacy/legal to assess notification obligations']
  },
  PASSWORD_COMPROMISE: {
    tactic: 'Credential Access — Unsecured Credentials (T1552)',
    indicators: ['Credentials shared in chat, tickets, or code', 'Matches against breach corpora', 'Shared or long-lived privileged passwords'],
    contain: ['Rotate exposed credentials immediately', 'Review authentication logs for use since exposure', 'Delete or redact the exposed secret at source'],
    eradicate: ['Move privileged credentials into a vault with checkout', 'Enable breached-password screening at reset']
  },
  OTHER: {
    tactic: 'Unclassified — requires analyst classification',
    indicators: ['Physical or procedural control failure', 'Potential follow-on digital activity'],
    contain: ['Confirm scope with the reporter and facilities/IT owners', 'Review relevant physical and logical access logs'],
    eradicate: ['Address the underlying control gap', 'Brief affected teams']
  }
};

const PRIORITY: Record<Severity, string> = {
  CRITICAL: 'P1 — act within 1 hour',
  HIGH: 'P2 — act within 4 hours',
  MEDIUM: 'P3 — act within 1 business day',
  LOW: 'P4 — schedule within the week'
};

export function demoAiResponse(mode: 'analyze' | 'remediation' | 'summarize', inc: DemoAiIncident): string {
  const v = VECTOR[inc.type];
  if (mode === 'analyze') {
    return [
    '## Assessment',
    `INC-${String(inc.id).padStart(5, '0')} is consistent with ${v.tactic}. Reported severity ${inc.severity} appears appropriate given the described exposure; current status is ${inc.status}.`,
    '## Key indicators',
    ...v.indicators.map((i) => `- ${i}`),
    '## Likely impact',
    `- Confidentiality: ${inc.type === 'DATA_BREACH' || inc.type === 'PHISHING' ? 'High' : 'Moderate'}`,
    `- Integrity: ${inc.type === 'MALWARE' || inc.type === 'UNAUTHORIZED_ACCESS' ? 'High' : 'Low'}`,
    `- Availability: ${inc.type === 'MALWARE' ? 'Moderate' : 'Low'}`,
    '## Open questions',
    '- Were any credentials, tokens, or files confirmed as exposed?',
    '- Did any other users or hosts show the same indicators in the last 72 hours?',
    '## Suggested priority',
    `- ${PRIORITY[inc.severity]}`].
    join('\n');
  }
  if (mode === 'remediation') {
    return [
    '## Immediate containment',
    ...v.contain.map((s, i) => `${i + 1}. ${s}`),
    '## Eradication',
    ...v.eradicate.map((s, i) => `${i + 1}. ${s}`),
    '## Recovery',
    '1. Restore affected users and systems once indicators are cleared',
    '2. Monitor the affected identities and hosts with elevated alerting for 14 days',
    '## Prevention',
    '- Document the control gap and assign an owner with a due date',
    '- Add detection content for the observed indicators'].
    join('\n');
  }
  if (!inc.hasInvestigation) {
    return [
    '## Investigation summary',
    'No investigation record has been documented for this incident yet. The summary below reflects the incident report only.',
    '## Reported facts',
    `- ${inc.description}`,
    '## Next step',
    '- Open the investigation workspace and record findings, root cause, and actions taken.'].
    join('\n');
  }
  return [
  '## Investigation summary',
  `${inc.title}. Investigation is in progress with documented findings and containment actions.`,
  '## Findings',
  `- ${inc.findings}`,
  '## Root cause',
  `- ${inc.rootCause}`,
  '## Actions taken',
  `- ${inc.actionsTaken}`,
  '## Gaps',
  '- Confirm closure criteria and evidence of control remediation before moving to RESOLVED.'].
  join('\n');
}