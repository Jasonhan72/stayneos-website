"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserAvatarCompact } from "@/components/ui/UserAvatar";
import type { Conversation } from "@/lib/mock/messages";

// ── helpers ──────────────────────────────────────────────
function formatDateDivider(iso: string): string {
  const d = new Date(iso);
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

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function shouldShowDateDivider(
  msgs: Conversation["messages"],
  idx: number,
): boolean {
  if (idx === 0) return true;
  const curr = new Date(msgs[idx].timestamp).toDateString();
  const prev = new Date(msgs[idx - 1].timestamp).toDateString();
  return curr !== prev;
}

// ── Props ────────────────────────────────────────────────
interface Props {
  conversation: Conversation;
  onBack: () => void;
  onToggleDetails: () => void;
  detailsVisible: boolean;
  t: (k: string, d: string) => string;
}

// ── Component ────────────────────────────────────────────
export default function ChatArea({
  conversation,
  onBack,
  onToggleDetails,
  detailsVisible,
  t,
}: Props) {
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation.id]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [newMsg]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    // In real app: call API. For mock: just clear.
    setNewMsg("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

          <UserAvatarCompact
            name={conversation.guestName}
            image={conversation.guestAvatar}
            className="!h-10 !w-10"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {conversation.guestName}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {conversation.propertyTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleDetails}
            className={cn(
              "hidden shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors md:inline-flex items-center gap-1",
              detailsVisible
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {detailsVisible
              ? t("messages.hideDetails", "Hide details")
              : t("messages.showDetails", "Show details")}
          </button>

          {/* Mobile details toggle */}
          <button
            type="button"
            onClick={onToggleDetails}
            className="shrink-0 rounded-full p-2 hover:bg-neutral-100 md:hidden"
            aria-label="Details"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {conversation.messages.map((msg, idx) => (
            <React.Fragment key={msg.id}>
              {shouldShowDateDivider(conversation.messages, idx) && (
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 border-t border-neutral-100" />
                  <span className="shrink-0 text-xs font-medium text-neutral-400">
                    {formatDateDivider(msg.timestamp)}
                  </span>
                  <div className="flex-1 border-t border-neutral-100" />
                </div>
              )}

              <div
                className={cn(
                  "flex gap-3",
                  msg.senderId === "host"
                    ? "flex-row-reverse"
                    : "flex-row",
                )}
              >
                {/* Avatar - only show for guest (left side) */}
                {msg.senderId === "guest" ? (
                  <div className="shrink-0 pt-1">
                    <UserAvatarCompact
                      name={conversation.guestName}
                      image={conversation.guestAvatar}
                      className="!h-7 !w-7"
                    />
                  </div>
                ) : (
                  <div className="w-7 shrink-0" />
                )}

                <div
                  className={cn(
                    "group max-w-[75%] sm:max-w-[65%]",
                    msg.senderId === "host" ? "items-end" : "items-start",
                  )}
                >
                  {/* Bubble */}
                  <div
                    className={cn(
                      "relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.senderId === "host"
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md bg-neutral-100 text-neutral-800",
                    )}
                  >
                    {msg.text}
                  </div>

                  {/* Timestamp & reaction */}
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-2",
                      msg.senderId === "host"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    <span className="text-[11px] text-neutral-400">
                      {formatMsgTime(msg.timestamp)}
                    </span>
                    {msg.reaction && (
                      <span className="text-sm">{msg.reaction}</span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Input Area ────────────────────────────────── */}
      <div className="shrink-0 border-t border-neutral-100 p-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          {/* Attachment button */}
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
            disabled={!newMsg.trim()}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
              newMsg.trim()
                ? "bg-accent text-white hover:bg-accent-600"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed",
            )}
            aria-label={t("messages.send", "Send")}
          >
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
          </button>
        </div>
      </div>
    </div>
  );
}
