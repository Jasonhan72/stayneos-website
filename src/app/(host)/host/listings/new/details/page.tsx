"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

const TITLE_MAX = 60;

export default function StepDetailsPage() {
  const { draft, updateDraft } = useListingDraft();
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [titleLoading, setTitleLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateTitles() {
    setError(null);
    setTitleLoading(true);
    try {
      const res = await fetch("/api/host/ai-assist/title", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: draft.type,
          location: draft.location,
          basics: draft.basics,
          amenities: draft.amenities,
        }),
      });
      const data = (await res.json()) as { suggestions?: string[] };
      setTitleSuggestions(data.suggestions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate titles");
    } finally {
      setTitleLoading(false);
    }
  }

  async function generateDescription() {
    setError(null);
    setDescLoading(true);
    try {
      const res = await fetch("/api/host/ai-assist/description", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { en?: string; zh?: string };
      updateDraft({
        description: data.en || draft.description || "",
        descriptionZh: data.zh || draft.descriptionZh || "",
        step: Math.max(draft.step || 0, 7),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate description");
    } finally {
      setDescLoading(false);
    }
  }

  const ready =
    (draft.title?.trim().length || 0) > 0 &&
    (draft.description?.trim().length || 0) > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Now, the words
        </h1>
        <p className="text-sm text-neutral-600">
          A great title and description help your listing stand out.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-900">
            Title <span className="text-neutral-500">({TITLE_MAX} chars max)</span>
          </label>
          <button
            type="button"
            onClick={generateTitles}
            disabled={titleLoading}
            className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50"
          >
            {titleLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Generate with AI
          </button>
        </div>
        <input
          type="text"
          maxLength={TITLE_MAX}
          value={draft.title || ""}
          onChange={(e) =>
            updateDraft({ title: e.target.value, step: Math.max(draft.step || 0, 7) })
          }
          placeholder="Bright 2-bed condo in King West"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <div className="text-right text-xs text-neutral-400">
          {(draft.title || "").length} / {TITLE_MAX}
        </div>
        {titleSuggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Suggestions
            </div>
            <div className="flex flex-col gap-2">
              {titleSuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateDraft({ title: s.slice(0, TITLE_MAX) })}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-800 hover:border-neutral-900 hover:bg-neutral-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Description */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-900">
            Description
          </label>
          <button
            type="button"
            onClick={generateDescription}
            disabled={descLoading}
            className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50"
          >
            {descLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Generate description
          </button>
        </div>
        <textarea
          value={draft.description || ""}
          onChange={(e) =>
            updateDraft({
              description: e.target.value,
              step: Math.max(draft.step || 0, 7),
            })
          }
          rows={8}
          placeholder="Describe the space, neighborhood, and what guests will love about staying here…"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        {draft.descriptionZh ? (
          <details className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <summary className="cursor-pointer text-sm font-medium text-neutral-700">
              中文描述 (auto-generated)
            </summary>
            <textarea
              value={draft.descriptionZh}
              onChange={(e) => updateDraft({ descriptionZh: e.target.value })}
              rows={6}
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </details>
        ) : null}
      </section>

      <WizardFooter currentSlug="details" canContinue={ready} />
    </div>
  );
}
