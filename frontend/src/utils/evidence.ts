export const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;

export const EVIDENCE_MIME_TYPES = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain', 'text/csv'];

export const EVIDENCE_ACCEPT = '.png,.jpg,.jpeg,.pdf,.txt,.csv,image/png,image/jpeg,application/pdf,text/plain,text/csv';

const EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf', 'txt', 'csv'];

export function validateEvidenceFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeOk = EVIDENCE_MIME_TYPES.includes(file.type) || !file.type && EXTENSIONS.includes(ext);
  if (!typeOk || !EXTENSIONS.includes(ext)) return 'Unsupported file type. Use PNG, JPEG, PDF, TXT or CSV.';
  if (file.size > EVIDENCE_MAX_BYTES) return 'File exceeds the 10 MB limit.';
  if (file.size === 0) return 'File is empty.';
  return null;
}

export function evidenceKind(contentType?: string, fileName?: string): 'image' | 'pdf' | 'text' | 'csv' | 'file' {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (contentType?.startsWith('image/') || ext === 'png' || ext === 'jpg' || ext === 'jpeg') return 'image';
  if (contentType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (contentType === 'text/csv' || ext === 'csv') return 'csv';
  if (contentType?.startsWith('text/') || ext === 'txt') return 'text';
  return 'file';
}