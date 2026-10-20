import React, { useMemo, useState } from 'react';
import { InboxIcon, PlusIcon } from 'lucide-react';
import { getMyIncidents } from '../../services/incidentService';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Segmented } from '../../components/ui/Segmented';
import { SelectField } from '../../components/ui/SelectField';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { SEVERITIES, SEVERITY_META, isOpen } from '../../utils/incidentMeta';
import { byRecent } from '../../utils/incidentStats';
import { incidentCode } from '../../utils/format';

type Scope = 'all' | 'open' | 'closed';

export function MyIncidentsPage() {
  const { data, error, reload } = useAsync(getMyIncidents, []);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [severity, setSeverity] = useState('ALL');
  const all = data ?? [];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.
    filter((i) => scope === 'open' ? isOpen(i.status) : scope === 'closed' ? !isOpen(i.status) : true).
    filter((i) => severity === 'ALL' || i.severity === severity).
    filter((i) => !q || `${incidentCode(i.id)} ${i.title} ${i.description}`.toLowerCase().includes(q)).
    sort(byRecent);
  }, [all, query, scope, severity]);

  const openCount = all.filter((i) => isOpen(i.status)).length;

  return (
    <div>
      <PageHeader
        title="My incidents"
        description="Everything you've reported and where it stands."
        actions={
        <ButtonLink to="/employee/report" variant="primary" icon={PlusIcon}>
            Report incident
          </ButtonLink>
        } />
      
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented
          label="Filter by state"
          value={scope}
          onChange={setScope}
          options={[
          { value: 'all', label: 'All', count: all.length },
          { value: 'open', label: 'Open', count: openCount },
          { value: 'closed', label: 'Closed out', count: all.length - openCount }]
          } />
        
        <div className="flex flex-wrap gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search your reports…" className="w-full sm:w-64" />
          <SelectField label="Severity" value={severity} onChange={setSeverity} className="w-40" options={[{ value: 'ALL', label: 'All severities' }, ...SEVERITIES.map((s) => ({ value: s, label: SEVERITY_META[s].label }))]} />
        </div>
      </div>
      <section aria-label="Your incidents" className="rounded-xl border border-line bg-surface">
        {error && !data ?
        <div className="p-5">
            <ErrorState message={error} onRetry={reload} />
          </div> :
        !data ?
        <div className="p-5">
            <LoadingState rows={5} />
          </div> :
        all.length === 0 ?
        <EmptyState
          icon={InboxIcon}
          title="You haven't reported anything yet"
          description="If something looks off — an odd email, a strange login prompt — report it. It's never a wasted report."
          action={
          <ButtonLink to="/employee/report" variant="primary" icon={PlusIcon}>
                Report incident
              </ButtonLink>
          } /> :

        rows.length === 0 ?
        <EmptyState title="No reports match" description="Try clearing the search or filters." /> :

        <IncidentTable incidents={rows} people="assignee" />
        }
      </section>
    </div>);

}