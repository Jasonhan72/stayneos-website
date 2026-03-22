import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const SRC_DIR = path.resolve('src');
function walk(dir, out = []) { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const p = path.join(dir,e.name); if (e.isDirectory()) walk(p,out); else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) out.push(p);} return out; }
test('no dangerous runtime code injection patterns', () => {
  const bad=[]; for (const file of walk(SRC_DIR)) { const c=fs.readFileSync(file,'utf8'); if (/\beval\s*\(/.test(c)||/new Function\s*\(/.test(c)) bad.push(file);} assert.equal(bad.length,0,`Dangerous patterns found in: ${bad.join(', ')}`);
});
test('no hardcoded high-risk tokens in source', () => {
  const tokenRegex=/(AKIA[0-9A-Z]{16}|ghp_[0-9A-Za-z]{36}|sk_live_[0-9A-Za-z]{24,})/; const bad=[]; for (const file of walk(SRC_DIR)) { const c=fs.readFileSync(file,'utf8'); if (tokenRegex.test(c)) bad.push(file);} assert.equal(bad.length,0,`Potential hardcoded token in: ${bad.join(', ')}`);
});
