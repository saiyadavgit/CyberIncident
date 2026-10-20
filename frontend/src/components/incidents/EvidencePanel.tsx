import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DownloadIcon,
  FileImageIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileIcon,
  UploadCloudIcon,
  CheckIcon,
  AlertTriangleIcon,
  ShieldCheckIcon } from
'lucide-react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { listEvidence, uploadEvidence, downloadEvidence } from '../../services/evidenceService';
import { useAsync } from '../../hooks/useAsync';
import { getErrorMessage } from '../../utils/api';
import { EVIDENCE_ACCEPT, evidenceKind, validateEvidenceFile } from '../../utils/evidence';
import { formatBytes, relTime, fmtDateTime } from '../../utils/format';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { Button } from '../ui/Button';
import type { Evidence } from '../../types/incident';

interface UploadItem {
  key: string;
  name: string;
  size: number;
  progress: number;
  state: 'uploading' | 'done' | 'error';
  error?: string;
}

const KIND_ICON = { image: FileImageIcon, pdf: FileTextIcon, text: FileTextIcon, csv: FileSpreadsheetIcon, file: FileIcon };

interface EvidencePanelProps {
  incidentId: number;
  canUpload?: boolean;
  onLoaded?: (list: Evidence[]) => void;
  onUploaded?: () => void;
}

export function EvidencePanel({ incidentId, canUpload = true, onLoaded, onUploaded }: EvidencePanelProps) {
  const { data, loading, error, reload } = useAsync(async () => {
    const list = await listEvidence(incidentId);
    onLoaded?.(list);
    return list;
  }, [incidentId]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = (key: string, p: Partial<UploadItem>) => setUploads((u) => u.map((x) => x.key === key ? { ...x, ...p } : x));

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      for (const file of arr) {
        const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
        const invalid = validateEvidenceFile(file);
        setUploads((u) => [...u, { key, name: file.name, size: file.size, progress: 0, state: invalid ? 'error' : 'uploading', error: invalid ?? undefined }]);
        if (invalid) continue;
        try {
          await uploadEvidence(incidentId, file, (r) => patch(key, { progress: r }));
          patch(key, { state: 'done', progress: 1 });
          toast.success(`${file.name} uploaded`);
          setTimeout(() => setUploads((u) => u.filter((x) => x.key !== key)), 1800);
        } catch (e) {
          patch(key, { state: 'error', error: getErrorMessage(e, 'Upload failed') });
        }
      }
      await reload();
      onUploaded?.();
    },
    [incidentId, reload, onUploaded]
  );

  const onDownload = async (ev: Evidence) => {
    setDownloading(ev.id);
    try {
      await downloadEvidence(incidentId, ev);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Download failed'));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      {canUpload &&
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
        className={twMerge(
          'flex flex-col items-center justify-between gap-4 rounded-lg border border-dashed px-5 py-5 transition-colors duration-150 ease-out sm:flex-row',
          dragging ? 'border-accent bg-accent/[0.05]' : 'border-line-strong'
        )}>
        
          <div className="flex items-center gap-3">
            <UploadCloudIcon className={twMerge('h-5 w-5', dragging ? 'text-accent' : 'text-muted')} aria-hidden />
            <div>
              <p className="text-sm text-ink">Drop files to attach evidence</p>
              <p className="text-2xs text-faint">PNG, JPEG, PDF, TXT, CSV · up to 10 MB each · validated server-side</p>
            </div>
          </div>
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
          <input
          ref={inputRef}
          type="file"
          multiple
          accept={EVIDENCE_ACCEPT}
          className="sr-only"
          aria-label="Upload evidence files"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = '';
          }} />
        
        </div>
      }

      <AnimatePresence initial={false}>
        {uploads.map((u) =>
        <motion.div
          key={u.key}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden">
          
            <div className="rounded-md border border-line bg-raised/50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-ink">{u.name}</span>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-2xs">
                  {u.state === 'uploading' && <span className="text-muted tabular">{Math.round(u.progress * 100)}%</span>}
                  {u.state === 'done' &&
                <>
                      <CheckIcon className="h-3.5 w-3.5 text-ok" aria-hidden />
                      <span className="text-ok">Stored</span>
                    </>
                }
                  {u.state === 'error' &&
                <>
                      <AlertTriangleIcon className="h-3.5 w-3.5 text-crit" aria-hidden />
                      <span className="text-crit">Rejected</span>
                    </>
                }
                </span>
              </div>
              {u.state === 'error' ?
            <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">{u.error}</p>
                  <button type="button" onClick={() => setUploads((x) => x.filter((y) => y.key !== u.key))} className="text-2xs text-faint hover:text-ink">
                    Dismiss
                  </button>
                </div> :

            <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line">
                  <div className={twMerge('h-full transition-[width] duration-200 ease-out', u.state === 'done' ? 'bg-ok' : 'bg-accent')} style={{ width: `${u.progress * 100}%` }} />
                </div>
            }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !data ?
      <LoadingState rows={2} label="Loading evidence" /> :
      error ?
      <ErrorState message={error} onRetry={reload} /> :
      data && data.length ?
      <ul className="divide-y divide-line rounded-lg border border-line">
          {data.map((ev) => {
          const Icon = KIND_ICON[evidenceKind(ev.contentType, ev.fileName)];
          return (
            <li key={ev.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-raised">
                  <Icon className="h-4 w-4 text-muted" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{ev.fileName}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-2xs text-faint">
                    <span>{formatBytes(ev.size)}</span>
                    {ev.uploadedBy && <span>{ev.uploadedBy}</span>}
                    {ev.uploadedAt && <span title={fmtDateTime(ev.uploadedAt)}>{relTime(ev.uploadedAt)}</span>}
                    {ev.checksum &&
                  <span className="inline-flex items-center gap-1" title={`SHA-256 ${ev.checksum}`}>
                        <ShieldCheckIcon className="h-3 w-3" aria-hidden />
                        {ev.checksum.slice(0, 10)}…
                      </span>
                  }
                  </p>
                </div>
                <Button size="sm" variant="ghost" icon={DownloadIcon} loading={downloading === ev.id} onClick={() => onDownload(ev)} aria-label={`Download ${ev.fileName}`}>
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </li>);

        })}
        </ul> :

      <p className="rounded-lg border border-line px-4 py-6 text-center text-sm text-muted">No evidence attached yet.</p>
      }
    </div>);

}