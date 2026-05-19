/**
 * AES-256-GCM encryption for sensitive data (e.g. OAuth tokens).
 * Uses Web Crypto API (works in Cloudflare Workers and Node 19+).
 *
 * ENCRYPTION_KEY must be a 32-byte (64-hex-char) key in the environment.
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

function getKey(): Uint8Array {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) throw new Error('ENCRYPTION_KEY is not set');
  if (hex.length < 64) throw new Error('ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function importKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', raw.buffer as ArrayBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

/**
 * Encrypt a string, returns base64-encoded IV + ciphertext.
 * Format: base64(iv) + "." + base64(ciphertext)
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey(getKey());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return `${btoa(String.fromCharCode(...iv))}.${btoa(String.fromCharCode(...new Uint8Array(ciphertext)))}`;
}

/**
 * Decrypt a string produced by encrypt().
 */
export async function decrypt(ciphertext: string): Promise<string> {
  const key = await importKey(getKey());
  const [ivB64, ctB64] = ciphertext.split('.');
  if (!ivB64 || !ctB64) throw new Error('Invalid ciphertext format');
  const iv = new Uint8Array(atob(ivB64).split('').map((c) => c.charCodeAt(0)));
  const ct = new Uint8Array(atob(ctB64).split('').map((c) => c.charCodeAt(0)));
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plaintext);
}

/**
 * Encrypt if value is truthy, otherwise return null.
 */
export async function encryptOptional(value?: string | null): Promise<string | null> {
  if (!value) return null;
  return encrypt(value);
}

/**
 * Decrypt if value is truthy, otherwise return null.
 */
export async function decryptOptional(value?: string | null): Promise<string | null> {
  if (!value) return null;
  try {
    return decrypt(value);
  } catch {
    return null;
  }
}
