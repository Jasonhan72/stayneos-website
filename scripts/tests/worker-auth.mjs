import assert from 'node:assert/strict';

const base = 'https://127.0.0.1:3173';
const cookies = new Map([['stayneos_csrf', 'local-acceptance-csrf']]);
async function request(path, body, cookieOverride) {
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': 'local-acceptance-csrf',
      Cookie: cookieOverride ?? [...cookies].map(([key, value]) => `${key}=${value}`).join('; '),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';')[0];
    const separator = pair.indexOf('=');
    cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  return { status: response.status, body: await response.json() };
}
const email = `worker-${crypto.randomUUID()}@example.test`;
const password = 'LocalAcceptance123!';
assert.equal((await request('/api/auth/register', { firstName: 'Local', lastName: 'Acceptance', email, password })).status, 201);
assert.equal((await request('/api/auth/session')).body.user.email, email);
assert.equal((await request('/api/bookings')).status, 200);
const registrationCookie = [...cookies].map(([key, value]) => `${key}=${value}`).join('; ');
assert.equal((await request('/api/auth/logout', {})).status, 200);
assert.equal((await request('/api/bookings', undefined, registrationCookie)).status, 401);
assert.equal((await request('/api/auth/login', { email, password })).status, 200);
assert.equal((await request('/api/auth/session')).body.user.email, email);
assert.equal((await request('/api/bookings')).status, 200);
const loginCookie = [...cookies].map(([key, value]) => `${key}=${value}`).join('; ');
assert.equal((await request('/api/auth/logout', {})).status, 200);
assert.equal((await request('/api/bookings', undefined, loginCookie)).status, 401);
console.log('PASS: local D1 registration, session, booking authorization, login and token revocation (10 assertions)');
