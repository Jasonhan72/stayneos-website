const CSRF_COOKIE = 'stayneos_csrf';
const CSRF_HEADER = 'x-csrf-token';

export function generateCsrfToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

export function getCookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function validateCsrf(request: Request): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  const cookieToken = getCookieValue(request, CSRF_COOKIE);
  const headerToken = request.headers.get(CSRF_HEADER);
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

export function getCsrfConfig() {
  return { cookieName: CSRF_COOKIE, headerName: CSRF_HEADER };
}
