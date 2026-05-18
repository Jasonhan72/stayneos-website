"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

export default function StepReviewPage() {
  const router = useRouter();
  const { draft, clearDraft } = useListingDraft();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setError(null);
    setPublishing(true);
    try {
      // Strip base64 data URIs — they’re too large for the DB.
      // Only real https:// URLs survive. Base64 previews are display-only.
      const photoUrls = (draft.photos || []).filter((p) => p.startsWith('http'));

      const payload = {
        title: draft.title,
        description: draft.description,
        descriptionZh: draft.descriptionZh,
        type: draft.type,
        location: draft.location,
        basics: draft.basics,
        amenities: draft.amenities,
        photos: photoUrls,
        pricing: draft.pricing,
      };
      const res = await fetch("/api/host/properties", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(`Publish failed (${res.status}): ${txt.slice(0, 200)}`);
        return;
      }
      clearDraft();
      router.push("/host/listings?published=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Review your listing
        </h1>
        <p className="text-sm text-neutral-600">
          Double-check everything below, then publish when you&apos;re ready.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Section title="Type" editPath="/host/listings/new/type">
          <div className="capitalize">{draft.type || <em className="text-neutral-400">Not set</em>}</div>
        </Section>

        <Section title="Location" editPath="/host/listings/new/location">
          <div>{draft.location?.address || <em className="text-neutral-400">No address</em>}</div>
          <div className="text-sm text-neutral-500">
            {[draft.location?.neighborhood, draft.location?.city]
              .filter(Boolean)
              .join(", ") || "—"}
          </div>
        </Section>

        <Section title="Basics" editPath="/host/listings/new/basics">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>🛏️ {draft.basics?.bedrooms ?? 0} bedrooms</span>
            <span>🛁 {draft.basics?.bathrooms ?? 0} bathrooms</span>
            <span>👥 {draft.basics?.maxGuests ?? 0} guests</span>
            {draft.basics?.sqft ? <span>📐 {draft.basics.sqft} sqft</span> : null}
          </div>
        </Section>

        <Section title="Amenities" editPath="/host/listings/new/amenities">
          {(draft.amenities?.length || 0) === 0 ? (
            <em className="text-neutral-400">None selected</em>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {draft.amenities!.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="Photos" editPath="/host/listings/new/photos">
          {(draft.photos?.length || 0) === 0 ? (
            <em className="text-neutral-400">No photos uploaded</em>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {draft.photos!.slice(0, 8).map((src, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Title & description" editPath="/host/listings/new/details">
          <div className="font-medium text-neutral-900">
            {draft.title || <em className="text-neutral-400">No title</em>}
          </div>
          <p className="mt-1 line-clamp-4 text-sm text-neutral-600">
            {draft.description || <em className="text-neutral-400">No description</em>}
          </p>
        </Section>

        <Section title="Pricing" editPath="/host/listings/new/pricing">
          <div className="space-y-0.5 text-sm">
            <div>
              <strong>${draft.pricing?.priceMonthly ?? 0}</strong> CAD / month
            </div>
            {draft.pricing?.priceQuarterly ? (
              <div className="text-neutral-600">${draft.pricing.priceQuarterly} / quarter</div>
            ) : null}
            {draft.pricing?.priceAnnual ? (
              <div className="text-neutral-600">${draft.pricing.priceAnnual} / year</div>
            ) : null}
            <div className="text-neutral-500">
              Min stay: {draft.pricing?.minStayDays ?? 30} days
            </div>
          </div>
        </Section>
      </div>

      <WizardFooter
        currentSlug="review"
        nextLabel={publishing ? "Publishing…" : "Publish"}
        canContinue={!publishing}
        onNext={handlePublish}
      />

      {publishing && (
        <div className="flex items-center justify-end gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Publishing your listing…
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  editPath,
  children,
}: {
  title: string;
  editPath: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </h3>
        <Link
          href={editPath}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Link>
      </div>
      <div className="text-neutral-900">{children}</div>
    </section>
  );
}
