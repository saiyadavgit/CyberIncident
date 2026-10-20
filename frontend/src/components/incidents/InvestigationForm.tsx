import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SaveIcon } from 'lucide-react';
import { saveInvestigation } from '../../services/investigationService';
import { getErrorMessage } from '../../utils/api';
import { relTime } from '../../utils/format';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import type { Incident, InvestigationInput } from '../../types/incident';

const FIELDS: {key: keyof InvestigationInput;label: string;hint: string;rows: number;}[] = [
{ key: 'findings', label: 'Findings', hint: 'What was observed: scope, affected users/hosts, indicators, timeline.', rows: 6 },
{ key: 'rootCause', label: 'Root cause', hint: 'The control gap or behaviour that allowed this to happen.', rows: 3 },
{ key: 'actionsTaken', label: 'Actions taken', hint: 'Containment and eradication steps completed so far.', rows: 4 },
{ key: 'recommendations', label: 'Recommendations', hint: 'Follow-up work to prevent recurrence.', rows: 3 }];


const fromIncident = (i: Incident): InvestigationInput => ({
  findings: i.investigation?.findings ?? '',
  rootCause: i.investigation?.rootCause ?? '',
  actionsTaken: i.investigation?.actionsTaken ?? '',
  recommendations: i.investigation?.recommendations ?? ''
});

export function InvestigationForm({ incident, onSaved }: {incident: Incident;onSaved: () => void;}) {
  const [form, setForm] = useState<InvestigationInput>(() => fromIncident(incident));
  const [baseline, setBaseline] = useState<InvestigationInput>(() => fromIncident(incident));
  const [exists, setExists] = useState(Boolean(incident.investigation));
  const [savedAt, setSavedAt] = useState<string | undefined>(incident.investigation?.updatedAt);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = fromIncident(incident);
    setForm(next);
    setBaseline(next);
    setExists(Boolean(incident.investigation));
    setSavedAt(incident.investigation?.updatedAt);
  }, [incident]);

  const dirty = useMemo(() => FIELDS.some((f) => form[f.key] !== baseline[f.key]), [form, baseline]);
  const empty = FIELDS.every((f) => !form[f.key].trim());

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveInvestigation(incident.id, form, exists);
      setExists(true);
      setBaseline(form);
      setSavedAt(new Date().toISOString());
      toast.success('Investigation saved');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save investigation'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5">
      {FIELDS.map((f) =>
      <TextArea
        key={f.key}
        label={f.label}
        hint={f.hint}
        rows={f.rows}
        value={form[f.key]}
        onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />

      )}
      <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-3 border-t border-line bg-surface px-5 py-3">
        <p className="font-mono text-2xs text-faint" aria-live="polite">
          {dirty ? <span className="text-med">Unsaved changes</span> : savedAt ? `Saved ${relTime(savedAt)}` : exists ? 'Saved' : 'Not yet saved'}
        </p>
        <Button type="submit" variant="primary" icon={SaveIcon} loading={saving} disabled={!dirty || empty}>
          {exists ? 'Save changes' : 'Create investigation'}
        </Button>
      </div>
    </form>);

}