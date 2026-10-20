import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { LIFECYCLE, STATUS_META, isOpen } from '../../utils/incidentMeta';
import type { IncidentStatus } from '../../types/incident';

interface LifecyclePipelineProps {
  counts: Record<string, number>;
  onSelect?: (status: IncidentStatus) => void;
}

/** Shows where work is piling up across the incident lifecycle. */
export function LifecyclePipeline({ counts, onSelect }: LifecyclePipelineProps) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...LIFECYCLE.map((s) => counts[s] ?? 0));
  return (
    <div>
      <div className="grid grid-cols-6 items-end gap-2">
        {LIFECYCLE.map((s, i) => {
          const v = counts[s] ?? 0;
          const open = isOpen(s);
          const inner =
          <>
              <span className={twMerge('font-mono text-xl font-medium tabular', open ? 'text-ink' : 'text-muted')}>{v}</span>
              <div className="mt-2 flex h-16 items-end">
                <motion.div
                initial={reduce ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                style={{ height: `${Math.max(4, v / max * 100)}%`, transformOrigin: 'bottom' }}
                className={twMerge(
                  'w-full rounded-t-sm transition-colors duration-150 ease-out',
                  open ? 'bg-accent/70 group-hover:bg-accent' : 'bg-line-strong group-hover:bg-faint'
                )} />
              
              </div>
              <span className="mt-2 truncate font-mono text-[10px] text-muted sm:text-2xs">{STATUS_META[s].label}</span>
            </>;

          return onSelect ?
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            aria-label={`${v} ${STATUS_META[s].label}`}
            className="group flex flex-col items-stretch text-left">
            
              {inner}
            </button> :

          <div key={s} className="group flex flex-col items-stretch">
              {inner}
            </div>;

        })}
      </div>
      <div className="mt-3 grid grid-cols-6 gap-2 font-mono text-[10px] text-faint">
        <span className="col-span-4 border-t border-accent/40 pt-1.5">Open</span>
        <span className="col-span-2 border-t border-line-strong pt-1.5">Closed out</span>
      </div>
    </div>);

}