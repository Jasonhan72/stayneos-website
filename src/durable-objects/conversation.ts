// ConversationDO: Durable Object for real-time messaging via WebSocket
// Each conversation_id maps to one DO instance
import { verifyToken } from "@/lib/auth/jwt";

interface ConnectedClient {
  socket: WebSocket;
  userId: string;
}

export class ConversationDO {
  private state: DurableObjectState;
  private sessions: Map<string, ConnectedClient>;
  private conversationId: string | null;

  constructor(state: DurableObjectState, _env: unknown) {
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

      // Get conversation_id from DO state storage (persisted) or URL
      this.conversationId = await this.state.storage.get<string>("conversation_id") ?? null;
      if (!this.conversationId) {
        const rawConvId = url.searchParams.get("conversation_id");
        if (!rawConvId) {
          return new Response("Missing conversation_id", { status: 400 });
        }
        this.conversationId = rawConvId;
        await this.state.storage.put("conversation_id", rawConvId);
      }

      // Verify the user is authenticated
      let userId: string;
      try {
        const payload = await verifyToken(token);
        if (!payload?.userId) {
          return new Response("Invalid token: no userId", { status: 401 });
        }
        userId = payload.userId as string;
      } catch (e) {
        return new Response(`Invalid token: ${String(e)}`, { status: 401 });
      }

      const pair = new WebSocketPair();
      const [clientWs, serverWs] = Object.values(pair);
      const socketId = crypto.randomUUID();

      // Accept the server-side socket
      this.state.acceptWebSocket(serverWs as WebSocket);
      (serverWs as WebSocket).serializeAttachment({ userId, socketId });

      this.sessions.set(socketId, { socket: serverWs as WebSocket, userId });

      // Send auth success
      (serverWs as WebSocket).send(JSON.stringify({ type: "auth_success" }));

      return new Response(null, { status: 101, webSocket: clientWs as WebSocket });
    }

    return new Response("WebSocket only", { status: 400 });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== "string") return;

    let message: { type: string; body?: string; attachmentsJson?: string };
    try {
      message = JSON.parse(raw);
    } catch {
      ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
      return;
    }

    const meta = ws.deserializeAttachment() as { userId: string; socketId: string } | undefined;
    if (!meta) return;

    switch (message.type) {
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;

      case "send": {
        if (!message.body?.trim()) {
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

        const msgStr = JSON.stringify(msgPayload);

        // Broadcast to all connected clients in this conversation
        for (const [, client] of this.sessions) {
          try {
            client.socket.send(msgStr);
          } catch {
            // Socket might be closed; cleaned up in webSocketClose
          }
        }
        break;
      }
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
