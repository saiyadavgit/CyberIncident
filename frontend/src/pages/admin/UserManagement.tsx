import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangleIcon, UsersIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { listUsers, updateUserRole } from '../../services/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Segmented } from '../../components/ui/Segmented';
import { SelectField } from '../../components/ui/SelectField';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Avatar } from '../../components/ui/Avatar';
import { getErrorMessage } from '../../utils/api';
import { ROLES, ROLE_LABEL } from '../../utils/roles';
import { fmtDate } from '../../utils/format';
import type { ManagedUser } from '../../types/admin';
import type { Role } from '../../types/auth';

const RANK: Record<Role, number> = { EMPLOYEE: 0, ANALYST: 1, ADMIN: 2 };

export function UserManagementPage() {
  const { user: me } = useAuth();
  const { data, error, reload, setData } = useAsync(() => listUsers(), []);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [pending, setPending] = useState<{user: ManagedUser;role: Role;} | null>(null);
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => {
    const c: Record<'ALL' | Role, number> = { ALL: 0, EMPLOYEE: 0, ANALYST: 0, ADMIN: 0 };
    (data ?? []).forEach((u) => {
      c.ALL++;
      c[u.role]++;
    });
    return c;
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).
    filter((u) => roleFilter === 'ALL' || u.role === roleFilter).
    filter((u) => !q || `${u.fullName} ${u.username} ${u.email ?? ''}`.toLowerCase().includes(q)).
    sort((a, b) => RANK[b.role] - RANK[a.role] || a.fullName.localeCompare(b.fullName));
  }, [data, query, roleFilter]);

  const confirm = async () => {
    if (!pending) return;
    setSaving(true);
    try {
      const updated = await updateUserRole(pending.user.id, pending.role);
      setData((list) => (list ?? []).map((u) => u.id === pending.user.id ? { ...u, role: updated?.role ?? pending.role } : u));
      toast.success(`${pending.user.fullName} is now ${ROLE_LABEL[pending.role]}`);
      setPending(null);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Role change failed'));
    } finally {
      setSaving(false);
    }
  };

  const elevating = pending ? RANK[pending.role] > RANK[pending.user.role] : false;

  return (
    <div>
      <PageHeader title="Users & roles" description="Grant and revoke access. Every role change requires confirmation and is written to the audit trail." />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented
          label="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
          { value: 'ALL', label: 'All', count: counts.ALL },
          { value: 'ADMIN', label: 'Admins', count: counts.ADMIN },
          { value: 'ANALYST', label: 'Analysts', count: counts.ANALYST },
          { value: 'EMPLOYEE', label: 'Employees', count: counts.EMPLOYEE }]
          } />
        
        <SearchInput value={query} onChange={setQuery} placeholder="Search name, username, email…" className="w-full md:w-72" />
      </div>

      <section aria-label="Users" className="rounded-xl border border-line bg-surface">
        {error && !data ?
        <div className="p-5">
            <ErrorState message={error} onRetry={reload} />
          </div> :
        !data ?
        <div className="p-5">
            <LoadingState rows={6} />
          </div> :
        rows.length === 0 ?
        <EmptyState icon={UsersIcon} title="No users match" description="Try a different search or role filter." /> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-2xs text-faint">
                  <th scope="col" className="border-b border-line px-5 py-2.5 font-medium">User</th>
                  <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Email</th>
                  <th scope="col" className="border-b border-line px-3 py-2.5 font-medium">Joined</th>
                  <th scope="col" className="w-56 border-b border-line px-5 py-2.5 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                const self = u.id === me?.id;
                return (
                  <tr key={u.id} className="transition-colors duration-100 ease-out hover:bg-raised/40">
                      <td className="border-b border-line px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.fullName} className="h-8 w-8" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {u.fullName}
                              {self && <span className="ml-2 font-mono text-2xs text-accent">you</span>}
                            </p>
                            <p className="font-mono text-2xs text-faint">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-line px-3 py-3 text-muted">{u.email ?? '—'}</td>
                      <td className="border-b border-line px-3 py-3 font-mono text-2xs text-muted">{fmtDate(u.createdAt)}</td>
                      <td className="border-b border-line px-5 py-3">
                        <div title={self ? "You can't change your own role" : undefined}>
                          <SelectField
                          label={`Role for ${u.fullName}`}
                          value={u.role}
                          disabled={self}
                          onChange={(v) => v !== u.role && setPending({ user: u, role: v as Role })}
                          options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
                        
                        </div>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </section>

      <ConfirmDialog
        open={Boolean(pending)}
        title={elevating ? 'Grant elevated access?' : 'Reduce access?'}
        description={pending ? `${pending.user.fullName} · @${pending.user.username}` : undefined}
        confirmLabel={pending ? `Make ${ROLE_LABEL[pending.role]}` : 'Confirm'}
        tone={pending?.role === 'ADMIN' ? 'danger' : 'primary'}
        loading={saving}
        onConfirm={confirm}
        onCancel={() => setPending(null)}>
        
        {pending &&
        <div className="space-y-4">
            <div className="flex items-center gap-3 font-mono text-sm">
              <span className="rounded border border-line-strong px-2 py-1 text-muted">{ROLE_LABEL[pending.user.role]}</span>
              <span className="text-faint">→</span>
              <span className={twMerge('rounded border px-2 py-1', pending.role === 'ADMIN' ? 'border-high/50 text-high' : 'border-accent/50 text-accent')}>{ROLE_LABEL[pending.role]}</span>
            </div>
            {pending.role === 'ADMIN' &&
          <p className="flex gap-2 text-sm text-muted">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-high" aria-hidden />
                Admins can manage every account and read the full audit trail.
              </p>
          }
            {pending.role === 'ANALYST' && <p className="text-sm text-muted">Analysts can view all incidents, assign owners, change status and run investigations.</p>}
            {pending.role === 'EMPLOYEE' && <p className="text-sm text-muted">They will only see incidents they reported. Takes effect on their next request.</p>}
          </div>
        }
      </ConfirmDialog>
    </div>);

}