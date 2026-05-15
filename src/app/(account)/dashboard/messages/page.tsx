"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import ConversationList from "@/components/messages/ConversationList";
import ChatArea from "@/components/messages/ChatArea";
import type { ApiConversation, ApiMessage } from "@/types/api/messages";

export default function MessagesPage() {
  const { t } = useI18n();
  const { isLoading: authLoading, user } = useAuth();

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const selectedConv = selectedId
    ? conversations.find((c) => c.id === selectedId) ?? null
    : null;

  // Fetch conversations from real API
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setApiLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error("Failed to fetch conversations:", e);
    } finally {
      setApiLoading(false);
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setMsgsLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to fetch messages:", e);
    } finally {
      setMsgsLoading(false);
    }
  }, []);

  // Connect WebSocket for real-time messages
  const connectWS = useCallback(
    (convId: string) => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Get auth token from cookie - we need to read the token
      const cookieMatch = document.cookie.match(
        /(?:stayneos_auth_token|auth-token|auth_token)=([^;]+)/
      );
      const token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      if (!token) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const ws = new WebSocket(
        `${protocol}//${host}/api/messages/ws?conversation_id=${convId}&token=${encodeURIComponent(token)}`
      );

      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_message") {
            setMessages((prev) => [...prev, data.message]);
            // Refresh conversation list to update lastMessage
            fetchConversations();
          } else if (data.type === "auth_error") {
            console.error("WS auth error:", data.error);
          }
        } catch {
          // ignore
        }
      };
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);

      wsRef.current = ws;
    },
    [fetchConversations]
  );

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // When a conversation is selected, fetch messages + connect WS
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      connectWS(selectedId);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setWsConnected(false);
      }
    };
  }, [selectedId, fetchMessages, connectWS]);

  // Send message
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedId || !text.trim()) return;
      try {
        const res = await fetch(`/api/conversations/${selectedId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [...prev, data.message]);
          fetchConversations();
        }
      } catch (e) {
        console.error("Failed to send message:", e);
      }
    },
    [selectedId, fetchConversations]
  );

  // ── Loading ──────────────────────────────────────────
  if (authLoading) {
    return (
      <PageShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-accent" />
        </div>
      </PageShell>
    );
  }

  // ── Layout ───────────────────────────────────────────
  return (
    <PageShell>
      <div className="flex h-full">
        {/* Left: Conversation list */}
        <div
          className={`shrink-0 border-r border-neutral-100 ${
            selectedConv ? "hidden md:block md:w-[340px]" : "w-full md:w-[340px]"
          }`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            unreadOnly={unreadOnly}
            loading={apiLoading}
            onSelect={(id) => {
              setSelectedId(id);
              setDetailsVisible(false);
            }}
            onToggleUnread={() => setUnreadOnly(!unreadOnly)}
            t={t}
          />
        </div>

        {/* Center: Chat */}
        <div
          className={`flex-1 ${
            selectedConv ? "w-full" : "hidden md:flex md:items-center md:justify-center"
          }`}
        >
          {selectedConv ? (
            <ChatArea
              conversation={selectedConv}
              messages={messages}
              loading={msgsLoading}
              wsConnected={wsConnected}
              onBack={() => setSelectedId(null)}
              onSend={handleSendMessage}
              onToggleDetails={() => setDetailsVisible(!detailsVisible)}
              detailsVisible={detailsVisible}
              t={t}
              currentUserId={user?.id || ""}
            />
          ) : (
            <div className="hidden flex-col items-center justify-center text-center md:flex">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-neutral-400"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-neutral-700">
                {t("messages.selectConversation", "Select a conversation to start chatting")}
              </h2>
              <p className="mt-2 text-sm text-neutral-500 max-w-xs">
                {t("messages.noMessagesHint", "No conversations yet. Start messaging with guests or hosts.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ── Shell ──────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh-64px)] flex-col bg-white md:h-[calc(100vh-80px)] overflow-hidden">
      {children}
    </main>
  );
}
