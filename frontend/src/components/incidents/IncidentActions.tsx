import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { UserPlusIcon, GitCommitHorizontalIcon } from 'lucide-react';
import { assignIncident, updateIncidentStatus } from '../../services/incidentService';
import { listUsers } from '../../services/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/api';
import { LIFECYCLE, STATUS_META, lifecycleIndex } from '../../utils/incidentMeta';
import { incidentCode } from '../../utils/format';
import { SelectField } from '../ui/SelectField';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { Incident, IncidentStatus } from '../../types/incident';
import type { ManagedUser } from '../../types/admin';

interface IncidentActionsProps {
  incident: Incident;
  onChanged: () => void;
  layout?: 'row' | 'stack';
}

/** Analyst/Admin workflow controls: status transitions and ownership. Backend enforces RBAC. */
export function IncidentActions({ incident, onChanged, layout = 'row' }: IncidentActionsProps) {
  const { user } = useAuth();
  const nextDefault = LIFECYCLE[Math.min(lifecycleIndex(incident.status) + 1, LIFECYCLE.length - 1)];
  const [status, setStatus] = useState<IncidentStatus>(nextDefault);
  const [assignee, setAssignee] = useState<string>(String(incident.assignee?.id ?? user?.id ?? ''));
  const [busy, setBusy] = useState<'status' | 'assign' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setStatus(LIFECYCLE[Math.min(lifecycleIndex(incident.status) + 1, LIFECYCLE.length - 1)]);
    setAssignee(String(incident.assignee?.id ?? user?.id ?? ''));
  }, [incident.status, incident.assignee?.id, user?.id]);

  // Analyst roster comes from the admin users endpoint; analysts without access fall back to "assign to me".
  const roster = useAsync<ManagedUser[]>(
    () => listUsers({ silent: true }).then((us) => us.filter((u) => u.role !== 'EMPLOYEE')).catch(() => []),
    []
  );

  const assigneeOptions = useMemo(() => {
    const opts = (roster.data ?? []).map((u) => ({ value: String(u.id), label: u.id === user?.id ? `${u.fullName} (me)` : u.fullName }));
    if (user && !opts.some((o) => o.value === String(user.id))) opts.unshift({ value: String(user.id), label: `${user.fullName} (me)` });
    if (incident.assignee && !opts.some((o) => o.value === String(incident.assignee?.id))) {
      opts.push({ value: String(incident.assignee.id), label: incident.assignee.name });
    }
    return opts;
  }, [roster.data, user, incident.assignee]);

  const statusOptions = LIFECYCLE.filter((s) => s !== incident.status).map((s) => ({
    value: s,
    label: `${lifecycleIndex(s) < lifecycleIndex(incident.status) ? '↩ ' : ''}${STATUS_META[s].label}`
  }));

  const applyStatus = async () => {
    setBusy('status');
    try {
      await updateIncidentStatus(incident.id, status);
      toast.success(`${incidentCode(incident.id)} moved to ${STATUS_META[status].label}`);
      setConfirmOpen(false);
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Status update failed'));
    } finally {
      setBusy(null);
    }
  };

  const applyAssign = async () => {
    const id = Number(assignee);
    if (!id) return;
    setBusy('assign');
    try {
      await assignIncident(incident.id, id);
      const name = assigneeOptions.find((o) => o.value === assignee)?.label.replace(' (me)', '') ?? 'analyst';
      toast.success(`${incidentCode(incident.id)} assigned to ${name}`);
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Assignment failed'));
    } finally {
      setBusy(null);
    }
  };

  const requiresConfirm = status === 'CLOSED' || status === 'RESOLVED' || lifecycleIndex(status) < lifecycleIndex(incident.status);
  const sameAssignee = Number(assignee) === incident.assignee?.id;

  return (
    <div className={layout === 'row' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Move to status</p>
        <div className="flex gap-2">
          <SelectField className="flex-1" label="Next status" value={status} onChange={(v) => setStatus(v as IncidentStatus)} options={statusOptions} />
          <Button
            icon={GitCommitHorizontalIcon}
            variant="primary"
            loading={busy === 'status'}
            onClick={() => requiresConfirm ? setConfirmOpen(true) : void applyStatus()}>
            
            Apply
          </Button>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Owner</p>
        <div className="flex gap-2">
          <SelectField
            className="flex-1"
            label="Assignee"
            value={assignee}
            onChange={setAssignee}
            options={assigneeOptions}
            disabled={roster.loading && !roster.data} />
          
          <Button icon={UserPlusIcon} loading={busy === 'assign'} disabled={sameAssignee || !assignee} onClick={applyAssign}>
            Assign
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Move to ${STATUS_META[status].label}?`}
        description={`${incidentCode(incident.id)} · ${incident.title}`}
        confirmLabel={`Move to ${STATUS_META[status].label}`}
        loading={busy === 'status'}
        onConfirm={applyStatus}
        onCancel={() => setConfirmOpen(false)}>
        
        <p className="text-sm text-muted">
          {lifecycleIndex(status) < lifecycleIndex(incident.status) ?
          'This moves the incident backwards in the lifecycle. The change is recorded in the audit trail.' :
          `${STATUS_META[status].description} The change is recorded in the audit trail.`}
        </p>
      </ConfirmDialog>
    </div>);

}