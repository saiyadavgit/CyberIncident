import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, PlusIcon, ShieldCheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getMyIncidents } from '../../services/incidentService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Panel } from '../../components/ui/Panel';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LifecycleTrack } from '../../components/incidents/LifecycleTrack';
import { LifecyclePipeline } from '../../components/charts/LifecyclePipeline';
import { INCIDENT_TYPES, STATUS_META, TYPE_META, isOpen } from '../../utils/incidentMeta';
import { byLastActivity, countByStatus } from '../../utils/incidentStats';
import { incidentCode, relTime } from '../../utils/format';

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { data, error, reload } = useAsync(getMyIncidents, []);
  const [showClosed, setShowClosed] = useState(false);
  const rootRef = useStaggerReveal<HTMLDivElement>(Boolean(data));

  const { open, closed, status } = useMemo(() => {
    const all = [...(data ?? [])].sort(byLastActivity);
    return { open: all.filter((i) => isOpen(i.status)), closed: all.filter((i) => !isOpen(i.status)), status: countByStatus(all) };
  }, [data]);

  const firstName = user?.fullName.split(' ')[0] ?? '';

  return (
    <div ref={rootRef}>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description={data ? open.length ? `${open.length} of your reports ${open.length === 1 ? 'is' : 'are'} being worked on.` : 'None of your reports need attention right now.' : 'Loading your reports…'}
        actions={
        <ButtonLink to="/employee/report" variant="primary" icon={PlusIcon}>
            Report an incident
          </ButtonLink>
        } />
      

      {error && !data ?
      <ErrorState message={error} onRetry={reload} /> :
      !data ?
      <LoadingState rows={5} /> :

      <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section data-reveal aria-labelledby="open-h">
              <h2 id="open-h" className="mb-3 text-sm font-semibold text-ink">
                In progress <span className="ml-1 font-mono text-xs text-faint">{open.length}</span>
              </h2>
              {open.length === 0 ?
            <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-6">
                  <ShieldCheckIcon className="h-6 w-6 shrink-0 text-ok" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-ink">Nothing open</p>
                    <p className="text-sm text-muted">Spotted something suspicious? Reporting early is the best defence.</p>
                  </div>
                </div> :

            <ul className="space-y-3">
                  {open.map((inc) =>
              <li key={inc.id}>
                      <Link to={`/incidents/${inc.id}`} className="block rounded-xl border border-line bg-surface p-5 transition-colors duration-150 ease-out hover:border-line-strong">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-2xs text-faint">
                              {incidentCode(inc.id)} · {TYPE_META[inc.type].label}
                            </p>
                            <p className="mt-1 text-[15px] font-medium text-ink">{inc.title}</p>
                          </div>
                          <SeverityBadge severity={inc.severity} />
                        </div>
                        <LifecycleTrack status={inc.status} className="mt-5" />
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs">
                          <span className="text-muted">{inc.assignee ? `Handled by ${inc.assignee.name}` : 'Waiting for the security team to triage'}</span>
                          <span className="font-mono text-2xs text-faint">Updated {relTime(inc.updatedAt ?? inc.createdAt)}</span>
                        </div>
                      </Link>
                    </li>
              )}
                </ul>
            }
            </section>

            {closed.length > 0 &&
          <section data-reveal className="rounded-xl border border-line bg-surface">
                <button
              type="button"
              aria-expanded={showClosed}
              onClick={() => setShowClosed((s) => !s)}
              className="flex w-full items-center justify-between px-5 py-4 text-left">
              
                  <span className="text-sm font-semibold text-ink">
                    Closed out <span className="ml-1 font-mono text-xs text-faint">{closed.length}</span>
                  </span>
                  <ChevronDownIcon className={twMerge('h-4 w-4 text-muted transition-transform duration-200 ease-out', showClosed ? 'rotate-180' : '')} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {showClosed &&
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="divide-y divide-line overflow-hidden border-t border-line">
                
                      {closed.map((inc) =>
                <li key={inc.id}>
                          <Link to={`/incidents/${inc.id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-raised/50">
                            <span className="min-w-0">
                              <span className="font-mono text-2xs text-faint">{incidentCode(inc.id)}</span>
                              <span className="block truncate text-sm text-muted">{inc.title}</span>
                            </span>
                            <StatusBadge status={inc.status} />
                          </Link>
                        </li>
                )}
                    </motion.ul>
              }
                </AnimatePresence>
              </section>
          }
          </div>

          <div className="space-y-6">
            <div data-reveal>
              <Panel title="Where your reports are" subtitle={`${data.length} total`}>
                <div className="pt-4">
                  <LifecyclePipeline counts={status} />
                </div>
              </Panel>
            </div>
            <div data-reveal>
              <Panel title="Report something" subtitle="Start a report with the type already selected">
                <ul className="-mx-2">
                  {INCIDENT_TYPES.filter((t) => t !== 'OTHER').map((t) => {
                  const Icon = TYPE_META[t].icon;
                  return (
                    <li key={t}>
                        <Link to={`/employee/report?type=${t}`} className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 ease-out hover:bg-raised">
                          <Icon className="h-4 w-4 text-muted" aria-hidden />
                          <span className="flex-1 text-sm text-ink">{TYPE_META[t].label}</span>
                          <span className="hidden text-2xs text-faint xl:inline">{TYPE_META[t].hint}</span>
                        </Link>
                      </li>);

                })}
                </ul>
              </Panel>
            </div>
            <p data-reveal className="px-1 text-2xs text-faint">
              Statuses: {Object.values(STATUS_META).map((s) => s.label).join(' → ')}
            </p>
          </div>
        </div>
      }
    </div>);

}