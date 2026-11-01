import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

if (readdirSync('.').some(file => (file === '.env' || file.startsWith('.env.') || file === '.dev.vars' || file.startsWith('.dev.vars.')) && !file.endsWith('.example'))) {
  throw new Error('Local acceptance requires a clean isolated checkout without existing environment files');
}

// Only for ephemeral local acceptance; no credentials or production resources.
const config = readFileSync('wrangler.toml', 'utf8')
  .replace('name = "stayneos"', 'name = "stayneos-local-test"')
  .replace(/database_id\s*=\s*"[^"]+"/, 'database_id = "00000000-0000-0000-0000-000000000000"')
  .replace(/database_name\s*=\s*"[^"]+"/, 'database_name = "stayneos-local-test"')
  .replace(/bucket_name\s*=\s*"[^"]+"/, 'bucket_name = "stayneos-local-test"')
  .replace('"https://www.stayneos.com"', '"https://127.0.0.1:3173"')
  .replace('ENABLE_EXTERNAL_PROPERTY_SEARCH = "true"', 'ENABLE_EXTERNAL_PROPERTY_SEARCH = "false"')
  .replace('[vars]', '[vars]\nNEXTAUTH_SECRET = \"local-worker-acceptance-secret-not-for-production\"')
  .replace('[ai]\nbinding = "AI"', '')
  .replace(/\[triggers\][\s\S]*$/, '');
writeFileSync('wrangler.local-test.toml', config);

// The baseline already contains booking/property stay-type columns. Do not reapply
// the legacy ALTER migration to an empty database initialized from that baseline.
const migrations = [
  '20260425_account_deletion.sql', '20260425_account_settings_p0.sql',
  '20260425_account_settings_p1_p2.sql', '20260519_token_version.sql',
  '20260515_messaging.sql', '20260516_messaging_airbnb.sql',
  '20260425_wishlist.sql', '0001_property_availability.sql',
  '20260424_admin_calendar_defaults.sql', '20260519_rate_limits.sql',
];
writeFileSync('.local/e2e/schema.sql', [readFileSync('d1-schema.sql', 'utf8'),
  ...migrations.map(file => readFileSync(`migrations/${file}`, 'utf8'))].join('\n'));
