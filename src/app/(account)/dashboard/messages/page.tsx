"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { mockConversations } from "@/lib/mock/messages";
import ConversationList from "@/components/messages/ConversationList";
import ChatArea from "@/components/messages/ChatArea";
import BookingCard from "@/components/messages/BookingCard";

export default function MessagesPage() {
  const { t } = useI18n();
  const { isLoading: authLoading } = useAuth();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const selectedConv = selectedId
    ? mockConversations.find((c) => c.id === selectedId) ?? null
    : null;

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

  // ── Layout: three-column on desktop ──────────────────
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
            conversations={mockConversations}
            selectedId={selectedId}
            unreadOnly={unreadOnly}
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
              onBack={() => setSelectedId(null)}
              onToggleDetails={() => setDetailsVisible(!detailsVisible)}
              detailsVisible={detailsVisible}
              t={t}
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
                {t(
                  "messages.selectConversation",
                  "Select a conversation to start chatting",
                )}
              </h2>
            </div>
          )}
        </div>

        {/* Right: Booking details */}
        {selectedConv && (
          <BookingCard
            conversation={selectedConv}
            visible={detailsVisible}
            onClose={() => setDetailsVisible(false)}
            t={t}
          />
        )}
      </div>
    </PageShell>
  );
}

// ── Shell: full-height wrapper ──────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh-64px)] flex-col bg-white md:h-[calc(100vh-80px)] overflow-hidden">
      {children}
    </main>
  );
}
