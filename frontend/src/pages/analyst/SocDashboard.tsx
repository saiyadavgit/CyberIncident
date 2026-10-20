import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, RotateCwIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getAllIncidents } from '../../services/incidentService';
import { useAsync } from '../../hooks/useAsync';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { ThreatTopology } from '../../components/viz/ThreatTopology';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber';
import { Segmented } from '../../components/ui/Segmented';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { SeverityTrendChart } from '../../components/charts/SeverityTrendChart';
import { SeverityDonut } from '../../components/charts/SeverityDonut';
import { LifecyclePipeline } from '../../components/charts/LifecyclePipeline';
import { CriticalAlerts } from '../../components/soc/CriticalAlerts';
import { SEVERITIES, SEVERITY_META, isOpen } from '../../utils/incidentMeta';
import {
  byLastActivity,
  countBySeverity,
  countByStatus,
  dailyTrend,
  meanOpenAgeHours,
  threatPosture,
  type PostureLevel } from
'../../utils/incidentStats';
import { fmtDuration, hoursSince, relTime, toDate } from '../../utils/format';

const POSTURE_TONE: Record<PostureLevel, string> = {
  GUARDED: 'text-ok',
  ELEVATED: 'text-med',
  HIGH: 'text-high',
  SEVERE: 'text-crit'
};

export function SocDashboardPage() {
  const navigate = useNavigate();
  const { data, error, loading, reload } = useAsync(getAllIncidents, []);
  const [distScope, setDistScope] = React.useState<'open' | 'all'>('open');
  const [syncedAt, setSyncedAt] = React.useState<string | null>(null);
  const rootRef = useStaggerReveal<HTMLDivElement>(Boolean(data));

  useEffect(() => {
    if (data) setSyncedAt(new Date().toISOString());
  }, [data]);

  useEffect(() => {
    const t = setInterval(() => void reload(), 60_000);
    return () => clearInterval(t);
  }, [reload]);

  const stats = useMemo(() => {
    const all = data ?? [];
    const open = all.filter((i) => isOpen(i.status));
    const unassigned = open.filter((i) => !i.assignee);
    const oldestUnassigned = unassigned.reduce((m, i) => Math.max(m, hoursSince(i.createdAt)), 0);
    const weekAgo = Date.now() - 7 * 24 * 3_600_000;
    const closedWeek = all.filter((i) => !isOpen(i.status) && (toDate(i.updatedAt ?? i.createdAt)?.getTime() ?? 0) >= weekAgo).length;
    return {
      all,
      open,
      unassigned,
      oldestUnassigned,
      closedWeek,
      meanAge: meanOpenAgeHours(all),
      openSev: countBySeverity(open),
      allSev: countBySeverity(all),
      status: countByStatus(all),
      trend: dailyTrend(all, 14),
      posture: threatPosture(all),
      recent: [...all].sort(byLastActivity).slice(0, 7)
    };
  }, [data]);

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Security operations</h1>
        <ErrorState message={error} onRetry={reload} />
      </div>);

  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Security operations</h1>
        <LoadingState rows={6} label="Loading SOC overview" />
      </div>);

  }

  const openTotal = stats.open.length;

  return (
    <div ref={rootRef} className="space-y-6">
      {/* Posture header */}
      <header data-reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs text-muted">Security operations · all incidents</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">
            Threat posture <span className={twMerge('ml-1', POSTURE_TONE[stats.posture.level])}>{stats.posture.level.toLowerCase()}</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted">{stats.posture.reason}. Refreshes every 60 seconds.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs text-faint">{syncedAt ? `Synced ${relTime(syncedAt)}` : ''}</span>
          <Button size="sm" icon={RotateCwIcon} loading={loading} onClick={() => void reload()}>
            Refresh
          </Button>
        </div>
      </header>

      {/* KPI strip */}
      <section data-reveal aria-label="Key metrics" className="grid overflow-hidden rounded-xl border border-line bg-surface sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="border-b border-line p-5 sm:col-span-2 lg:col-span-1 lg:border-b-0 lg:border-r">
          <p className="text-xs text-muted">Open incidents</p>
          <div className="mt-2 flex items-end gap-4">
            <AnimatedNumber value={openTotal} className="font-mono text-5xl font-medium leading-none tracking-tight text-ink tabular" />
            <div className="mb-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-2xs">
              {SEVERITIES.map((s) =>
              <span key={s} className={stats.openSev[s] ? SEVERITY_META[s].text : 'text-faint'}>
                  {stats.openSev[s]} {SEVERITY_META[s].label.toLowerCase()}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-raised" aria-hidden>
            {SEVERITIES.map((s) =>
            stats.openSev[s] ?
            <span key={s} className={SEVERITY_META[s].bg} style={{ width: `${stats.openSev[s] / Math.max(openTotal, 1) * 100}%` }} /> :
            null
            )}
          </div>
        </div>
        <Metric label="Unassigned" value={stats.unassigned.length} tone={stats.unassigned.length ? 'text-high' : 'text-ink'} foot={stats.unassigned.length ? `Oldest waiting ${fmtDuration(stats.oldestUnassigned)}` : 'Every open incident has an owner'} border />
        <Metric label="Mean time open" display={openTotal ? fmtDuration(stats.meanAge) : '—'} foot="Across open incidents" border />
        <Metric label="Closed out · 7 days" value={stats.closedWeek} foot="Resolved or closed" />
      </section>

      {/* Hero: topology + alerts */}
      <div className="grid gap-6 xl:grid-cols-12">
        <section data-reveal aria-label="Attack surface topology" className="relative overflow-hidden rounded-xl border border-line bg-surface xl:col-span-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5">
            <div>
              <h2 className="text-sm font-semibold text-ink">Attack surface</h2>
              <p className="mt-0.5 max-w-xs text-xs text-muted">Incidents orbit their attack vector around your organisation. Drag to rotate · click a node to open.</p>
            </div>
            <span className="font-mono text-2xs text-faint">{stats.all.length} incidents · 7 vectors</span>
          </div>
          {stats.all.length ?
          <ThreatTopology
            mode="live"
            incidents={stats.all}
            onSelect={(id) => navigate(`/incidents/${id}`)}
            className="h-[440px] md:h-[560px]"
            label={`3D topology of ${stats.all.length} incidents grouped by attack vector`} /> :


          <div className="h-[440px] md:h-[560px]">
              <EmptyState title="No incidents yet" description="The topology will populate as incidents are reported." />
            </div>
          }
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-x-5 gap-y-2 p-5 font-mono text-2xs text-muted">
            {SEVERITIES.map((s) =>
            <span key={s} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_META[s].hex }} />
                {SEVERITY_META[s].label}
              </span>
            )}
            <span className="text-faint">Dimmed = resolved / closed · Ring = critical & open</span>
          </div>
        </section>

        <CriticalAlerts incidents={stats.open} className="xl:col-span-4" />
      </div>

      {/* Trend + pipeline */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-7">
          <Panel title="Incoming incidents" subtitle="Reported per day over the last 14 days, by severity" className="h-full">
            <SeverityTrendChart data={stats.trend} height={250} />
          </Panel>
        </div>
        <div data-reveal className="lg:col-span-5">
          <Panel
            title="Lifecycle pipeline"
            subtitle="Where incidents currently sit"
            action={
            <Link to="/analyst/queue" className="text-xs text-muted hover:text-ink">
                Open queue
              </Link>
            }
            className="h-full">
            
            <div className="pt-6">
              <LifecyclePipeline counts={stats.status} onSelect={() => navigate('/analyst/queue')} />
            </div>
          </Panel>
        </div>
      </div>

      {/* Activity + distribution */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-8">
          <Panel
            title="Latest activity"
            subtitle="Incidents ordered by most recent change"
            action={
            <Link to="/analyst/queue" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                Full queue <ArrowRightIcon className="h-3 w-3" aria-hidden />
              </Link>
            }
            bodyClassName="px-0 pb-2">
            
            <IncidentTable incidents={stats.recent} people="assignee" dense />
          </Panel>
        </div>
        <div data-reveal className="lg:col-span-4">
          <Panel
            title="Severity distribution"
            action={
            <Segmented
              label="Distribution scope"
              value={distScope}
              onChange={setDistScope}
              options={[
              { value: 'open', label: 'Open' },
              { value: 'all', label: 'All' }]
              } />

            }
            className="h-full">
            
            <div className="pt-4">
              <SeverityDonut counts={distScope === 'open' ? stats.openSev : stats.allSev} caption={distScope === 'open' ? 'open' : 'total'} />
            </div>
          </Panel>
        </div>
      </div>
    </div>);

}

function Metric({ label, value, display, foot, tone = 'text-ink', border }: {label: string;value?: number;display?: string;foot: string;tone?: string;border?: boolean;}) {
  return (
    <div className={twMerge('border-b border-line p-5 sm:border-b-0', border ? 'sm:border-r' : '')}>
      <p className="text-xs text-muted">{label}</p>
      <p className={twMerge('mt-2 font-mono text-3xl font-medium leading-none tabular', tone)}>
        {display ?? <AnimatedNumber value={value ?? 0} />}
      </p>
      <p className="mt-3 text-2xs text-faint">{foot}</p>
    </div>);

}