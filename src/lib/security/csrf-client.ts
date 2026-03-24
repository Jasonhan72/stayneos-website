const CSRF_COOKIE = 'stayneos_csrf';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function ensureCsrfToken(): string {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  const token = crypto.randomUUID().replace(/-/g, '');
  document.cookie = `${CSRF_COOKIE}=${token}; path=/; SameSite=Lax`;
  return token;
}
