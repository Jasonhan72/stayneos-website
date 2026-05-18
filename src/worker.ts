import worker from "../.open-next/worker";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ConversationDO } from "@/durable-objects/conversation";

type Env = {
  DB: D1Database;
  CONVERSATIONS: DurableObjectNamespace<ConversationDO>;
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
    // Handle WebSocket upgrade for messaging
    const url = new URL(request.url);
    if (url.pathname === "/api/messages/ws") {
      const conversationId = url.searchParams.get("conversation_id");
      if (!conversationId) {
        return new Response("Missing conversation_id", { status: 400 });
      }
      const doId = env.CONVERSATIONS.idFromName(conversationId);
      const stub = env.CONVERSATIONS.get(doId);
      return stub.fetch(request);
    }

    const response = await worker.fetch(request, env, ctx);

// For non-RSC GET requests (normal browser page loads), strip the
    // Next.js Vary header so Cloudflare CDN can cache the response.
    // Next.js sets Vary: rsc, next-router-state-tree, ... which makes
    // every request look unique to the CDN → near-zero cache hit rate.
    const isGet = request.method === 'GET';
    const isRsc = request.headers.get('rsc') || request.headers.get('next-router-state-tree');
    const isApi = url.pathname.startsWith('/api/');
    const isStatic = url.pathname.startsWith('/_next/');

    if (isGet && !isRsc && !isApi && !isStatic && response.ok) {
      const newHeaders = new Headers(response.headers);
      // Remove next.js internal vary dimensions; keep only standard ones
      newHeaders.delete('vary');
      // Re-set a minimal Vary: Accept-Encoding for compression
      newHeaders.set('vary', 'Accept-Encoding');
      newHeaders.set('x-perf-worker', 'deployed-v3-ok');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // Diagnostic: verify worker code is deployed (unconditional)
    const diagHeaders = new Headers(response.headers);
    diagHeaders.set('x-perf-worker', 'deployed-v3');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: diagHeaders,
    });
  },

  async scheduled(_event: ScheduledEventLike, env: Env, ctx: ExecutionContextLike) {
    const symbol = Symbol.for('__cloudflare-context__');
    (globalThis as Record<symbol, unknown>)[symbol] = getCloudflareContext();
    ctx.waitUntil(deletePendingAccounts(env));
  },
};

export default appWorker;
export { ConversationDO };
