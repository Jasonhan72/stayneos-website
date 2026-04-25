"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

type InquiryRow = {
  id: string;
  type: string;
  subject: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

type InboxResponse = {
  inquiries: InquiryRow[];
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function statusColor(status: string): string {
  const s = status.toUpperCase();
  if (s === "NEW") return "bg-blue-50 text-blue-700";
  if (s === "CONTACTED") return "bg-amber-50 text-amber-700";
  if (s === "CLOSED") return "bg-neutral-100 text-neutral-500";
  return "bg-emerald-50 text-emerald-700";
}

export default function MessagesPage() {
  const { locale } = useI18n();
  const { isAuthenticated, isLoading } = useAuth();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selected, setSelected] = useState<InquiryRow | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLoadingData(false);
      return;
    }
    fetch("/api/host/inbox", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        const body = (await res.json()) as InboxResponse;
        setInquiries(body.inquiries ?? []);
      })
      .catch(() => {
        // silently fail — show empty state
      })
      .finally(() => setLoadingData(false));
  }, [isLoading, isAuthenticated]);

  if (isLoading || loadingData) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-8">
            {L("消息", "Messages", "Messages")}
          </h1>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-8">
          {L("消息", "Messages", "Messages")}
        </h1>

        {!isAuthenticated && (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
            <p className="text-sm text-neutral-600">
              {L("登录后可查看消息。", "Log in to see your messages.", "Connectez-vous pour voir vos messages.")}
            </p>
          </div>
        )}

        {isAuthenticated && inquiries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
            <MessageCircle className="mx-auto mb-3 w-6 h-6 text-neutral-400" />
            <p className="text-sm text-neutral-600 mb-4">
              {L(
                "暂无消息。我们的团队通常会在 2 小时内回复。",
                "No messages yet. Our team typically responds within 2 hours.",
                "Aucun message pour le moment. Notre équipe répond généralement sous 2 heures."
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                {L("联系我们", "Contact us", "Nous contacter")}
              </Link>
              <a
                href="https://wa.me/16478626518"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                WhatsApp <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {isAuthenticated && inquiries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100 max-h-[60vh] overflow-y-auto">
              {inquiries.map((inq) => (
                <button
                  key={inq.id}
                  onClick={() => setSelected(inq)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selected?.id === inq.id ? "bg-neutral-50" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-neutral-900">
                      {inq.subject || inq.type.replace(/_/g, " ")}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                    {inq.message || "(No message body)"}
                  </p>
                  <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(inq.status)}`}>
                    {inq.status.toLowerCase()}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-200 p-6">
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {selected.subject || selected.type.replace(/_/g, " ")}
                    </h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(selected.status)}`}>
                      {selected.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{selected.createdAt}</p>
                  {selected.message && (
                    <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-800 whitespace-pre-wrap">
                      {selected.message}
                    </div>
                  )}
                  <div className="border-t border-neutral-100 pt-4">
                    <p className="text-xs text-neutral-500">
                      {L("回复将发至您注册的邮箱。", "Replies will be sent to your registered email.", "Les réponses seront envoyées à votre adresse e-mail.")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-neutral-500">
                  {L("选择一条消息查看详情。", "Select a message to view details.", "Sélectionnez un message pour voir les détails.")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
