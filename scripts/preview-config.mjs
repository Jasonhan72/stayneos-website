import { readFileSync, writeFileSync } from 'node:fs';

// Generate a separate preview config; never deploy the production bindings under another name.
const source = readFileSync('wrangler.toml', 'utf8');
const database = process.env.PREVIEW_D1_DATABASE_ID || '';
const bucket = process.env.PREVIEW_R2_BUCKET || '';
const productionDatabase = source.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
const productionBucket = source.match(/bucket_name\s*=\s*"([^"]+)"/)?.[1];
if (!/^[0-9a-f-]{36}$/i.test(database) || database.toLowerCase() === productionDatabase?.toLowerCase()) {
  throw new Error('PREVIEW_D1_DATABASE_ID must identify a separate, initialized test database');
}
if (!/^[a-z0-9][a-z0-9-]{2,62}$/.test(bucket) || bucket === productionBucket) {
  throw new Error('PREVIEW_R2_BUCKET must identify a separate test bucket');
}
const config = source
  .replace('name = "stayneos"', 'name = "stayneos-preview"')
  .replace(/database_name\s*=\s*"[^"]+"/, 'database_name = "stayneos-preview"')
  .replace(/database_id\s*=\s*"[^"]+"/, `database_id = "${database}"`)
  .replace(/bucket_name\s*=\s*"[^"]+"/, `bucket_name = "${bucket}"`)
  .replace('ENABLE_EXTERNAL_PROPERTY_SEARCH = "true"', 'ENABLE_EXTERNAL_PROPERTY_SEARCH = "false"')
  .replace('NEXTAUTH_URL = "https://www.stayneos.com"', 'NEXTAUTH_URL = "https://stayneos-preview.jasonhan72.workers.dev"')
  .replace(/\[triggers\][\s\S]*$/, '');
writeFileSync('wrangler.preview.toml', config);
