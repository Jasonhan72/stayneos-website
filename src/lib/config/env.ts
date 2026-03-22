const SECRET_KEYS = [
  'NEXTAUTH_SECRET_PROD',
  'NEXTAUTH_SECRET',
  'JWT_SECRET',
] as const;

export function getAuthSecret(): string {
  for (const key of SECRET_KEYS) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  throw new Error('Missing auth secret: set NEXTAUTH_SECRET_PROD (preferred), NEXTAUTH_SECRET, or JWT_SECRET');
}

export function getPublicBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'https://stayneos.com';
}
