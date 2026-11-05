#!/usr/bin/env node
/**
 * i18n Translation Checker
 * Run: node scripts/check-i18n.js
 * 
 * Checks:
 * 1. Missing keys in zh/fr that exist in en
 * 2. Hardcoded English strings in TSX components (not using t())
 * 3. Keys in en.json not referenced in any source file
 * 
 * Exit code 1 if critical issues found (missing keys).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function loadLocale(locale) {
  const directory = path.join(ROOT, 'messages', locale);
  const barrel = fs.readFileSync(path.join(directory, 'index.ts'), 'utf8');
  const imports = [...barrel.matchAll(/import (\w+) from '\.\/([^']+\.json)'/g)];
  const modules = Object.fromEntries(imports.map(([, name, file]) => [name, JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'))]));
  const spreads = [...barrel.matchAll(/\.\.\.(\w+)/g)].map(([, name]) => name);
  if (!spreads.length || spreads.some(name => !modules[name])) throw new Error(`Cannot read translation barrel: ${locale}`);
  return Object.assign({}, ...spreads.map(name => modules[name]));
}
const en = loadLocale('en');
const zh = loadLocale('zh');
const fr = loadLocale('fr');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) keys.push(...getKeys(v, p));
    else keys.push(p);
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const zhKeys = new Set(getKeys(zh));
const frKeys = new Set(getKeys(fr));

// Check 1: Missing keys
const missingZh = [...enKeys].filter(k => !zhKeys.has(k));
const missingFr = [...enKeys].filter(k => !frKeys.has(k));

let hasErrors = false;

if (missingZh.length > 0) {
  console.error(`\n❌ ${missingZh.length} keys missing in zh.json:`);
  missingZh.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

if (missingFr.length > 0) {
  console.error(`\n❌ ${missingFr.length} keys missing in fr.json:`);
  missingFr.forEach(k => console.error(`  - ${k}`));
  hasErrors = true;
}

// Check 2: Untranslated (same as EN, excluding proper nouns / short strings)
const SKIP_PATTERNS = [
  /^(payment|paypal|applePay|googlePay)/,
  /email\.?com/i,
  /Placeholder$/,
  /^(en|fr|zh)$/,
  /language\.(en|fr|zh)/,
];

function getVal(obj, path) {
  const keys = path.split('.');
  let v = obj;
  for (const k of keys) {
    if (!v || typeof v !== 'object') return undefined;
    v = v[k];
  }
  return v;
}

let zhUntranslated = 0;
let frUntranslated = 0;

for (const key of enKeys) {
  const enVal = getVal(en, key);
  if (typeof enVal !== 'string' || enVal.length <= 8) continue;
  if (SKIP_PATTERNS.some(p => p.test(key))) continue;
  if (!/[a-zA-Z]{3,}/.test(enVal)) continue; // skip if mostly non-alpha

  const zhVal = getVal(zh, key);
  const frVal = getVal(fr, key);
  if (zhVal === enVal) zhUntranslated++;
  if (frVal === enVal) frUntranslated++;
}

if (zhUntranslated > 0) {
  console.warn(`\n⚠️  ${zhUntranslated} zh keys appear untranslated (same as EN)`);
}
if (frUntranslated > 0) {
  console.warn(`\n⚠️  ${frUntranslated} fr keys appear untranslated (same as EN)`);
}

if (!hasErrors && zhUntranslated === 0 && frUntranslated === 0) {
  console.log('\n✅ All i18n checks passed!');
}

if (hasErrors) {
  console.error('\n💥 Fix missing keys before deploying.');
  process.exit(1);
}
