import { format, formatDistanceToNowStrict } from 'date-fns';

export function toDate(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function relTime(iso?: string): string {
  const d = toDate(iso);
  if (!d) return '—';
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  return `${formatDistanceToNowStrict(d)} ago`;
}

export function fmtDateTime(iso?: string): string {
  const d = toDate(iso);
  return d ? format(d, 'dd MMM yyyy · HH:mm') : '—';
}

export function fmtDate(iso?: string): string {
  const d = toDate(iso);
  return d ? format(d, 'dd MMM yyyy') : '—';
}

export function fmtClock(d: Date): string {
  return d.toISOString().slice(11, 19);
}

export function incidentCode(id: number): string {
  return `INC-${String(id).padStart(5, '0')}`;
}

export function formatBytes(n?: number): string {
  if (n === undefined || !Number.isFinite(n)) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name: string): string {
  return (
    name.
    split(/[\s._@-]+/).
    filter(Boolean).
    slice(0, 2).
    map((p) => p[0]?.toUpperCase()).
    join('') || '?');

}

export function hoursSince(iso?: string): number {
  const d = toDate(iso);
  return d ? Math.max(0, (Date.now() - d.getTime()) / 3_600_000) : 0;
}

export function fmtDuration(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  const d = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  return h ? `${d}d ${h}h` : `${d}d`;
}

export function humanize(value: string): string {
  const s = value.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}