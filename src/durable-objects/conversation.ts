// ConversationDO: Durable Object for real-time messaging via WebSocket
// Each conversation_id maps to one DO instance
import { verifySessionToken, isSessionActive, type SessionEnv, type SessionIdentity } from "../lib/auth/edge-session";

interface ConnectedClient {
  socket: WebSocket;
  userId: string;
}

export class ConversationDO {
  private state: DurableObjectState;
  private sessions: Map<string, ConnectedClient>;
  private conversationId: string | null;

  constructor(state: DurableObjectState, private env: SessionEnv) {
    this.state = state;
    this.sessions = new Map();
    this.conversationId = null;

    // Resume any existing WebSocket connections on hibernation wake
    for (const ws of state.getWebSockets()) {
      const meta = ws.deserializeAttachment() as { userId: string; socketId: string } | undefined;
      if (meta) {
        this.sessions.set(meta.socketId, { socket: ws, userId: meta.userId });
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      const token = url.searchParams.get("token");
      if (!token) {
        return new Response("Missing auth token", { status: 401 });
      }

      const identity = await verifySessionToken(token, this.env);
      if (!identity) return new Response("Unauthorized", { status: 401 });
      const requestedId = url.searchParams.get("conversation_id");
      if (!requestedId) return new Response("Missing conversation_id", { status: 400 });
      const storedId = await this.state.storage.get<string>("conversation_id");
      if (storedId && storedId !== requestedId) return new Response("Conversation mismatch", { status: 403 });
      this.conversationId = storedId || requestedId;
      if (!await this.isMember(identity)) return new Response("Forbidden", { status: 403 });
      // Persist the identity of the DO only after authenticating membership.
      if (!storedId) await this.state.storage.put("conversation_id", requestedId);
      const userId = identity.userId;

      const pair = new WebSocketPair();
      const [clientWs, serverWs] = Object.values(pair);
      const socketId = crypto.randomUUID();

      // Accept the server-side socket
      this.state.acceptWebSocket(serverWs as WebSocket);
      (serverWs as WebSocket).serializeAttachment({ ...identity, socketId });

      this.sessions.set(socketId, { socket: serverWs as WebSocket, userId });

      // Send auth success
      (serverWs as WebSocket).send(JSON.stringify({ type: "auth_success" }));

      return new Response(null, { status: 101, webSocket: clientWs as WebSocket });
    }

    return new Response("WebSocket only", { status: 400 });
  }

  private async isMember(identity: SessionIdentity): Promise<boolean> {
    if (!this.conversationId || !await isSessionActive(identity, this.env.DB)) return false;
    try {
      return !!await this.env.DB.prepare('SELECT user_id FROM ConversationParticipant WHERE conversation_id = ? AND user_id = ?')
        .bind(this.conversationId, identity.userId).first();
    } catch { return false; }
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== "string" || raw.length > 16384) return;

    let message: { type: string; body?: string; attachmentsJson?: string };
    try {
      message = JSON.parse(raw);
    } catch {
      ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
      return;
    }

    if (!message || typeof message !== 'object' || typeof message.type !== 'string') return;
    const meta = ws.deserializeAttachment() as (SessionIdentity & { socketId: string }) | undefined;
    this.conversationId = await this.state.storage.get<string>("conversation_id") ?? null;
    if (!meta || !await this.isMember(meta)) {
      ws.close(1008, "Session or membership expired");
      if (meta) this.sessions.delete(meta.socketId);
      return;
    }

    switch (message.type) {
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;

      case "send":
        await this.saveMessage(ws, meta, message);
        break;
    }
  }

  private async saveMessage(ws: WebSocket, meta: SessionIdentity, message: { body?: string; attachmentsJson?: string }): Promise<void> {
    if (typeof message.body !== "string" || !message.body.trim() || (message.attachmentsJson !== undefined && typeof message.attachmentsJson !== "string")) {
      ws.send(JSON.stringify({ type: "error", error: "Empty message" }));
      return;
    }

    const msgId = crypto.randomUUID();
    const now = Date.now();
    const msgPayload = {
      type: "new_message",
      message: {
        id: msgId,
        conversation_id: this.conversationId,
        conversationId: this.conversationId,
        sender_id: meta.userId,
        senderId: meta.userId,
        body: message.body,
        attachments_json: message.attachmentsJson ?? "[]",
        attachmentsJson: message.attachmentsJson ?? "[]",
        created_at: now,
        createdAt: now,
      },
    };

    try {
      await this.env.DB.batch([
        this.env.DB.prepare('INSERT INTO Message (id, conversation_id, sender_id, body, attachments_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(msgId, this.conversationId, meta.userId, message.body, message.attachmentsJson ?? '[]', now),
        this.env.DB.prepare('UPDATE Conversation SET updated_at = ? WHERE id = ?').bind(now, this.conversationId),
      ]);
      await this.broadcast(msgPayload);
    } catch {
      ws.send(JSON.stringify({ type: "error", error: "Message could not be saved" }));
    }
  }

  private async broadcast(payload: unknown): Promise<void> {
    const data = JSON.stringify(payload);
    for (const [id, client] of this.sessions) {
      const identity = client.socket.deserializeAttachment() as SessionIdentity;
      if (!identity || !await this.isMember(identity)) {
        client.socket.close(1008, "Session or membership expired");
        this.sessions.delete(id);
        continue;
      }
      try { client.socket.send(data); } catch { this.sessions.delete(id); }
    }
  }

  async webSocketClose(
    ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean
  ): Promise<void> {
    const meta = ws.deserializeAttachment() as { socketId: string } | undefined;
    if (meta) {
      this.sessions.delete(meta.socketId);
    }
  }

  async webSocketError(ws: WebSocket, _error: Error): Promise<void> {
    const meta = ws.deserializeAttachment() as { socketId: string } | undefined;
    if (meta) {
      this.sessions.delete(meta.socketId);
    }
  }
}
