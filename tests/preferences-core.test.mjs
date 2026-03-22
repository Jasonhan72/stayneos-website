import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocale, resolveCurrency } from '../src/lib/preferences/core.js';

test('resolveLocale prefers first supported locale', () => {
  assert.equal(resolveLocale(null, 'de', 'fr', 'en'), 'fr');
});

test('resolveLocale falls back to en', () => {
  assert.equal(resolveLocale(undefined, 'jp'), 'en');
});

test('resolveCurrency prefers first supported currency', () => {
  assert.equal(resolveCurrency('BTC', 'USD', 'CAD'), 'USD');
});

test('resolveCurrency falls back to CAD', () => {
  assert.equal(resolveCurrency('BTC', 'JPY'), 'CAD');
});
