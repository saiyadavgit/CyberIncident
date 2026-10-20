import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ShieldCheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { SEVERITY_META, TYPE_META, STATUS_META } from '../../utils/incidentMeta';
import { byPriority } from '../../utils/incidentStats';
import { incidentCode, relTime } from '../../utils/format';
import type { Incident } from '../../types/incident';

/** Open critical/high incidents, priority-sorted. The SOC's "act now" list. */
export function CriticalAlerts({ incidents, className }: {incidents: Incident[];className?: string;}) {
  const reduce = useReducedMotion();
  const alerts = useMemo(
    () => incidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').sort(byPriority),
    [incidents]
  );
  const critical = alerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <section data-reveal aria-label="Needs attention" className={twMerge('flex max-h-[560px] flex-col overflow-hidden rounded-xl border border-line bg-surface xl:h-[562px]', className)}>
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Needs attention</h2>
          <p className="mt-0.5 text-xs text-muted">Open critical and high-severity incidents</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-2xs">
          {critical > 0 && <span className="text-crit">{critical} critical</span>}
          <span className="text-muted">{alerts.length} total</span>
        </div>
      </header>
      {alerts.length === 0 ?
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <ShieldCheckIcon className="h-6 w-6 text-ok" aria-hidden />
          <p className="mt-3 text-sm text-ink">No critical or high incidents open</p>
          <p className="mt-1 text-xs text-muted">The queue is under control.</p>
        </div> :

      <ul className="flex-1 divide-y divide-line overflow-y-auto">
          {alerts.map((inc, i) => {
          const crit = inc.severity === 'CRITICAL';
          return (
            <motion.li
              key={inc.id}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.32), ease: [0.23, 1, 0.32, 1] }}>
              
                <Link to={`/incidents/${inc.id}`} className="group flex gap-3 px-5 py-3.5 transition-colors duration-150 ease-out hover:bg-raised/60">
                  <span className="relative mt-1.5 flex h-2 w-2 shrink-0">
                    {crit && <span className="absolute inset-0 animate-ping2 rounded-full bg-crit" />}
                    <span className={twMerge('relative h-2 w-2 rounded-full', SEVERITY_META[inc.severity].bg)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 font-mono text-2xs">
                      <span className="text-faint">
                        {incidentCode(inc.id)} · {TYPE_META[inc.type].code}
                      </span>
                      <span className="text-faint">{relTime(inc.createdAt)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink">{inc.title}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-2xs">
                      <span className={inc.assignee ? 'text-muted' : 'font-mono text-high'}>{inc.assignee ? inc.assignee.name : 'Unassigned'}</span>
                      <span className="font-mono text-muted">{STATUS_META[inc.status].label}</span>
                    </div>
                  </div>
                  <ArrowRightIcon className="mt-5 h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100" aria-hidden />
                </Link>
              </motion.li>);

        })}
        </ul>
      }
    </section>);

}