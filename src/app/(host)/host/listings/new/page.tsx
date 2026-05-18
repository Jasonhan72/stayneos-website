"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, FileText, Pencil, Loader2, AlertCircle } from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import type { ListingDraft } from "@/types/listing-draft";

type Mode = "none" | "url" | "pdf";

export default function WizardStartPage() {
  const router = useRouter();
  const { draft, replaceDraft, updateDraft } = useListingDraft();
  const [mode, setMode] = useState<Mode>("none");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function mergeImported(partial: Partial<ListingDraft>) {
    const next: ListingDraft = {
      ...draft,
      ...partial,
      step: Math.max(draft.step || 0, 1),
    };
    replaceDraft(next);
  }

  async function handleUrlImport() {
    if (!url.trim()) {
      setError("Please paste a listing URL");
      return;
    }
    setError(null);
    setWarnings([]);
    setLoading(true);
    try {
      const res = await fetch("/api/host/import/url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as {
        draft?: Partial<ListingDraft>;
        warnings?: string[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || `Import failed (HTTP ${res.status})`);
        return;
      }
      mergeImported(data.draft || {});
      if (data.warnings && data.warnings.length) setWarnings(data.warnings);
      router.push("/host/listings/new/type");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePdfImport() {
    if (!pdfFile) {
      setError("Please choose a PDF file");
      return;
    }
    setError(null);
    setWarnings([]);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", pdfFile);
      const res = await fetch("/api/host/import/pdf", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        draft?: Partial<ListingDraft>;
        warnings?: string[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || `Import failed (HTTP ${res.status})`);
        return;
      }
      mergeImported({ ...(data.draft || {}), importSource: "pdf" });
      if (data.warnings && data.warnings.length) setWarnings(data.warnings);
      router.push("/host/listings/new/type");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  function handleManualStart() {
    updateDraft({ step: 1, importSource: "manual" });
    router.push("/host/listings/new/type");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Tell us about your place
        </h1>
        <p className="text-base text-neutral-600">
          We&apos;ll help you fill in the details. Import from an existing
          listing, upload a PDF, or start from scratch.
        </p>
      </header>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <ul className="list-disc space-y-0.5 pl-5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* URL import */}
        <ImportOption
          icon={<LinkIcon className="h-5 w-5" />}
          title="Import from listing site"
          subtitle="Airbnb, Booking.com, Kijiji, Realtor.ca…"
          expanded={mode === "url"}
          onClick={() => setMode(mode === "url" ? "none" : "url")}
        >
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              placeholder="https://www.airbnb.com/rooms/123456"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="button"
              onClick={handleUrlImport}
              disabled={loading || !url.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Parse
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            We&apos;ll read the public page and pre-fill what we can. You can
            edit everything afterwards.
          </p>
        </ImportOption>

        {/* PDF import */}
        <ImportOption
          icon={<FileText className="h-5 w-5" />}
          title="Upload PDF"
          subtitle="Floor plans, brochures, leasing flyers…"
          expanded={mode === "pdf"}
          onClick={() => setMode(mode === "pdf" ? "none" : "pdf")}
        >
          <div className="mt-3 space-y-3">
            <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              {pdfFile ? (
                <span className="text-neutral-900">{pdfFile.name}</span>
              ) : (
                <span>Click to choose a PDF (max 10MB)</span>
              )}
            </label>
            <button
              type="button"
              onClick={handlePdfImport}
              disabled={loading || !pdfFile}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 sm:w-auto"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Upload &amp; parse
            </button>
          </div>
        </ImportOption>

        {/* Manual */}
        <button
          type="button"
          onClick={handleManualStart}
          className="flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <span className="rounded-lg bg-neutral-100 p-2 text-neutral-700">
            <Pencil className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-base font-semibold text-neutral-900">
              Start from scratch
            </span>
            <span className="block text-sm text-neutral-500">
              I&apos;ll fill in everything myself.
            </span>
          </span>
          <span className="text-neutral-400">→</span>
        </button>
      </div>
    </div>
  );
}

function ImportOption({
  icon,
  title,
  subtitle,
  expanded,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  expanded: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border bg-white transition ${
        expanded ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <span className="rounded-lg bg-neutral-100 p-2 text-neutral-700">
          {icon}
        </span>
        <span className="flex-1">
          <span className="block text-base font-semibold text-neutral-900">
            {title}
          </span>
          <span className="block text-sm text-neutral-500">{subtitle}</span>
        </span>
        <span className="text-neutral-400">{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && <div className="border-t border-neutral-200 p-4">{children}</div>}
    </div>
  );
}
