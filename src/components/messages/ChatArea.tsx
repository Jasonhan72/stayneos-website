"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserAvatarCompact } from "@/components/ui/UserAvatar";
import type { ApiConversation, ApiMessage } from "@/types/api/messages";

// ── helpers ──────────────────────────────────────────────
function formatDateDivider(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMsgTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function shouldShowDateDivider(msgs: ApiMessage[], idx: number): boolean {
  if (idx === 0) return true;
  const curr = new Date(msgs[idx].createdAt).toDateString();
  const prev = new Date(msgs[idx - 1].createdAt).toDateString();
  return curr !== prev;
}

// ── Props ────────────────────────────────────────────────
interface Props {
  conversation: ApiConversation;
  messages: ApiMessage[];
  loading: boolean;
  wsConnected: boolean;
  onBack: () => void;
  onSend: (text: string) => Promise<void>;
  onToggleDetails: () => void;
  detailsVisible: boolean;
  t: (k: string, d: string) => string;
  currentUserId: string;
}

// ── Component ────────────────────────────────────────────
export default function ChatArea({
  conversation,
  messages,
  loading,
  wsConnected,
  onBack,
  onSend,
  onToggleDetails,
  detailsVisible,
  t,
  currentUserId,
}: Props) {
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [newMsg]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await onSend(newMsg.trim());
      setNewMsg("");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const label = conversation.type === "host_guest" ? "Guest" : "Chat";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* ── Sticky Header ─────────────────────────────── */}
      <div className="shrink-0 border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Mobile back button */}
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 md:hidden"
            aria-label={t("messages.backToList", "Back to messages")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-700"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <UserAvatarCompact name={label} image={null} className="!h-10 !w-10" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">{label}</p>
            <p className="truncate text-xs text-neutral-500">
              {conversation.type === "host_guest" ? "Host-Guest Chat" : "Direct Message"}
              {wsConnected && (
                <span className="ml-1 text-green-600">● connected</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleDetails}
            className={cn(
              "hidden shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors md:inline-flex items-center gap-1",
              detailsVisible
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            )}
          >
            {detailsVisible
              ? t("messages.hideDetails", "Hide details")
              : t("messages.showDetails", "Show details")}
          </button>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-accent" />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <React.Fragment key={msg.id}>
                  {shouldShowDateDivider(messages, idx) && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 border-t border-neutral-100" />
                      <span className="shrink-0 text-xs font-medium text-neutral-400">
                        {formatDateDivider(msg.createdAt)}
                      </span>
                      <div className="flex-1 border-t border-neutral-100" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex gap-3",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar - only show for other users */}
                    {!isOwn ? (
                      <div className="shrink-0 pt-1">
                        <UserAvatarCompact name={label} image={null} className="!h-7 !w-7" />
                      </div>
                    ) : (
                      <div className="w-7 shrink-0" />
                    )}

                    <div
                      className={cn(
                        "group max-w-[75%] sm:max-w-[65%]",
                        isOwn ? "items-end" : "items-start"
                      )}
                    >
                      {/* Bubble */}
                      <div
                        className={cn(
                          "relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          isOwn
                            ? "rounded-br-md bg-accent text-white"
                            : "rounded-bl-md bg-neutral-100 text-neutral-800"
                        )}
                      >
                        {msg.body}
                      </div>

                      {/* Timestamp */}
                      <div
                        className={cn(
                          "mt-1 flex items-center gap-2",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <span className="text-[11px] text-neutral-400">
                          {formatMsgTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Input Area ────────────────────────────────── */}
      <div className="shrink-0 border-t border-neutral-100 p-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          {/* Attachment button (placeholder) */}
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label={t("messages.attachFile", "Attach file")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("messages.typeMessage", "Type a message...")}
            className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-neutral-400 focus:bg-white"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
              newMsg.trim() && !sending
                ? "bg-accent text-white hover:bg-accent/90"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            )}
            aria-label={t("messages.send", "Send")}
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
