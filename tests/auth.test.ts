import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword } from '@/lib/auth';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('missing@')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts valid passwords', () => {
    expect(isValidPassword('abc123').valid).toBe(true);
    expect(isValidPassword('Password1').valid).toBe(true);
  });

  it('rejects too short passwords', () => {
    const result = isValidPassword('ab1');
    expect(result.valid).toBe(false);
  });

  it('rejects passwords without letters', () => {
    const result = isValidPassword('123456');
    expect(result.valid).toBe(false);
  });

  it('rejects passwords without numbers', () => {
    const result = isValidPassword('abcdef');
    expect(result.valid).toBe(false);
  });
});
