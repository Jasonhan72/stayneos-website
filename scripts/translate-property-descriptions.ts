#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

function getDatabaseName() {
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

function sqlString(value) {
  if (value === null) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

function runD1(sql) {
  const database = getDatabaseName();
  const args = ['wrangler', 'd1', 'execute', database, '--remote', '--json', '--command', sql];
  const output = execFileSync('npx', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const parsed = JSON.parse(output);
  return parsed.flatMap((item) => item.results || []);
}

async function translate(description, language) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: 'user',
          content: `Translate the following furnished apartment listing description from English to ${language}, preserving tone and any markdown structure. Output only the translation, no explanation. Source: ${description}`,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`DeepSeek HTTP ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('DeepSeek returned an empty translation');
  return content;
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
        const translated = await translate(description, 'Simplified Chinese');
        updates.push(`descriptionZh = ${sqlString(translated)}`);
      }

      if (!row.descriptionFr?.trim()) {
        console.log(`[${row.id}] translating French description...`);
        const translated = await translate(description, 'French');
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
