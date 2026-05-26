"use client";

import { useListingDraft } from "@/hooks/useListingDraft";
import { useI18n } from "@/lib/i18n";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

export default function StepLocationPage() {
  const { draft, updateDraft } = useListingDraft();
  const { t } = useI18n();
  const loc = draft.location || { address: "", city: "Toronto", neighborhood: "" };

  function set<K extends keyof typeof loc>(key: K, value: string) {
    updateDraft({
      location: { ...loc, [key]: value },
      step: Math.max(draft.step || 0, 3),
    });
  }

  const ready = (loc.address?.trim().length || 0) > 0 && (loc.city?.trim().length || 0) > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("host.listingWizard.location.title", "Where’s your place located?")}
        </h1>
        <p className="text-sm text-neutral-600">
          {t("host.listingWizard.location.subtitle", "Guests only see your exact address after they book.")}
        </p>
      </header>

      <div className="space-y-4">
        <Field label={t("host.listingWizard.location.address", "Street address")} required>
          <input
            type="text"
            value={loc.address || ""}
            onChange={(e) => set("address", e.target.value)}
            placeholder={t("host.listingWizard.location.addressPlaceholder", "123 King St W")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </Field>

        <Field label={t("host.listingWizard.location.neighborhood", "Neighborhood")}>
          <input
            type="text"
            value={loc.neighborhood || ""}
            onChange={(e) => set("neighborhood", e.target.value)}
            placeholder={t("host.listingWizard.location.neighborhoodPlaceholder", "Downtown / Liberty Village / King West")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </Field>

        <Field label={t("host.listingWizard.location.city", "City")} required>
          <input
            type="text"
            value={loc.city || ""}
            onChange={(e) => set("city", e.target.value)}
            placeholder={t("host.listingWizard.location.cityPlaceholder", "Toronto")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </Field>
      </div>

      <WizardFooter currentSlug="location" canContinue={ready} />
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
