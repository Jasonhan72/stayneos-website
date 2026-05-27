"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import ConversationList from "@/components/messages/ConversationList";
import ChatArea from "@/components/messages/ChatArea";
import BookingCard from "@/components/messages/BookingCard";
import type { ApiAttachment, ApiConversation, ApiMessage } from "@/types/api/messages";
import { csrfFetch } from "@/lib/security/csrf-client";
import { cn } from "@/lib/utils";

export default function MessagingShell({ className, compact }: { className?: string; compact?: boolean }) {
  const { t } = useI18n();
  const { isLoading: authLoading, user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);
  const initializedBookingRef = useRef<string | null>(null);

  const selectedConv = useMemo(() => selectedId ? conversations.find((c) => c.id === selectedId) ?? null : null, [conversations, selectedId]);

  const publishUnread = useCallback((count: number) => {
    try {
      window.localStorage.setItem("stayneos_unread_messages", String(count));
      window.dispatchEvent(new CustomEvent("stayneos:unread-messages", { detail: { count } }));
    } catch {}
  }, []);

  const fetchConversations = useCallback(async (quiet = false) => {
    if (!user) return;
    if (quiet) setRefreshing(true); else setApiLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConversations(data.conversations || []);
      publishUnread(Number(data.unreadCount || 0));
      if (!selectedId && data.conversations?.length && window.matchMedia("(min-width: 768px)").matches) {
        setSelectedId(data.conversations[0].id);
        setDetailsVisible(window.matchMedia("(min-width: 1280px)").matches);
      }
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setApiLoading(false);
      setRefreshing(false);
    }
  }, [publishUnread, selectedId, user]);

  const fetchMessages = useCallback(async (convId: string, opts?: { older?: boolean; quiet?: boolean }) => {
    if (opts?.older) setLoadingOlder(true); else if (opts?.quiet) setRefreshing(true); else setMsgsLoading(true);
    setThreadError(null);
    try {
      const url = new URL(`/api/conversations/${convId}/messages`, window.location.origin);
      url.searchParams.set("limit", "50");
      if (opts?.older && cursor) url.searchParams.set("cursor", cursor);
      if (opts?.quiet) url.searchParams.set("markRead", "false");
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCursor(data.cursor || null);
      setMessages((prev) => opts?.older ? [...(data.messages || []), ...prev] : (data.messages || []));
      if (!opts?.quiet) fetchConversations(true);
    } catch (e) {
      setThreadError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setMsgsLoading(false);
      setLoadingOlder(false);
      setRefreshing(false);
    }
  }, [cursor, fetchConversations]);

  const createFromBooking = useCallback(async (bookingId: string) => {
    if (!user || initializedBookingRef.current === bookingId) return;
    initializedBookingRef.current = bookingId;
    try {
      const res = await csrfFetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_id: bookingId, type: "host_guest" }) });
      if (res.ok) {
        const data = await res.json();
        await fetchConversations(true);
        setSelectedId(data.conversation?.id || null);
        setDetailsVisible(window.matchMedia("(min-width: 1280px)").matches);
      }
    } catch {}
  }, [fetchConversations, user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { const bookingId = searchParams.get("booking_id") || searchParams.get("booking"); if (bookingId) createFromBooking(bookingId); }, [createFromBooking, searchParams]);
  useEffect(() => { if (selectedId) fetchMessages(selectedId); else setMessages([]); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!user) return; const id = window.setInterval(() => { fetchConversations(true); if (selectedId) fetchMessages(selectedId, { quiet: true }); }, 8000); return () => window.clearInterval(id); }, [fetchConversations, fetchMessages, selectedId, user]);

  const handleSelect = useCallback((id: string) => { setSelectedId(id); setDetailsVisible(window.matchMedia("(min-width: 1280px)").matches); }, []);

  const handleSendMessage = useCallback(async (text: string, attachments?: ApiAttachment[]) => {
    if (!selectedId || (!text.trim() && !attachments?.length)) return;
    const res = await csrfFetch(`/api/conversations/${selectedId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text, attachments }) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setMessages((prev) => [...prev, data.message]);
    fetchConversations(true);
  }, [fetchConversations, selectedId]);

  if (authLoading) return <div className={cn("flex h-full items-center justify-center", className)}><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-950" /></div>;

  return (
    <div className={cn("flex h-full overflow-hidden rounded-none bg-white md:border-x md:border-neutral-200", className)}>
      <div className={`${selectedConv ? "hidden md:block" : "block"} w-full shrink-0 border-r border-neutral-200 ${compact ? "md:w-[320px]" : "md:w-[390px]"}`}>
        <ConversationList conversations={conversations} selectedId={selectedId} unreadOnly={unreadOnly} loading={apiLoading} error={listError} onSelect={handleSelect} onToggleUnread={() => setUnreadOnly((v) => !v)} onRetry={() => fetchConversations()} t={t} />
      </div>
      <div className={`${selectedConv ? "flex" : "hidden md:flex"} min-w-0 flex-1`}>
        {selectedConv ? (
          <ChatArea conversation={selectedConv} messages={messages} loading={msgsLoading} loadingOlder={loadingOlder} hasMore={!!cursor} refreshing={refreshing} error={threadError} onBack={() => setSelectedId(null)} onLoadOlder={() => selectedId && fetchMessages(selectedId, { older: true })} onSend={handleSendMessage} onToggleDetails={() => setDetailsVisible((v) => !v)} detailsVisible={detailsVisible} t={t} currentUserId={user?.id || ""} />
        ) : (
          <DesktopEmpty />
        )}
      </div>
      {selectedConv ? <BookingCard conversation={selectedConv} visible={detailsVisible} onClose={() => setDetailsVisible(false)} t={t} forceOverlay={compact} /> : null}
    </div>
  );
}

function DesktopEmpty() { const { t } = useI18n(); return <div className="hidden h-full flex-1 flex-col items-center justify-center bg-[#F7F7F7] text-center md:flex"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-sm"><MessageCircle className="h-9 w-9 text-neutral-300" /></div><h2 className="text-xl font-semibold text-neutral-950">{t("messages.selectConversation", "Select a conversation")}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">{t('messages.chooseThread', 'Choose a guest or host message to see the full thread and reservation details.')}</p></div>; }
