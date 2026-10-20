import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowUpRightIcon, MousePointerClickIcon, RotateCwIcon, ScanSearchIcon, InboxIcon } from 'lucide-react';
import { assignIncident, getAllIncidents } from '../../services/incidentService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Segmented } from '../../components/ui/Segmented';
import { SelectField } from '../../components/ui/SelectField';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { IncidentActions } from '../../components/incidents/IncidentActions';
import { INCIDENT_TYPES, SEVERITIES, SEVERITY_META, TYPE_META, isOpen } from '../../utils/incidentMeta';
import { byLastActivity, byPriority, byRecent } from '../../utils/incidentStats';
import { getErrorMessage } from '../../utils/api';
import { fmtDateTime, incidentCode, relTime } from '../../utils/format';
import type { Incident } from '../../types/incident';

type View = 'open' | 'unassigned' | 'mine' | 'all';
type Sort = 'priority' | 'newest' | 'oldest' | 'activity';

export function IncidentQueuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const wide = useMediaQuery('(min-width: 1280px)');
  const { data, error, loading, reload } = useAsync(getAllIncidents, []);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('open');
  const [severity, setSeverity] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [sort, setSort] = useState<Sort>('priority');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [taking, setTaking] = useState<number | null>(null);

  const all = data ?? [];
  const counts = useMemo(
    () => ({
      open: all.filter((i) => isOpen(i.status)).length,
      unassigned: all.filter((i) => isOpen(i.status) && !i.assignee).length,
      mine: all.filter((i) => i.assignee?.id === user?.id && isOpen(i.status)).length,
      all: all.length
    }),
    [all, user?.id]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all.filter((i) => {
      if (view === 'open' && !isOpen(i.status)) return false;
      if (view === 'unassigned' && (!isOpen(i.status) || i.assignee)) return false;
      if (view === 'mine' && (i.assignee?.id !== user?.id || !isOpen(i.status))) return false;
      if (severity !== 'ALL' && i.severity !== severity) return false;
      if (type !== 'ALL' && i.type !== type) return false;
      if (q && !`${incidentCode(i.id)} ${i.title} ${i.description} ${i.reporter?.name ?? ''} ${i.assignee?.name ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorter = sort === 'priority' ? byPriority : sort === 'newest' ? byRecent : sort === 'activity' ? byLastActivity : (a: Incident, b: Incident) => byRecent(b, a);
    list = [...list].sort(sorter);
    return list;
  }, [all, query, view, severity, type, sort, user?.id]);

  const selected = all.find((i) => i.id === selectedId) ?? null;

  const take = async (inc: Incident) => {
    if (!user) return;
    setTaking(inc.id);
    try {
      await assignIncident(inc.id, user.id);
      toast.success(`${incidentCode(inc.id)} assigned to you`);
      await reload();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Assignment failed'));
    } finally {
      setTaking(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Incident queue"
        description="Triage incoming reports, take ownership and move incidents through the lifecycle."
        actions={
        <Button size="sm" icon={RotateCwIcon} loading={loading && Boolean(data)} onClick={() => void reload()}>
            Refresh
          </Button>
        } />
      

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented
          label="Queue view"
          value={view}
          onChange={setView}
          options={[
          { value: 'open', label: 'Open', count: counts.open },
          { value: 'unassigned', label: 'Unassigned', count: counts.unassigned },
          { value: 'mine', label: 'Mine', count: counts.mine },
          { value: 'all', label: 'All', count: counts.all }]
          } />
        
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search ID, title, people…" className="w-full sm:w-64" />
          <SelectField label="Severity" value={severity} onChange={setSeverity} className="w-36" options={[{ value: 'ALL', label: 'All severities' }, ...SEVERITIES.map((s) => ({ value: s, label: SEVERITY_META[s].label }))]} />
          <SelectField label="Type" value={type} onChange={setType} className="w-44" options={[{ value: 'ALL', label: 'All types' }, ...INCIDENT_TYPES.map((t) => ({ value: t, label: TYPE_META[t].label }))]} />
          <SelectField
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            className="w-40"
            options={[
            { value: 'priority', label: 'Sort: Priority' },
            { value: 'newest', label: 'Sort: Newest' },
            { value: 'oldest', label: 'Sort: Oldest' },
            { value: 'activity', label: 'Sort: Last activity' }]
            } />
          
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-label="Incidents" className="min-w-0 rounded-xl border border-line bg-surface">
          {error && !data ?
          <div className="p-5">
              <ErrorState message={error} onRetry={reload} />
            </div> :
          !data ?
          <div className="p-5">
              <LoadingState rows={8} label="Loading queue" />
            </div> :
          rows.length === 0 ?
          <EmptyState icon={InboxIcon} title="Nothing matches these filters" description={view === 'unassigned' ? 'Every open incident has an owner.' : 'Try widening the view or clearing filters.'} /> :

          <>
              <IncidentTable
              incidents={rows}
              people="both"
              dense
              selectedId={wide ? selectedId : null}
              onSelect={(inc) => wide ? setSelectedId(inc.id) : navigate(`/incidents/${inc.id}`)}
              renderActions={(inc) =>
              !inc.assignee && isOpen(inc.status) ?
              <Button size="sm" variant="ghost" loading={taking === inc.id} onClick={() => take(inc)}>
                      Take
                    </Button> :
              null
              } />
            
              <p className="px-5 py-3 font-mono text-2xs text-faint">
                {rows.length} of {all.length} incidents
              </p>
            </>
          }
        </section>

        {wide &&
        <aside aria-label="Incident preview" className="sticky top-20 h-fit rounded-xl border border-line bg-surface">
            <AnimatePresence mode="wait" initial={false}>
              {selected ?
            <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
                  <div className="border-b border-line p-5">
                    <p className="font-mono text-2xs text-faint">
                      {incidentCode(selected.id)} · {TYPE_META[selected.type].label}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{selected.title}</h2>
                    <div className="mt-3 flex items-center gap-4">
                      <SeverityBadge severity={selected.severity} />
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  <div className="space-y-4 border-b border-line p-5">
                    <p className="line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-muted">{selected.description || 'No description provided.'}</p>
                    <dl className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <dt className="text-faint">Reporter</dt>
                        <dd className="mt-0.5 text-ink">{selected.reporter?.name ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-faint">Reported</dt>
                        <dd className="mt-0.5 text-ink" title={fmtDateTime(selected.createdAt)}>
                          {relTime(selected.createdAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="border-b border-line p-5">
                    <IncidentActions incident={selected} onChanged={() => void reload()} layout="stack" />
                  </div>
                  <div className="flex gap-2 p-5">
                    <ButtonLink to={`/incidents/${selected.id}`} className="flex-1" icon={ArrowUpRightIcon}>
                      Full details
                    </ButtonLink>
                    <ButtonLink to={`/analyst/investigations/${selected.id}`} className="flex-1" icon={ScanSearchIcon}>
                      Investigate
                    </ButtonLink>
                  </div>
                </motion.div> :

            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState icon={MousePointerClickIcon} title="Select an incident" description="Preview details and act on it without leaving the queue." />
                </motion.div>
            }
            </AnimatePresence>
          </aside>
        }
      </div>
    </div>);

}