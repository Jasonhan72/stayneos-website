"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { UserAvatarCompact } from "@/components/ui/UserAvatar";
import type { Conversation } from "@/types/api/messages";

// ── helpers ──────────────────────────────────────────────
function formatTime(iso: string, t: (k: string, d: string) => string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / 86400000,
  );
  if (diffDays === 0) return t("messages.today", "Today");
  if (diffDays === 1) return t("messages.yesterday", "Yesterday");
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

// ── types ────────────────────────────────────────────────
interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  unreadOnly: boolean;
  onSelect: (id: string) => void;
  onToggleUnread: () => void;
  t: (k: string, d: string) => string;
}

// ── component ────────────────────────────────────────────
export default function ConversationList({
  conversations,
  selectedId,
  unreadOnly,
  onSelect,
  onToggleUnread,
  t,
}: Props) {
  const filtered = unreadOnly
    ? conversations.filter((c) => c.unread)
    : conversations;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-neutral-100 px-5 py-4">
        <h1 className="text-2xl font-bold text-neutral-900">
          {t("messages.title", "Messages")}
        </h1>
      </div>

      {/* All / Unread tabs */}
      <div className="shrink-0 border-b border-neutral-100 px-5 py-3">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => unreadOnly && onToggleUnread()}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !unreadOnly
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
            )}
          >
            {t("messages.all", "All")}
          </button>
          <button
            type="button"
            onClick={() => !unreadOnly && onToggleUnread()}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              unreadOnly
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
            )}
          >
            {t("messages.unread", "Unread")}
          </button>
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-neutral-400"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">
              {t("messages.noConversations", "No messages yet")}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {t(
                "messages.noConversationsDesc",
                "When guests message you, their conversations will appear here.",
              )}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-neutral-50",
                selectedId === conv.id
                  ? "bg-neutral-50 border-r-2 border-neutral-900"
                  : "border-r-2 border-transparent",
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0 pt-0.5">
                <UserAvatarCompact
                  name={conv.guestName}
                  image={conv.guestAvatar}
                />
                {conv.unread && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-neutral-900">
                    {conv.guestName}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      conv.unread
                        ? "font-semibold text-neutral-900"
                        : "text-neutral-400",
                    )}
                  >
                    {formatTime(conv.lastMessageAt, t)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {conv.propertyTitle}
                </p>
                <p
                  className={cn(
                    "mt-1 truncate text-sm",
                    conv.unread
                      ? "font-medium text-neutral-800"
                      : "text-neutral-500",
                  )}
                >
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
