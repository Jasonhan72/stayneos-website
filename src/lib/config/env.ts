const SECRET_KEYS = ['NEXTAUTH_SECRET_PROD', 'NEXTAUTH_SECRET', 'JWT_SECRET'] as const;

const DEFAULT_BASE_URL = 'https://stayneos.com';

export function getAuthSecret(): string {
  for (const key of SECRET_KEYS) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  throw new Error('Missing auth secret: set NEXTAUTH_SECRET_PROD (preferred), NEXTAUTH_SECRET, or JWT_SECRET');
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL;
}

export function getPublicBaseUrl(): string {
  return getBaseUrl();
}

export function getCookieDomain(hostname?: string): string | undefined {
  const baseHostname = new URL(getBaseUrl()).hostname;
  const targetHost = hostname || baseHostname;
  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(targetHost);

  if (isLocalhost) {
    return undefined;
  }

  return `.${baseHostname}`;
}
