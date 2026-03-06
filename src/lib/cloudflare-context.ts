// Cloudflare Context Helper for accessing D1 and other bindings
// This stores the env context from the Cloudflare Worker handler

import { AsyncLocalStorage } from 'async_hooks';

interface CloudflareContext {
  env: {
    DB?: D1Database;
    ASSETS?: Fetcher;
    [key: string]: unknown;
  };
  ctx: ExecutionContext;
}

const asyncStorage = new AsyncLocalStorage<CloudflareContext>();

/**
 * Run code with Cloudflare context
 */
export function runWithCloudflareContext<T>(
  env: CloudflareContext['env'],
  ctx: CloudflareContext['ctx'],
  fn: () => T
): T {
  return asyncStorage.run({ env, ctx }, fn);
}

/**
 * Get the current Cloudflare context
 */
export function getCloudflareContext(): CloudflareContext | undefined {
  return asyncStorage.getStore();
}

/**
 * Get D1 database from context
 */
export function getDb(): D1Database {
  const context = getCloudflareContext();
  const db = context?.env.DB;
  if (!db) {
    throw new Error("D1 database binding 'DB' not found. Make sure DB is bound in wrangler.toml");
  }
  return db;
}

/**
 * Get execution context for waitUntil
 */
export function getExecutionContext(): ExecutionContext | undefined {
  return getCloudflareContext()?.ctx;
}
