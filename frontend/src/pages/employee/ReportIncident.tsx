import React, { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PaperclipIcon, XIcon, SendIcon, AlertOctagonIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { createIncident } from '../../services/incidentService';
import { uploadEvidence } from '../../services/evidenceService';
import { PageHeader } from '../../components/ui/PageHeader';
import { TextField } from '../../components/ui/TextField';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { INCIDENT_TYPES, SEVERITY_META, TYPE_META } from '../../utils/incidentMeta';
import { EVIDENCE_ACCEPT, validateEvidenceFile } from '../../utils/evidence';
import { getErrorMessage } from '../../utils/api';
import { formatBytes, incidentCode } from '../../utils/format';
import type { IncidentType, Severity } from '../../types/incident';

const SEVERITY_ORDER: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface Staged {
  key: string;
  file: File;
  error: string | null;
}

export function ReportIncidentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialType = params.get('type') as IncidentType | null;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IncidentType | null>(initialType && INCIDENT_TYPES.includes(initialType) ? initialType : null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [files, setFiles] = useState<Staged[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const errors = {
    title: title.trim().length < 5 ? 'Give the incident a short, specific title (5+ characters).' : undefined,
    type: !type ? 'Choose the closest match.' : undefined,
    severity: !severity ? 'Pick your best estimate — an analyst will confirm.' : undefined,
    description: description.trim().length < 20 ? 'Describe what happened in at least 20 characters.' : undefined
  };
  const valid = !Object.values(errors).some(Boolean);
  const validFiles = files.filter((f) => !f.error);

  const addFiles = (list: FileList) => {
    const next = Array.from(list).map((file) => ({ key: `${file.name}-${file.size}-${Math.random()}`, file, error: validateEvidenceFile(file) }));
    setFiles((f) => [...f, ...next]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid || !type || !severity) return;
    setServerError(null);
    setPhase('Filing incident…');
    try {
      const created = await createIncident({ title: title.trim(), description: description.trim(), type, severity });
      let failed = 0;
      for (let i = 0; i < validFiles.length; i++) {
        setPhase(`Uploading evidence ${i + 1} of ${validFiles.length}…`);
        try {
          if (created.id) await uploadEvidence(created.id, validFiles[i].file);
        } catch {
          failed++;
        }
      }
      if (failed) toast.warning(`${failed} attachment${failed > 1 ? 's' : ''} failed to upload. You can retry from the incident page.`);
      toast.success(created.id ? `${incidentCode(created.id)} reported` : 'Incident reported');
      navigate(created.id ? `/incidents/${created.id}` : '/employee/incidents', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not file the incident.'));
      setPhase(null);
    }
  };

  const busy = phase !== null;

  return (
    <div>
      <PageHeader title="Report an incident" description="Tell the security team what you noticed. You'll be able to follow progress and add evidence later." />
      <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          {serverError &&
          <div role="alert" className="flex items-start gap-2.5 rounded-md border border-crit/40 bg-crit/[0.07] px-3 py-2.5 text-sm text-ink">
              <AlertOctagonIcon className="mt-0.5 h-4 w-4 shrink-0 text-crit" aria-hidden />
              {serverError}
            </div>
          }

          <TextField
            label="Title"
            placeholder="e.g. Email asking me to re-enter my SSO password"
            value={title}
            maxLength={140}
            onChange={(e) => setTitle(e.target.value)}
            error={submitted ? errors.title : undefined} />
          

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-muted">What kind of incident is it?</legend>
            <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {INCIDENT_TYPES.map((t) => {
                const Icon = TYPE_META[t].icon;
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setType(t)}
                    className={twMerge(
                      'flex h-full flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-[border-color,background-color,transform] duration-150 ease-out active:scale-[0.98]',
                      active ? 'border-accent bg-accent/[0.06]' : 'border-line bg-surface hover:border-line-strong'
                    )}>
                    
                    <Icon className={twMerge('h-4 w-4', active ? 'text-accent' : 'text-muted')} aria-hidden />
                    <span className="text-sm font-medium text-ink">{TYPE_META[t].label}</span>
                    <span className="text-2xs leading-snug text-faint">{TYPE_META[t].hint}</span>
                  </button>);

              })}
            </div>
            {submitted && errors.type && <p className="mt-2 text-xs text-crit">{errors.type}</p>}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-muted">How severe does it seem?</legend>
            <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SEVERITY_ORDER.map((s) => {
                const m = SEVERITY_META[s];
                const active = severity === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSeverity(s)}
                    className={twMerge(
                      'flex flex-col gap-3 rounded-lg border p-3.5 text-left transition-[border-color,background-color,transform] duration-150 ease-out active:scale-[0.98]',
                      active ? 'bg-raised' : 'border-line bg-surface hover:border-line-strong'
                    )}
                    style={active ? { borderColor: m.hex } : undefined}>
                    
                    <span className="flex items-end gap-[3px]" aria-hidden>
                      {[1, 2, 3, 4].map((n) =>
                      <span key={n} className={twMerge('w-1.5 rounded-[1px]', n <= m.rank ? m.bg : 'bg-line-strong')} style={{ height: 5 + n * 3 }} />
                      )}
                    </span>
                    <span className={twMerge('text-sm font-medium', active ? m.text : 'text-ink')}>{m.label}</span>
                  </button>);

              })}
            </div>
            <p className={twMerge('mt-2 text-xs', submitted && errors.severity ? 'text-crit' : 'text-muted')}>
              {severity ? SEVERITY_META[severity].description : submitted && errors.severity ? errors.severity : 'Not sure? Pick your best guess — the SOC confirms severity during triage.'}
            </p>
          </fieldset>

          <TextArea
            label="What happened?"
            rows={7}
            counter={{ max: 4000 }}
            placeholder="When did you notice it, what did you see, what did you click or enter, and who else might be affected?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={submitted ? errors.description : undefined} />
          
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">Evidence</h2>
            <p className="mt-0.5 text-xs text-muted">Screenshots, exported headers, logs. PNG, JPEG, PDF, TXT or CSV up to 10 MB.</p>
            {files.length > 0 &&
            <ul className="mt-4 space-y-2">
                {files.map((f) =>
              <li key={f.key} className={twMerge('flex items-center gap-3 rounded-md border px-3 py-2', f.error ? 'border-crit/40' : 'border-line')}>
                    <PaperclipIcon className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{f.file.name}</p>
                      <p className={twMerge('font-mono text-2xs', f.error ? 'text-crit' : 'text-faint')}>{f.error ?? formatBytes(f.file.size)}</p>
                    </div>
                    <button type="button" aria-label={`Remove ${f.file.name}`} onClick={() => setFiles((x) => x.filter((y) => y.key !== f.key))} className="rounded p-1 text-faint hover:text-ink">
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
              )}
              </ul>
            }
            <Button className="mt-4 w-full" icon={PaperclipIcon} onClick={() => fileRef.current?.click()} disabled={busy}>
              Attach files
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={EVIDENCE_ACCEPT}
              className="sr-only"
              aria-label="Attach evidence files"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }} />
            
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Type</dt>
                <dd className="text-ink">{type ? TYPE_META[type].label : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Severity</dt>
                <dd className={severity ? SEVERITY_META[severity].text : 'text-ink'}>{severity ? SEVERITY_META[severity].label : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Attachments</dt>
                <dd className="font-mono text-ink">{validFiles.length}</dd>
              </div>
            </dl>
            <Button type="submit" variant="primary" icon={SendIcon} loading={busy} className="mt-5 h-11 w-full">
              {busy ? phase : 'Submit report'}
            </Button>
            <p className="mt-3 text-2xs text-faint">Your report is visible to you and the security team. Submission is recorded in the audit trail.</p>
          </section>
        </aside>
      </form>
    </div>);

}