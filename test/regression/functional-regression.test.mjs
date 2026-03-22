import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('core app files exist', () => {
  for (const file of ['src/app/page.tsx','src/app/layout.tsx','src/app/api']) assert.ok(fs.existsSync(file), `Missing required file/path: ${file}`);
});

test('env template includes required safety vars', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  for (const key of ['NEXTAUTH_SECRET', 'DATABASE_URL']) assert.match(envExample, new RegExp(`^${key}=`, 'm'));
});
