import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const directory = await mkdtemp(join(tmpdir(), 'stayneos-worker-tests-'));
try {
  const outfile = join(directory, 'runtime.test.mjs');
  await build({ entryPoints: ['tests/workers/runtime.node.ts'], outfile, bundle: true, platform: 'node', format: 'esm', target: 'node24', packages: 'bundle', external: ['node:*'], tsconfig: 'tsconfig.json' });
  const result = spawnSync(process.execPath, ['--test', outfile], { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test', NEXTAUTH_SECRET_PROD: 'local-only-worker-regression-auth-secret' } });
  process.exitCode = result.status ?? 1;
} finally { await rm(directory, { recursive: true, force: true }); }
