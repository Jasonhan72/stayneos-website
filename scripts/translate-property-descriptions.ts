#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { translateDescription } from '../src/lib/translate-description';

type PropertyDescriptionRow = {
  id: string;
  description: string | null;
  descriptionZh: string | null;
  descriptionFr: string | null;
};

function getDatabaseName(): string {
  if (process.env.D1_DATABASE_NAME) return process.env.D1_DATABASE_NAME;
  if (process.env.DB_NAME) return process.env.DB_NAME;

  try {
    const wranglerToml = readFileSync('wrangler.toml', 'utf8');
    const match = wranglerToml.match(/database_name\s*=\s*"([^"]+)"/);
    if (match?.[1]) return match[1];
  } catch {
    // Fall through to the project default.
  }

  return 'stayneos-db';
}

function sqlString(value: string | null): string {
  if (value === null) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

function runD1(sql: string): PropertyDescriptionRow[] {
  const database = getDatabaseName();
  const args = ['wrangler', 'd1', 'execute', database, '--remote', '--json', '--command', sql];
  const output = execFileSync('npx', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const parsed = JSON.parse(output) as Array<{ results?: PropertyDescriptionRow[] }>;
  return parsed.flatMap((item) => item.results || []);
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('DEEPSEEK_API_KEY is not set. Skipping translation.');
    return;
  }

  const rows = runD1(`
    SELECT id, description, descriptionZh, descriptionFr
    FROM Property
    WHERE description IS NOT NULL
      AND TRIM(description) != ''
      AND (
        descriptionZh IS NULL OR TRIM(descriptionZh) = ''
        OR descriptionFr IS NULL OR TRIM(descriptionFr) = ''
      )
    ORDER BY updatedAt DESC
  `);

  console.log(`Found ${rows.length} properties needing translations.`);

  for (const row of rows) {
    try {
      const updates = [];
      const description = row.description || '';

      if (!row.descriptionZh?.trim()) {
        console.log(`[${row.id}] translating Chinese description...`);
        const translated = await translateDescription(description, 'zh', { DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY });
        if (!translated) throw new Error('DeepSeek returned an empty Chinese translation');
        updates.push(`descriptionZh = ${sqlString(translated)}`);
      }

      if (!row.descriptionFr?.trim()) {
        console.log(`[${row.id}] translating French description...`);
        const translated = await translateDescription(description, 'fr', { DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY });
        if (!translated) throw new Error('DeepSeek returned an empty French translation');
        updates.push(`descriptionFr = ${sqlString(translated)}`);
      }

      if (updates.length === 0) {
        console.log(`[${row.id}] already translated.`);
        continue;
      }

      runD1(`UPDATE Property SET ${updates.join(', ')}, updatedAt = datetime('now') WHERE id = ${sqlString(row.id)}`);
      console.log(`[${row.id}] updated ${updates.length} field(s).`);
    } catch (error) {
      console.error(`[${row.id}] failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
