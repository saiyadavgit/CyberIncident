import React, { useMemo } from 'react';
import { getAuditAnalytics, getIncidentAnalytics } from '../../services/analyticsService';
import { useAsync } from '../../hooks/useAsync';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber';
import { AreaTrend } from '../../components/charts/AreaTrend';
import { BarList } from '../../components/charts/BarList';
import { LifecyclePipeline } from '../../components/charts/LifecyclePipeline';
import { SeverityDonut } from '../../components/charts/SeverityDonut';
import { INCIDENT_TYPES, SEVERITIES, TYPE_META } from '../../utils/incidentMeta';
import { humanize } from '../../utils/format';
import type { Severity } from '../../types/incident';

export function AnalyticsPage() {
  const incidents = useAsync(getIncidentAnalytics, []);
  const audit = useAsync(getAuditAnalytics, []);
  const rootRef = useStaggerReveal<HTMLDivElement>(Boolean(incidents.data));

  const derived = useMemo(() => {
    const d = incidents.data;
    if (!d) return null;
    const sev = Object.fromEntries(SEVERITIES.map((s) => [s, d.bySeverity[s] ?? 0])) as Record<Severity, number>;
    const critHigh = sev.CRITICAL + sev.HIGH;
    const closed = (d.byStatus.RESOLVED ?? 0) + (d.byStatus.CLOSED ?? 0);
    return {
      sev,
      critShare: d.total ? Math.round(critHigh / d.total * 100) : 0,
      closeRate: d.total ? Math.round(closed / d.total * 100) : 0,
      types: INCIDENT_TYPES.map((t) => ({ key: t, label: TYPE_META[t].label, value: d.byType[t] ?? 0 })).sort((a, b) => b.value - a.value)
    };
  }, [incidents.data]);

  return (
    <div ref={rootRef}>
      <PageHeader title="Analytics" description="Incident volume, severity mix and lifecycle health, alongside audit activity." />

      {incidents.error && !incidents.data ?
      <ErrorState message={incidents.error} onRetry={incidents.reload} /> :
      !incidents.data || !derived ?
      <LoadingState rows={6} /> :

      <div className="space-y-6">
          <section data-reveal aria-label="Headline metrics" className="grid overflow-hidden rounded-xl border border-line bg-surface sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Incidents reported" value={incidents.data.total} />
            <Kpi label="Currently open" value={incidents.data.open} />
            <Kpi label="Critical + high share" value={derived.critShare} suffix="%" />
            <Kpi label="Closed-out rate" value={derived.closeRate} suffix="%" last />
          </section>

          <div className="grid gap-6 lg:grid-cols-12">
            <div data-reveal className="lg:col-span-8">
              <Panel title="Incident intake" subtitle="Reported per day" className="h-full">
                {incidents.data.trend.length ? <AreaTrend data={incidents.data.trend} name="Incidents" height={260} /> : <p className="py-16 text-center text-sm text-muted">No trend data returned.</p>}
              </Panel>
            </div>
            <div data-reveal className="lg:col-span-4">
              <Panel title="Severity mix" subtitle="All incidents" className="h-full">
                <div className="pt-2">
                  <SeverityDonut counts={derived.sev} caption="incidents" size={150} />
                </div>
              </Panel>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div data-reveal>
              <Panel title="Lifecycle" subtitle="Incidents by current status" className="h-full">
                <div className="pt-4">
                  <LifecyclePipeline counts={incidents.data.byStatus} />
                </div>
              </Panel>
            </div>
            <div data-reveal>
              <Panel title="Attack vectors" subtitle="Incidents by type" className="h-full">
                <BarList items={derived.types} />
              </Panel>
            </div>
          </div>

          <div className="pt-4">
            <h2 className="mb-1 text-base font-semibold text-ink">Audit activity</h2>
            <p className="mb-4 text-sm text-muted">{audit.data ? `${audit.data.total.toLocaleString()} recorded events` : 'Loading audit analytics…'}</p>
            {audit.error && !audit.data ?
          <ErrorState message={audit.error} onRetry={audit.reload} /> :
          !audit.data ?
          <LoadingState rows={4} /> :

          <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <Panel title="Events over time" className="h-full">
                    {audit.data.trend.length ? <AreaTrend data={audit.data.trend} name="Events" color="#7A8CA8" height={240} /> : <p className="py-16 text-center text-sm text-muted">No trend data returned.</p>}
                  </Panel>
                </div>
                <div className="lg:col-span-3">
                  <Panel title="Top actions" className="h-full">
                    <BarList
                  limit={7}
                  items={Object.entries(audit.data.byAction).
                  map(([k, v]) => ({ key: k, label: humanize(k), value: v, color: /FAIL|DENIED/.test(k) ? '#FF4D5E' : undefined })).
                  sort((a, b) => b.value - a.value)} />
                
                  </Panel>
                </div>
                <div className="lg:col-span-3">
                  <Panel title="Most active accounts" className="h-full">
                    <BarList
                  limit={7}
                  emptyLabel="No per-account data returned"
                  items={Object.entries(audit.data.byActor).
                  map(([k, v]) => ({ key: k, label: k.toLowerCase(), value: v, color: '#7A8CA8' })).
                  sort((a, b) => b.value - a.value)} />
                
                  </Panel>
                </div>
              </div>
          }
          </div>
        </div>
      }
    </div>);

}

function Kpi({ label, value, suffix, last }: {label: string;value: number;suffix?: string;last?: boolean;}) {
  return (
    <div className={`border-b border-line p-5 sm:border-b-0 ${last ? '' : 'lg:border-r'}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 font-mono text-3xl font-medium text-ink tabular">
        <AnimatedNumber value={value} />
        {suffix && <span className="ml-0.5 text-lg text-muted">{suffix}</span>}
      </p>
    </div>);

}