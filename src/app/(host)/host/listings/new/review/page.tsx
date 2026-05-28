"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import { useI18n } from "@/lib/i18n";
import {
  amenityTranslationKey,
  formatCountByLocale,
  LISTING_TYPE_KEYS,
} from "@/lib/host-listing-i18n";
import { ensureCsrfToken } from "@/lib/security/csrf-client";


export default function StepReviewPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
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
        descriptionFr: draft.descriptionFr,
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
        headers: { "content-type": "application/json", "x-csrf-token": ensureCsrfToken() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(t("host.listingWizard.review.publishFailedHttp", "Publish failed ({status}): {message}", {
          status: res.status,
          message: txt.slice(0, 200),
        }));
        return;
      }
      clearDraft();
      router.push("/host/listings?published=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("host.listingWizard.review.publishFailed", "Publish failed"));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("host.listingWizard.review.title", "Review your listing")}
        </h1>
        <p className="text-sm text-neutral-600">
          {t("host.listingWizard.review.subtitle", "Double-check everything below, then publish when you’re ready.")}
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Section title={t("host.listingWizard.review.sections.type", "Type")} editPath="/host/listings/new/type" editLabel={t("common.edit", "Edit")}>
          <div>{draft.type ? t(LISTING_TYPE_KEYS[draft.type] || "", draft.type) : <em className="text-neutral-400">{t("host.listingWizard.review.notSet", "Not set")}</em>}</div>
        </Section>

        <Section title={t("host.listingWizard.review.sections.location", "Location")} editPath="/host/listings/new/location" editLabel={t("common.edit", "Edit")}>
          <div>{draft.location?.address || <em className="text-neutral-400">{t("host.listingWizard.review.noAddress", "No address")}</em>}</div>
          <div className="text-sm text-neutral-500">
            {[draft.location?.neighborhood, draft.location?.city]
              .filter(Boolean)
              .join(", ") || "—"}
          </div>
        </Section>

        <Section title={t("host.listingWizard.review.sections.basics", "Basics")} editPath="/host/listings/new/basics" editLabel={t("common.edit", "Edit")}>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>🛏️ {formatCountByLocale(locale, draft.basics?.bedrooms ?? 0, "bedroom")}</span>
            <span>🛁 {formatCountByLocale(locale, draft.basics?.bathrooms ?? 0, "bathroom")}</span>
            <span>👥 {formatCountByLocale(locale, draft.basics?.maxGuests ?? 0, "guest")}</span>
            {draft.basics?.sqft ? <span>📐 {t("host.listingWizard.review.sqft", "{count} sqft", { count: draft.basics.sqft })}</span> : null}
          </div>
        </Section>

        <Section title={t("host.listingWizard.review.sections.amenities", "Amenities")} editPath="/host/listings/new/amenities" editLabel={t("common.edit", "Edit")}>
          {(draft.amenities?.length || 0) === 0 ? (
            <em className="text-neutral-400">{t("host.listingWizard.review.noneSelected", "None selected")}</em>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {draft.amenities!.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
                >
                  {t(amenityTranslationKey(a) || "", a)}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title={t("host.listingWizard.review.sections.photos", "Photos")} editPath="/host/listings/new/photos" editLabel={t("common.edit", "Edit")}>
          {(draft.photos?.length || 0) === 0 ? (
            <em className="text-neutral-400">{t("host.listingWizard.review.noPhotos", "No photos uploaded")}</em>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {draft.photos!.slice(0, 8).map((src, i) => (
                <PhotoPreview
                  key={i}
                  src={src}
                  alt={t("host.listingWizard.review.photoAlt", "Photo {number}", { number: i + 1 })}
                />
              ))}
            </div>
          )}
        </Section>

        <Section title={t("host.listingWizard.review.sections.details", "Title & description")} editPath="/host/listings/new/details" editLabel={t("common.edit", "Edit")}>
          <div className="font-medium text-neutral-900">
            {draft.title || <em className="text-neutral-400">{t("host.listingWizard.review.noTitle", "No title")}</em>}
          </div>
          <p className="mt-1 line-clamp-4 text-sm text-neutral-600">
            {draft.description || <em className="text-neutral-400">{t("host.listingWizard.review.noDescription", "No description")}</em>}
          </p>
        </Section>

        <Section title={t("host.listingWizard.review.sections.pricing", "Pricing")} editPath="/host/listings/new/pricing" editLabel={t("common.edit", "Edit")}>
          <div className="space-y-0.5 text-sm">
            <div>
              <strong>${draft.pricing?.priceMonthly ?? 0}</strong> {t("host.listingWizard.review.cadPerMonth", "CAD / month")}
            </div>
            {draft.pricing?.priceQuarterly ? (
              <div className="text-neutral-600">${draft.pricing.priceQuarterly} {t("host.listingWizard.review.perQuarter", "/ quarter")}</div>
            ) : null}
            {draft.pricing?.priceAnnual ? (
              <div className="text-neutral-600">${draft.pricing.priceAnnual} {t("host.listingWizard.review.perYear", "/ year")}</div>
            ) : null}
            <div className="text-neutral-500">
              {t("host.listingWizard.review.minStay", "Min stay: {duration}", {
                duration: formatCountByLocale(locale, draft.pricing?.minStayDays ?? 30, "day"),
              })}
            </div>
          </div>
        </Section>
      </div>

      {/* Big, impossible-to-miss publish bar */}
      <div className="sticky bottom-0 -mx-4 mt-10 flex flex-col gap-2 border-t border-neutral-200 bg-white px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-sm text-neutral-600">
          {publishing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("host.listingWizard.review.publishing", "Publishing your listing...")}
            </span>
          ) : (
            <span>{t("host.listingWizard.review.ready", "Ready? You can still edit any section above.")}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/host/listings/new/pricing")}
            disabled={publishing}
            className="min-h-11 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
          >
            {t("common.back", "Back")}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="min-h-11 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? t("host.listingWizard.review.publishingShort", "Publishing...") : t("host.listingWizard.review.publish", "Publish listing")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  editPath,
  editLabel,
  children,
}: {
  title: string;
  editPath: string;
  editLabel: string;
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
          className="flex min-h-11 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <Pencil className="h-3 w-3" />
          {editLabel}
        </Link>
      </div>
      <div className="text-neutral-900">{children}</div>
    </section>
  );
}

function PhotoPreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 text-center text-xs font-medium text-neutral-500">
      {failed ? (
        <span className="px-2">{alt}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
