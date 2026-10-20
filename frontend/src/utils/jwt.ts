export function decodeJwt(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, '=');
    const json = decodeURIComponent(
      atob(padded).
      split('').
      map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).
      join('')
    );
    const parsed: unknown = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwt(token);
  const exp = payload?.exp;
  return typeof exp === 'number' && exp * 1000 < Date.now();
}