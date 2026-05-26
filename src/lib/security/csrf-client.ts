const CSRF_COOKIE = 'stayneos_csrf';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Ensure a CSRF token exists in the browser cookie jar and return it.
 * Uses SameSite=Lax so cookies are sent on same-site POST fetches.
 * Call this early (on mount) so the cookie is warm before any API call needs it.
 */
export function ensureCsrfToken(): string {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  const token = crypto.randomUUID().replace(/-/g, '');
  // Secure flag is safe on HTTPS (stayneos.com is always HTTPS).
  // SameSite=Lax allows the cookie on same-site fetches including POST.
  document.cookie = `${CSRF_COOKIE}=${token}; path=/; SameSite=Lax; Secure`;
  return token;
}

/**
 * Like ensureCsrfToken() but also returns whether the token is freshly created.
 * Useful for callers that want to retry after a fresh token generation.
 */
export function ensureCsrfTokenWithStatus(): { token: string; isFresh: boolean } {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return { token: existing, isFresh: false };
  const token = crypto.randomUUID().replace(/-/g, '');
  document.cookie = `${CSRF_COOKIE}=${token}; path=/; SameSite=Lax; Secure`;
  return { token, isFresh: true };
}

/**
 * Send a CSRF-protected fetch. Automatically retries once if CSRF fails.
 * Returns the Response on success, or the last failed Response.
 */
export async function csrfFetch(
  url: string,
  init: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> } = {},
): Promise<Response> {
  const attempt = async (forceFresh: boolean): Promise<Response> => {
    const csrf = forceFresh
      ? (() => {
          const token = crypto.randomUUID().replace(/-/g, '');
          document.cookie = `${CSRF_COOKIE}=${token}; path=/; SameSite=Lax; Secure`;
          return token;
        })()
      : ensureCsrfToken();

    const headers: Record<string, string> = {
      ...(init.headers || {}),
      'x-csrf-token': csrf,
    };
    // Only set JSON content-type if there's a body AND it's not FormData/Blob
    // (browser must set its own multipart boundary for FormData).
    const isFormLike =
      typeof FormData !== 'undefined' && init.body instanceof FormData;
    const isBlobLike =
      typeof Blob !== 'undefined' && init.body instanceof Blob;
    const hasCT =
      'Content-Type' in headers ||
      'content-type' in headers;
    if (!hasCT && init.body && !isFormLike && !isBlobLike) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
      ...init,
      headers,
      credentials: 'include',
    });
  };

  let res = await attempt(false);
  if (res.status === 403) {
    // Try once more with a fresh token in case the browser dropped the cookie
    res = await attempt(true);
  }
  return res;
}
