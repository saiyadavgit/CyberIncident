import { api } from '../utils/api';
import { extractAiText } from '../utils/aiParse';

/** All AI requests go through the Spring Boot backend; the Groq key never reaches the browser. */
export type CopilotMode = 'analyze' | 'remediation' | 'summarize';

const ENDPOINTS: Record<CopilotMode, string> = {
  analyze: '/api/ai/analyze-incident',
  remediation: '/api/ai/remediation-plan',
  summarize: '/api/ai/summarize-investigation'
};

export async function runCopilot(mode: CopilotMode, incidentId: number): Promise<string> {
  const { data } = await api.post(ENDPOINTS[mode], { incidentId }, { timeout: 90000 });
  return extractAiText(data);
}

export const analyzeIncident = (incidentId: number) => runCopilot('analyze', incidentId);
export const generateRemediationPlan = (incidentId: number) => runCopilot('remediation', incidentId);
export const summarizeInvestigation = (incidentId: number) => runCopilot('summarize', incidentId);