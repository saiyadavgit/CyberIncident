import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, UsersIcon, ScrollTextIcon, ActivityIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { listAuditLogs, listUsers } from '../../services/adminService';
import { getIncidentAnalytics } from '../../services/analyticsService';
import { useAsync } from '../../hooks/useAsync';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber';
import { AreaTrend } from '../../components/charts/AreaTrend';
import { BarList } from '../../components/charts/BarList';
import { AuditActionTag } from '../../components/audit/AuditActionTag';
import { ROLES, ROLE_LABEL } from '../../utils/roles';
import { SEVERITIES, SEVERITY_META } from '../../utils/incidentMeta';
import { isSecurityRelevant, isFailure } from '../../utils/audit';
import { relTime, toDate } from '../../utils/format';

const ROLE_COLOR = { EMPLOYEE: 'bg-low', ANALYST: 'bg-accent', ADMIN: 'bg-high' } as const;

export function AdminDashboardPage() {
  const users = useAsync(() => listUsers(), []);
  const audit = useAsync(() => listAuditLogs(), []);
  const analytics = useAsync(getIncidentAnalytics, []);
  const rootRef = useStaggerReveal<HTMLDivElement>(Boolean(users.data || audit.data));

  const roleCounts = useMemo(() => {
    const c = { EMPLOYEE: 0, ANALYST: 0, ADMIN: 0 };
    (users.data ?? []).forEach((u) => c[u.role] += 1);
    return c;
  }, [users.data]);

  const day = useMemo(() => {
    const since = Date.now() - 24 * 3_600_000;
    const recent = (audit.data ?? []).filter((a) => (toDate(a.timestamp)?.getTime() ?? 0) >= since);
    return { total: recent.length, failures: recent.filter(isFailure).length };
  }, [audit.data]);

  const feed = useMemo(() => (audit.data ?? []).filter(isSecurityRelevant).slice(0, 9), [audit.data]);
  const totalUsers = users.data?.length ?? 0;

  return (
    <div ref={rootRef}>
      <PageHeader title="Administration" description="Access, accountability and incident health across the organisation." />

      <section data-reveal aria-label="Overview" className="mb-6 grid overflow-hidden rounded-xl border border-line bg-surface md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="border-b border-line p-5 md:border-b-0 md:border-r">
          <p className="text-xs text-muted">Accounts by role</p>
          {users.error ?
          <p className="mt-3 text-sm text-crit">{users.error}</p> :

          <>
              <div className="mt-2 flex items-baseline gap-3">
                <AnimatedNumber value={totalUsers} className="font-mono text-4xl font-medium text-ink tabular" />
                <span className="text-sm text-muted">accounts</span>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-raised" aria-hidden>
                {ROLES.map((r) => roleCounts[r] ? <span key={r} className={ROLE_COLOR[r]} style={{ width: `${roleCounts[r] / Math.max(totalUsers, 1) * 100}%` }} /> : null)}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                {ROLES.map((r) =>
              <li key={r} className="flex items-center gap-1.5 text-muted">
                    <span className={twMerge('h-2 w-2 rounded-sm', ROLE_COLOR[r])} aria-hidden />
                    {ROLE_LABEL[r]} <span className="font-mono text-ink">{roleCounts[r]}</span>
                  </li>
              )}
              </ul>
            </>
          }
        </div>
        <div className="border-b border-line p-5 md:border-b-0 md:border-r">
          <p className="text-xs text-muted">Audit events · 24h</p>
          <AnimatedNumber value={day.total} className="mt-2 block font-mono text-4xl font-medium text-ink tabular" />
          <p className={twMerge('mt-3 text-2xs', day.failures ? 'text-crit' : 'text-faint')}>{day.failures ? `${day.failures} failed or denied` : 'No failures or denials'}</p>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted">Open incidents</p>
          <AnimatedNumber value={analytics.data?.open ?? 0} className="mt-2 block font-mono text-4xl font-medium text-ink tabular" />
          <p className="mt-3 text-2xs text-faint">{analytics.data ? `${analytics.data.total} reported in total` : analytics.error ?? '…'}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-8">
          <Panel
            title="Security-relevant activity"
            subtitle="Role changes, failed sign-ins, denied access and workflow changes"
            action={
            <Link to="/admin/audit-logs" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                Audit trail <ArrowRightIcon className="h-3 w-3" aria-hidden />
              </Link>
            }
            bodyClassName="px-0 pb-1">
            
            {audit.error && !audit.data ?
            <div className="px-5 pb-4">
                <ErrorState message={audit.error} onRetry={audit.reload} />
              </div> :
            !audit.data ?
            <div className="px-5 pb-4">
                <LoadingState rows={5} />
              </div> :
            feed.length === 0 ?
            <p className="px-5 py-8 text-center text-sm text-muted">No security-relevant events recorded.</p> :

            <ul className="divide-y divide-line">
                {feed.map((a) =>
              <li key={a.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3 sm:grid-cols-[180px_1fr_auto]">
                    <AuditActionTag action={a.action} outcome={a.outcome} />
                    <p className="col-span-2 min-w-0 truncate text-sm text-muted sm:col-span-1">
                      <span className="text-ink">{a.actor}</span>
                      {a.details ? ` — ${a.details}` : ''}
                    </p>
                    <time dateTime={a.timestamp} className="row-start-1 text-right font-mono text-2xs text-faint sm:row-start-auto">
                      {relTime(a.timestamp)}
                    </time>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </div>

        <div data-reveal className="space-y-6 lg:col-span-4">
          <Panel title="Administration">
            <ul className="-mx-2">
              {[
              { to: '/admin/users', icon: UsersIcon, label: 'Users & roles', hint: `${totalUsers} accounts` },
              { to: '/admin/audit-logs', icon: ScrollTextIcon, label: 'Audit trail', hint: `${audit.data?.length ?? '—'} events` },
              { to: '/admin/analytics', icon: ActivityIcon, label: 'Analytics', hint: 'Incidents & audit' }].
              map((l) =>
              <li key={l.to}>
                  <Link to={l.to} className="group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 ease-out hover:bg-raised">
                    <l.icon className="h-4 w-4 text-muted" aria-hidden />
                    <span className="flex-1 text-sm text-ink">{l.label}</span>
                    <span className="font-mono text-2xs text-faint">{l.hint}</span>
                    <ArrowRightIcon className="h-3.5 w-3.5 text-faint transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              )}
            </ul>
          </Panel>
          <Panel title="Incidents by severity" subtitle="All time">
            {analytics.data ?
            <BarList
              items={SEVERITIES.map((s) => ({ key: s, label: SEVERITY_META[s].label, value: analytics.data?.bySeverity[s] ?? 0, color: SEVERITY_META[s].hex }))} /> :

            analytics.error ?
            <ErrorState message={analytics.error} onRetry={analytics.reload} /> :

            <LoadingState rows={3} />
            }
          </Panel>
        </div>
      </div>

      {analytics.data && analytics.data.trend.length > 0 &&
      <div data-reveal className="mt-6">
          <Panel title="Incident intake" subtitle="Reported per day">
            <AreaTrend data={analytics.data.trend} name="Incidents" height={220} />
          </Panel>
        </div>
      }
    </div>);

}