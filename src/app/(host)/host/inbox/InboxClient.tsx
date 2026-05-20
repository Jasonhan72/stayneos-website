"use client";

import { useCallback, useEffect, useState } from "react";
import { ensureCsrfToken } from "@/lib/security/csrf-client";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MessagingShell = dynamic(() => import("@/components/messages/MessagingShell"), { ssr: false });

/* ------------------------------------------------------------------ */
/*  Inquiry tab (kept as secondary lead-tracking view)                 */
/* ------------------------------------------------------------------ */

type Inquiry = {
  id: string;
  type: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

type InboxResponse = {
  inquiries: Inquiry[];
  counts: Record<string, number>;
};

type StatusFilter = "ALL" | "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "QUALIFIED", label: "Qualified" },
  { key: "CLOSED", label: "Closed" },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch { return iso; }
}

function inquiryTitle(i: Inquiry): string {
  if (i.subject) return i.subject;
  const kind = i.type.replace(/_/g, " ");
  return `${kind.charAt(0).toUpperCase()}${kind.slice(1)} inquiry`;
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "NEW").toUpperCase();
  const styles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    CONTACTED: "bg-amber-50 text-amber-700 border-amber-200",
    QUALIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[s] ?? styles.NEW}`}>
      {s.toLowerCase()}
    </span>
  );
}

function InquiryTab() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [data, setData] = useState<InboxResponse | null>(null);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const endpoint = filter === "ALL" ? "/api/host/inbox" : `/api/host/inbox?status=${filter}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(endpoint, { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<InboxResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        if (selected) {
          const refreshed = json.inquiries.find((i) => i.id === selected.id) ?? null;
          setSelected(refreshed);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load inbox");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, reloadNonce]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch("/api/host/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": ensureCsrfToken() },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setReloadNonce((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inquiry");
    }
  }, []);

  const counts = data?.counts ?? {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const count = opt.key === "ALL"
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : counts[opt.key] ?? 0;
          return (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                filter === opt.key
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
              )}
            >
              {opt.label}
              {data ? <span className="ml-2 text-xs opacity-70">{count}</span> : null}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="max-h-[calc(100vh-340px)] overflow-y-auto divide-y divide-neutral-100">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
                ))}
              </div>
            ) : null}
            {!loading && data && data.inquiries.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">No inquiries in this view yet.</div>
            ) : null}
            {!loading && data?.inquiries.map((i) => {
              const isActive = selected?.id === i.id;
              return (
                <button
                  key={i.id}
                  onClick={() => setSelected(i)}
                  className={cn("w-full px-4 py-3 text-left transition-colors", isActive ? "bg-neutral-50" : "hover:bg-neutral-50")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-neutral-900">{i.name || i.email}</span>
                    <span className="shrink-0 text-xs text-neutral-500">{formatDate(i.createdAt)}</span>
                  </div>
                  <div className="mt-0.5 truncate text-sm text-neutral-600">{inquiryTitle(i)}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusPill status={i.status} />
                    <span className="text-xs uppercase tracking-wide text-neutral-400">{i.type.replace(/_/g, " ")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{inquiryTitle(selected)}</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {selected.name ? `${selected.name} · ` : ""}
                    <a className="text-neutral-700 underline" href={`mailto:${selected.email}`}>{selected.email}</a>
                    {selected.phone ? ` · ${selected.phone}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">{formatDate(selected.createdAt)}</p>
                </div>
                <StatusPill status={selected.status} />
              </div>
              <div className="whitespace-pre-wrap rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-800">
                {selected.message || <span className="text-neutral-400">(No message body)</span>}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                {["NEW", "CONTACTED", "QUALIFIED", "CLOSED"].map((s) => (
                  <button
                    key={s}
                    disabled={selected.status === s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                      selected.status === s
                        ? "cursor-default bg-neutral-900 text-white"
                        : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    )}
                  >
                    Mark as {s.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
              Select an inquiry to see details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Inbox — tabs: Messages (shared) + Leads (inquiry CRM)         */
/* ------------------------------------------------------------------ */

type Tab = "messages" | "leads";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "messages", label: "Messages", icon: <MessageCircle className="h-4 w-4" /> },
  { key: "leads", label: "Leads", icon: <span className="text-sm">📬</span> },
];

export default function InboxClient() {
  const [tab, setTab] = useState<Tab>("messages");

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="shrink-0 px-4 md:px-6 pt-4 pb-2">
        <div className="flex gap-1 rounded-2xl bg-neutral-100 p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {tab === "messages" ? <MessagingShell compact /> : <div className="px-4 md:px-6 py-4"><InquiryTab /></div>}
      </div>
    </div>
  );
}
