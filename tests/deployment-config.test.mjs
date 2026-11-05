import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const production = readFileSync('wrangler.toml', 'utf8');
const productionId = production.match(/database_id\s*=\s*"([^"]+)"/)[1];
const productionBucket = production.match(/bucket_name\s*=\s*"([^"]+)"/)[1];
const database = '11111111-2222-3333-4444-555555555555';
function generate(env, check) {
  const cwd = mkdtempSync(join(tmpdir(), 'stayneos-preview-config-'));
  try {
    copyFileSync('wrangler.toml', join(cwd, 'wrangler.toml'));
    const result = spawnSync(process.execPath, [resolve('scripts/preview-config.mjs')], { cwd, env, encoding: 'utf8' });
    check(result, cwd);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
}
test('preview cannot use missing bindings or production resources', () => {
  for (const env of [{}, { PREVIEW_D1_DATABASE_ID: productionId.toUpperCase(), PREVIEW_R2_BUCKET: 'test-bucket' }, { PREVIEW_D1_DATABASE_ID: productionId, PREVIEW_R2_BUCKET: 'test-bucket' }, { PREVIEW_D1_DATABASE_ID: database, PREVIEW_R2_BUCKET: productionBucket }]) {
    generate(env, result => assert.notEqual(result.status, 0));
  }
});
test('preview configuration uses only isolated storage and has no production cron', () => {
  generate({ PREVIEW_D1_DATABASE_ID: database, PREVIEW_R2_BUCKET: 'test-bucket' }, (result, cwd) => {
    assert.equal(result.status, 0, result.stderr);
    const config = readFileSync(join(cwd, 'wrangler.preview.toml'), 'utf8');
    assert.ok(!config.includes(productionId));
    assert.ok(!config.includes(`bucket_name = "${productionBucket}"`));
    assert.ok(!config.includes('[triggers]'));
    assert.ok(config.includes('name = "stayneos-preview"'));
  });
});
