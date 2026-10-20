import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlagIcon, PaperclipIcon, ScanSearchIcon, GitCommitHorizontalIcon, UserCheckIcon, BrainCircuitIcon, ShieldAlertIcon, PencilLineIcon, BoxIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { fmtDateTime, relTime } from "../../utils/format";
import { TimelineEvent, TimelineKind } from "../../utils/timeline";
const KIND: Record<TimelineKind, {
  icon: BoxIcon;
  tone: string;
}> = {
  reported: {
    icon: FlagIcon,
    tone: 'text-ink'
  },
  evidence: {
    icon: PaperclipIcon,
    tone: 'text-muted'
  },
  investigation: {
    icon: ScanSearchIcon,
    tone: 'text-accent'
  },
  status: {
    icon: GitCommitHorizontalIcon,
    tone: 'text-accent'
  },
  assigned: {
    icon: UserCheckIcon,
    tone: 'text-muted'
  },
  ai: {
    icon: BrainCircuitIcon,
    tone: 'text-muted'
  },
  access: {
    icon: ShieldAlertIcon,
    tone: 'text-crit'
  },
  update: {
    icon: PencilLineIcon,
    tone: 'text-muted'
  }
};
export function IncidentTimeline({
  events


}: {events: TimelineEvent[];}) {
  const reduce = useReducedMotion();
  return <ol className="relative">
      {events.map((e, i) => {
      const k = KIND[e.kind];
      return <motion.li key={e.id} initial={reduce ? false : {
        opacity: 0,
        x: -6
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.24,
        delay: Math.min(i * 0.04, 0.3),
        ease: [0.23, 1, 0.32, 1]
      }} className="relative flex gap-4 pb-6 last:pb-0">
            {i < events.length - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-20px)] w-px bg-line" aria-hidden />}
            <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-base">
              <k.icon className={twMerge('h-3.5 w-3.5', k.tone)} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <p className="text-sm font-medium text-ink">{e.title}</p>
                <time dateTime={e.at} title={fmtDateTime(e.at)} className="font-mono text-2xs text-faint">
                  {relTime(e.at)}
                </time>
              </div>
              {(e.detail || e.actor) && <p className="mt-0.5 text-sm text-muted">
                  {e.detail}
                  {e.detail && e.actor ? ' · ' : ''}
                  {e.actor && <span className="text-faint">{e.actor}</span>}
                </p>}
            </div>
          </motion.li>;
    })}
    </ol>;
}