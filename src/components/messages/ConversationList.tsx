"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import { Image as ImageIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatarCompact } from "@/components/ui/UserAvatar";
import type { ApiConversation } from "@/types/api/messages";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

interface Props { conversations: ApiConversation[]; selectedId: string | null; unreadOnly: boolean; loading: boolean; error?: string | null; onSelect: (id: string) => void; onToggleUnread: () => void; onRetry: () => void; t: (k: string, d: string) => string; }

export default function ConversationList({ conversations, selectedId, unreadOnly, loading, error, onSelect, onToggleUnread, onRetry, t }: Props) {
  const filtered = unreadOnly ? conversations.filter((c) => (c.unreadCount || 0) > 0) : conversations;
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);
  return <div className="flex h-full flex-col bg-white">
    <div className="shrink-0 border-b border-neutral-200 px-5 pb-4 pt-5"><div className="flex items-center justify-between"><h1 className="text-[32px] font-semibold tracking-[-0.03em] text-neutral-950">{t("messages.title", "Messages")}</h1>{totalUnread > 0 ? <span className="rounded-full bg-[#FF385C] px-2 py-1 text-xs font-bold text-white">{totalUnread}</span> : null}</div><div className="mt-4 flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5"><Search className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Search messages</span></div></div>
    <div className="shrink-0 border-b border-neutral-100 px-5 py-3"><div className="flex gap-2"><button type="button" onClick={() => unreadOnly && onToggleUnread()} className={cn("rounded-full px-4 py-2 text-sm font-semibold", !unreadOnly ? "bg-neutral-950 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100")}>All</button><button type="button" onClick={() => !unreadOnly && onToggleUnread()} className={cn("rounded-full px-4 py-2 text-sm font-semibold", unreadOnly ? "bg-neutral-950 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100")}>Unread</button></div></div>
    <div className="flex-1 overflow-y-auto">{loading ? <ConversationSkeleton /> : null}{error && !loading ? <div className="m-5 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"><p className="font-semibold">Messages could not load.</p><p className="mt-1 text-red-600/80">{error}</p><button onClick={onRetry} className="mt-3 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white">Retry</button></div> : null}{!loading && !error && filtered.length === 0 ? <EmptyInbox compact={unreadOnly} /> : null}{!loading && !error ? filtered.map((conv) => { const name = conv.otherPerson?.name || (conv.type === "host_guest" ? "StayNeos host" : "Guest"); const preview = conv.lastMessage?.body || (conv.lastMessage?.attachments?.length ? "Sent a photo" : "No messages yet"); const ts = conv.lastMessage?.createdAt ?? conv.updatedAt ?? conv.createdAt; const unread = conv.unreadCount || 0; return <button key={conv.id} type="button" onClick={() => onSelect(conv.id)} className={cn("grid w-full grid-cols-[52px_1fr_64px] gap-3 border-b border-neutral-100 px-5 py-4 text-left transition hover:bg-neutral-50", selectedId === conv.id && "bg-neutral-50")}><div className="relative"><UserAvatarCompact name={name} image={conv.otherPerson?.avatar || null} className="!h-12 !w-12" />{unread ? <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#FF385C]" /> : null}</div><div className="min-w-0"><div className="flex items-center gap-2"><p className={cn("truncate text-[15px] text-neutral-950", unread ? "font-bold" : "font-semibold")}>{name}</p>{unread ? <span className="rounded-full bg-[#FF385C]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#C13515]">{unread}</span> : null}</div><p className="mt-0.5 truncate text-xs font-medium text-neutral-500">{conv.property?.title || "StayNeos conversation"}</p><p className={cn("mt-1 truncate text-sm", unread ? "font-semibold text-neutral-900" : "text-neutral-500")}>{preview}</p></div><div className="flex flex-col items-end justify-between gap-2"><span className="text-xs text-neutral-400">{ts ? formatTime(ts) : ""}</span><div className="h-12 w-14 overflow-hidden rounded-xl bg-neutral-100">{conv.property?.imageUrl ? <img src={conv.property.imageUrl} alt="" width={56} height={48} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-5 w-5 text-neutral-300" /></div>}</div></div></button>; }) : null}</div>
  </div>;
}
function ConversationSkeleton() { return <div className="space-y-0 p-5">{[0,1,2,3].map((i) => <div key={i} className="flex gap-3 border-b border-neutral-100 py-4"><div className="h-12 w-12 animate-pulse rounded-full bg-neutral-100"/><div className="flex-1 space-y-2"><div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100"/><div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100"/><div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100"/></div></div>)}</div>; }
function EmptyInbox({ compact }: { compact?: boolean }) { return <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center"><div className="relative mb-6 h-24 w-24 rounded-[32px] bg-[#FFF8F6]"><div className="absolute left-5 top-6 h-10 w-14 rounded-2xl bg-[#FF385C]/15" /><div className="absolute left-9 top-11 h-10 w-14 rounded-2xl bg-[#00A699]/15" /><div className="absolute left-8 top-8 h-8 w-10 rounded-2xl border-2 border-neutral-900 bg-white" /></div><h2 className="text-lg font-semibold text-neutral-950">{compact ? "No unread messages" : "No messages yet"}</h2><p className="mt-2 max-w-[260px] text-sm leading-6 text-neutral-500">When guests or hosts contact you about a stay, the conversation will show up here.</p></div>; }
