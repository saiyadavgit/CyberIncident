import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRightIcon, DownloadIcon, RotateCwIcon, ScrollTextIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { listAuditLogs } from '../../services/adminService';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Segmented } from '../../components/ui/Segmented';
import { SelectField } from '../../components/ui/SelectField';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { AuditActionTag } from '../../components/audit/AuditActionTag';
import { outcomeOf, toCsv } from '../../utils/audit';
import { fmtDateTime, relTime, toDate } from '../../utils/format';

type Range = '24h' | '7d' | '30d' | 'all';
type Outcome = 'all' | 'success' | 'failure' | 'denied';
const RANGE_H: Record<Range, number> = { '24h': 24, '7d': 168, '30d': 720, all: Infinity };
const PAGE = 25;

export function AuditLogsPage() {
  const { data, error, loading, reload } = useAsync(() => listAuditLogs(), []);
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('ALL');
  const [range, setRange] = useState<Range>('7d');
  const [outcome, setOutcome] = useState<Outcome>('all');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const actions = useMemo(() => Array.from(new Set((data ?? []).map((l) => l.action))).sort(), [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const since = Date.now() - RANGE_H[range] * 3_600_000;
    return (data ?? []).
    filter((l) => range === 'all' || (toDate(l.timestamp)?.getTime() ?? 0) >= since).
    filter((l) => action === 'ALL' || l.action === action).
    filter((l) => outcome === 'all' || outcomeOf(l) === outcome).
    filter((l) => !q || `${l.action} ${l.actor} ${l.entityType ?? ''} ${l.entityId ?? ''} ${l.details ?? ''} ${l.ipAddress ?? ''}`.toLowerCase().includes(q)).
    sort((a, b) => (toDate(b.timestamp)?.getTime() ?? 0) - (toDate(a.timestamp)?.getTime() ?? 0));
  }, [data, query, action, range, outcome]);

  useEffect(() => setPage(0), [query, action, range, outcome]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div>
      <PageHeader
        title="Audit trail"
        description="Immutable record of authentication, access and workflow events."
        actions={
        <>
            <Button size="sm" icon={RotateCwIcon} loading={loading && Boolean(data)} onClick={() => void reload()}>
              Refresh
            </Button>
            <Button size="sm" icon={DownloadIcon} onClick={exportCsv} disabled={!rows.length}>
              Export CSV
            </Button>
          </>
        } />
      

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <Segmented
            label="Time range"
            value={range}
            onChange={setRange}
            options={[
            { value: '24h', label: '24h' },
            { value: '7d', label: '7 days' },
            { value: '30d', label: '30 days' },
            { value: 'all', label: 'All' }]
            } />
          
          <Segmented
            label="Outcome"
            value={outcome}
            onChange={setOutcome}
            options={[
            { value: 'all', label: 'Any outcome' },
            { value: 'success', label: 'Success' },
            { value: 'failure', label: 'Failed' },
            { value: 'denied', label: 'Denied' }]
            } />
          
        </div>
        <div className="flex flex-wrap gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Actor, target, IP, details…" className="w-full sm:w-64" />
          <SelectField label="Action" value={action} onChange={setAction} className="w-56" options={[{ value: 'ALL', label: 'All actions' }, ...actions.map((a) => ({ value: a, label: a }))]} />
        </div>
      </div>

      <section aria-label="Audit events" className="rounded-xl border border-line bg-surface">
        {error && !data ?
        <div className="p-5">
            <ErrorState message={error} onRetry={reload} />
          </div> :
        !data ?
        <div className="p-5">
            <LoadingState rows={8} />
          </div> :
        rows.length === 0 ?
        <EmptyState icon={ScrollTextIcon} title="No events in this window" description="Widen the time range or clear filters." /> :

        <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="text-2xs text-faint">
                    <th scope="col" className="w-8 border-b border-line py-2.5 pl-4" />
                    <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Time (UTC)</th>
                    <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Action</th>
                    <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Actor</th>
                    <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Target</th>
                    <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Source</th>
                    <th scope="col" className="border-b border-line px-5 py-2.5 text-right font-medium">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((l) => {
                  const open = expanded === l.id;
                  const out = outcomeOf(l);
                  const incidentTarget = l.entityType?.toUpperCase().includes('INCIDENT') && l.entityId && /^\d+$/.test(l.entityId);
                  return (
                    <React.Fragment key={l.id}>
                        <tr
                        className={twMerge('cursor-pointer transition-colors duration-100 ease-out', open ? 'bg-raised/60' : 'hover:bg-raised/40')}
                        onClick={() => setExpanded(open ? null : l.id)}>
                        
                          <td className="border-b border-line py-2.5 pl-4">
                            <button type="button" aria-expanded={open} aria-label="Toggle event details" className="rounded p-0.5 text-faint hover:text-ink">
                              <ChevronRightIcon className={twMerge('h-3.5 w-3.5 transition-transform duration-150 ease-out', open ? 'rotate-90' : '')} />
                            </button>
                          </td>
                          <td className="whitespace-nowrap border-b border-line px-3 py-2.5 font-mono text-2xs text-muted" title={fmtDateTime(l.timestamp)}>
                            {toDate(l.timestamp)?.toISOString().replace('T', ' ').slice(0, 19) ?? l.timestamp}
                            <span className="ml-2 text-faint">{relTime(l.timestamp)}</span>
                          </td>
                          <td className="max-w-[220px] border-b border-line px-3 py-2.5">
                            <AuditActionTag action={l.action} outcome={l.outcome} />
                          </td>
                          <td className="whitespace-nowrap border-b border-line px-3 py-2.5 text-ink">
                            {l.actor}
                            {l.actorRole && <span className="ml-2 font-mono text-2xs text-faint">{l.actorRole}</span>}
                          </td>
                          <td className="whitespace-nowrap border-b border-line px-3 py-2.5 font-mono text-2xs text-muted" onClick={(e) => incidentTarget && e.stopPropagation()}>
                            {incidentTarget ?
                          <Link to={`/incidents/${l.entityId}`} className="text-accent hover:underline">
                                INCIDENT #{l.entityId}
                              </Link> :

                          `${l.entityType ?? '—'}${l.entityId ? ` #${l.entityId}` : ''}`
                          }
                          </td>
                          <td className="whitespace-nowrap border-b border-line px-3 py-2.5 font-mono text-2xs text-muted">{l.ipAddress ?? '—'}</td>
                          <td className="whitespace-nowrap border-b border-line px-5 py-2.5 text-right font-mono text-2xs">
                            <span className={out === 'success' ? 'text-ok' : 'text-crit'}>{out === 'success' ? 'Success' : out === 'denied' ? 'Denied' : 'Failed'}</span>
                          </td>
                        </tr>
                        <AnimatePresence initial={false}>
                          {open &&
                        <tr>
                              <td colSpan={7} className="border-b border-line bg-base/50 p-0">
                                <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                              className="overflow-hidden">
                              
                                  <dl className="grid gap-x-8 gap-y-3 px-12 py-4 text-sm sm:grid-cols-[120px_1fr]">
                                    <dt className="text-xs text-faint">Details</dt>
                                    <dd className="whitespace-pre-wrap break-words text-ink">{l.details ?? '—'}</dd>
                                    <dt className="text-xs text-faint">Event ID</dt>
                                    <dd className="font-mono text-2xs text-muted">{l.id}</dd>
                                    <dt className="text-xs text-faint">Recorded</dt>
                                    <dd className="font-mono text-2xs text-muted">{fmtDateTime(l.timestamp)}</dd>
                                  </dl>
                                </motion.div>
                              </td>
                            </tr>
                        }
                        </AnimatePresence>
                      </React.Fragment>);

                })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <p className="font-mono text-2xs text-faint">
                {page * PAGE + 1}–{Math.min(rows.length, (page + 1) * PAGE)} of {rows.length} events
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        }
      </section>
    </div>);

}