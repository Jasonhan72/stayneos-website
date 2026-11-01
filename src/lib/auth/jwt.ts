import { SignJWT, jwtVerify } from 'jose';
import { getAuthSecret } from '@/lib/config/env';

function getSecret() {
  return new TextEncoder().encode(getAuthSecret());
}

export async function signToken(payload: Record<string, unknown>, expiresIn = '7d'): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'], requiredClaims: ['exp', 'iat'] });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}
