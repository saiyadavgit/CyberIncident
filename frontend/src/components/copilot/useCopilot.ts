import { useCallback, useEffect, useState } from 'react';
import { runCopilot, type CopilotMode } from '../../services/aiService';
import { getErrorMessage, getStatus } from '../../utils/api';

export interface CopilotRun {
  state: 'idle' | 'loading' | 'done' | 'error';
  text?: string;
  error?: string;
  at?: string;
}

const IDLE: CopilotRun = { state: 'idle' };

/** Holds one advisory result per mode. Results are never written back to the incident. */
export function useCopilot(incidentId: number | null) {
  const [runs, setRuns] = useState<Record<CopilotMode, CopilotRun>>({ analyze: IDLE, remediation: IDLE, summarize: IDLE });

  useEffect(() => {
    setRuns({ analyze: IDLE, remediation: IDLE, summarize: IDLE });
  }, [incidentId]);

  const run = useCallback(
    async (mode: CopilotMode) => {
      if (!incidentId) return;
      setRuns((r) => ({ ...r, [mode]: { state: 'loading' } }));
      try {
        const text = await runCopilot(mode, incidentId);
        setRuns((r) => ({ ...r, [mode]: { state: 'done', text, at: new Date().toISOString() } }));
      } catch (e) {
        const msg = getStatus(e) === 403 ? "Your role isn't permitted to run this Copilot action on this incident." : getErrorMessage(e, 'Copilot request failed.');
        setRuns((r) => ({ ...r, [mode]: { state: 'error', error: msg } }));
      }
    },
    [incidentId]
  );

  return { runs, run };
}