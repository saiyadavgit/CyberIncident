import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { BrainCircuitIcon, ScanSearchIcon, WrenchIcon, FileTextIcon, CopyIcon, RotateCwIcon, InfoIcon, PlayIcon, BoxIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useCopilot } from "./useCopilot";
import { AiOutput } from "./AiOutput";
import { RiskSignals } from "../incidents/RiskSignals";
import { Button } from "../ui/Button";
import { ErrorState } from "../ui/ErrorState";
import { computeRiskSignals } from "../../utils/riskSignals";
import { SEVERITY_META, STATUS_META, TYPE_META } from "../../utils/incidentMeta";
import { incidentCode } from "../../utils/format";
import { CopilotMode } from "../../services/aiService";
import { Incident } from "../../types/incident";
const MODES: {
  id: CopilotMode;
  label: string;
  action: string;
  icon: BoxIcon;
  description: string;
}[] = [{
  id: 'analyze',
  label: 'Threat analysis',
  action: 'Analyze incident',
  icon: ScanSearchIcon,
  description: 'Classifies the attack pattern, key indicators, likely impact and a suggested response priority.'
}, {
  id: 'remediation',
  label: 'Remediation plan',
  action: 'Generate plan',
  icon: WrenchIcon,
  description: 'Ordered containment, eradication and recovery steps tailored to this incident.'
}, {
  id: 'summarize',
  label: 'Investigation brief',
  action: 'Summarize investigation',
  icon: FileTextIcon,
  description: 'Condenses documented findings, root cause and actions into a briefing for stakeholders.'
}];
interface CopilotConsoleProps {
  incident: Incident;
  evidenceCount: number | null;
  variant?: 'panel' | 'full';
  defaultMode?: CopilotMode;
  className?: string;
}
export function CopilotConsole({
  incident,
  evidenceCount,
  variant = 'panel',
  defaultMode = 'analyze',
  className
}: CopilotConsoleProps) {
  const [mode, setMode] = useState<CopilotMode>(defaultMode);
  const {
    runs,
    run
  } = useCopilot(incident.id);
  const current = runs[mode];
  const meta = MODES.find((m) => m.id === mode) ?? MODES[0];
  const signals = useMemo(() => computeRiskSignals(incident, evidenceCount), [incident, evidenceCount]);
  const full = variant === 'full';
  const copy = async () => {
    if (!current.text) return;
    try {
      await navigator.clipboard.writeText(current.text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Clipboard unavailable');
    }
  };
  return <section aria-label="AI Copilot" className={twMerge('flex flex-col rounded-xl border border-line bg-surface', className)}>
      <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/30 bg-accent/[0.08]">
            <BrainCircuitIcon className="h-4 w-4 text-accent" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">Copilot</h2>
            <p className="text-2xs text-faint">SOC intelligence console</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded border border-med/40 px-2 py-1 font-mono text-[10px] text-med" title="AI output is advisory. It never changes severity, status, assignment or evidence.">
          <InfoIcon className="h-3 w-3" aria-hidden />
          Advisory only
        </span>
      </header>

      <div className="border-b border-line bg-base/40 px-5 py-2.5 font-mono text-2xs text-muted">
        <span className="text-faint">Context </span>
        {incidentCode(incident.id)} · {TYPE_META[incident.type].label} ·{' '}
        <span className={SEVERITY_META[incident.severity].text}>{SEVERITY_META[incident.severity].label}</span> · {STATUS_META[incident.status].label}
        {evidenceCount !== null && ` · ${evidenceCount} evidence`}
      </div>

      <div className={twMerge('grid', full ? 'lg:grid-cols-[300px_1fr]' : '')}>
        <div className={twMerge('px-5 py-4', full ? 'border-b border-line lg:border-b-0 lg:border-r' : 'border-b border-line')}>
          <p className="mb-1 text-xs font-medium text-ink">Risk indicators</p>
          <p className="mb-2 text-2xs text-faint">Computed from the incident record, not the model.</p>
          <RiskSignals signals={signals} columns={1} />
        </div>

        <div className="flex min-w-0 flex-col">
          <div role="tablist" aria-label="Copilot actions" className="flex gap-1 border-b border-line px-3 pt-2">
            {MODES.map((m) => {
            const active = m.id === mode;
            const r = runs[m.id];
            return <button key={m.id} role="tab" type="button" aria-selected={active} onClick={() => setMode(m.id)} className={twMerge('relative flex items-center gap-2 whitespace-nowrap px-2.5 pb-2.5 pt-1.5 text-xs font-medium transition-colors duration-150 ease-out', active ? 'text-ink' : 'text-muted hover:text-ink')}>
                  <m.icon className={twMerge('h-3.5 w-3.5', active ? 'text-accent' : '')} aria-hidden />
                  <span className={full ? '' : 'hidden sm:inline xl:hidden 2xl:inline'}>{m.label}</span>
                  {r.state === 'done' && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Result ready" />}
                  {r.state === 'loading' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-med" aria-label="Running" />}
                  {active && <motion.span layoutId={`copilot-tab-${incident.id}-${variant}`} className="absolute inset-x-1 -bottom-px h-[2px] bg-accent" />}
                </button>;
          })}
          </div>

          <div className={twMerge('flex-1 px-5 py-5', full ? 'min-h-[420px]' : 'min-h-[300px]')} role="tabpanel" aria-live="polite" aria-busy={current.state === 'loading'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${mode}-${current.state}`} initial={{
              opacity: 0,
              y: 4
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.18,
              ease: [0.23, 1, 0.32, 1]
            }}>
                {current.state === 'idle' && <div className="flex flex-col items-start">
                    <p className="text-sm font-medium text-ink">{meta.label}</p>
                    <p className="mt-1 max-w-md text-sm text-muted">{meta.description}</p>
                    {mode === 'summarize' && !incident.investigation && <p className="mt-3 text-xs text-med">No investigation is documented yet — the brief will reflect the report only.</p>}
                    <Button variant="primary" icon={PlayIcon} className="mt-5" onClick={() => run(mode)}>
                      {meta.action}
                    </Button>
                    <p className="mt-4 text-2xs text-faint">Sent to the model through the Bastion API. No credentials leave the server.</p>
                  </div>}
                {current.state === 'loading' && <div className="space-y-4">
                    <p className="flex items-center gap-2 font-mono text-2xs text-accent">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inset-0 animate-ping2 rounded-full bg-accent" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
                      </span>
                      Querying model through the Bastion API
                    </p>
                    <div className="h-px overflow-hidden bg-line">
                      <div className="h-px w-1/3 animate-scan bg-accent" />
                    </div>
                    {[92, 74, 86, 58, 80].map((w, i) => <div key={i} className="h-3 rounded bg-raised" style={{
                  width: `${w}%`
                }} />)}
                  </div>}
                {current.state === 'error' && <ErrorState title="Copilot couldn't complete this request" message={current.error ?? ''} onRetry={() => run(mode)} />}
                {current.state === 'done' && current.text && <AiOutput text={current.text} emphasizeSteps={mode === 'remediation'} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {current.state === 'done' && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="font-mono text-2xs text-faint">
                Generated {current.at ? new Date(current.at).toISOString().slice(11, 16) : ''} UTC · verify before acting
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" icon={CopyIcon} onClick={copy}>
                  Copy
                </Button>
                <Button size="sm" variant="ghost" icon={RotateCwIcon} onClick={() => run(mode)}>
                  Regenerate
                </Button>
              </div>
            </footer>}
        </div>
      </div>
    </section>;
}