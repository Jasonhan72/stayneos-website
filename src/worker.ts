import worker from "../.open-next/worker";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type Env = {
  DB: D1Database;
};

type ExecutionContextLike = {
  waitUntil(promise: Promise<unknown>): void;
};

type ScheduledEventLike = {
  cron: string;
  scheduledTime: number;
};

async function deletePendingAccounts(env: Env) {
  const db = env.DB;
  const dueUsers = await db
    .prepare(`
      SELECT id
      FROM User
      WHERE deletionStatus = 'pending_deletion'
        AND deletionScheduledAt IS NOT NULL
        AND deletionScheduledAt <= ?
    `)
    .bind(new Date().toISOString())
    .all<{ id: string }>();

  const userIds = (dueUsers.results || []).map((row) => row.id).filter(Boolean);
  if (userIds.length === 0) {
    console.log('[scheduled-delete] no due users');
    return;
  }

  for (const userId of userIds) {
    const statements = [
      db.prepare('DELETE FROM Booking WHERE userId = ?').bind(userId),
      db.prepare('DELETE FROM Wishlist WHERE userId = ?').bind(userId),
      db.prepare('DELETE FROM user_notification_preferences WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM User WHERE id = ?').bind(userId),
    ];

    try {
      await db.batch(statements);
      console.log(`[scheduled-delete] deleted user ${userId}`);
    } catch (error) {
      console.error(`[scheduled-delete] failed for user ${userId}`, error);
      throw error;
    }
  }
}

const appWorker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContextLike) {
    return worker.fetch(request, env, ctx);
  },

  async scheduled(_event: ScheduledEventLike, env: Env, ctx: ExecutionContextLike) {
    const symbol = Symbol.for('__cloudflare-context__');
    (globalThis as Record<symbol, unknown>)[symbol] = getCloudflareContext();
    ctx.waitUntil(deletePendingAccounts(env));
  },
};

export default appWorker;
