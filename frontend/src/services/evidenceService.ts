import { api } from '../utils/api';
import { normalizeEvidence, unwrapList } from '../utils/normalize';
import type { Evidence } from '../types/incident';

export async function listEvidence(incidentId: number): Promise<Evidence[]> {
  const { data } = await api.get(`/api/incidents/${incidentId}/evidence`);
  return unwrapList(data).map(normalizeEvidence);
}

export async function uploadEvidence(
incidentId: number,
file: File,
onProgress?: (ratio: number) => void)
: Promise<Evidence> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/api/incidents/${incidentId}/evidence`, form, {
    onUploadProgress: (e) => onProgress?.(e.total ? e.loaded / e.total : 0)
  });
  return normalizeEvidence(data);
}

export async function downloadEvidence(incidentId: number, evidence: Evidence): Promise<void> {
  const response = await api.get(`/api/incidents/${incidentId}/evidence/${evidence.id}/download`, {
    responseType: 'blob'
  });
  const disposition = String(response.headers['content-disposition'] ?? '');
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const fileName = match ? decodeURIComponent(match[1]) : evidence.fileName;
  const url = URL.createObjectURL(response.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}