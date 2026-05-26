"use client";

import { useState } from "react";
import { useListingDraft } from "@/hooks/useListingDraft";
import { useI18n } from "@/lib/i18n";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

const MIN_STAY_OPTIONS = [
  { value: 30, key: "host.listingWizard.pricing.minStay30", label: "30 days" },
  { value: 60, key: "host.listingWizard.pricing.minStay60", label: "60 days" },
  { value: 90, key: "host.listingWizard.pricing.minStay90", label: "90 days" },
  { value: 180, key: "host.listingWizard.pricing.minStay180", label: "180 days" },
  { value: 365, key: "host.listingWizard.pricing.minStay365", label: "1 year" },
];

export default function StepPricingPage() {
  const { draft, updateDraft } = useListingDraft();
  const { t } = useI18n();
  const pricing = draft.pricing || { priceMonthly: 0, minStayDays: 30 };
  const [showQuarterly, setShowQuarterly] = useState(Boolean(pricing.priceQuarterly));
  const [showAnnual, setShowAnnual] = useState(Boolean(pricing.priceAnnual));

  function set<K extends keyof typeof pricing>(key: K, value: number) {
    const v = Number.isFinite(value) ? Math.max(0, value) : 0;
    updateDraft({
      pricing: { ...pricing, [key]: v },
      step: Math.max(draft.step || 0, 8),
    });
  }

  const ready = (pricing.priceMonthly || 0) > 0 && (pricing.minStayDays || 0) > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("host.listingWizard.pricing.title", "Now, set your price")}
        </h1>
        <p className="text-sm text-neutral-600">
          {t("host.listingWizard.pricing.subtitle", "You can change it any time.")}
        </p>
      </header>

      <div className="space-y-5">
        <Money
          label={t("host.listingWizard.pricing.monthlyRent", "Monthly rent")}
          required
          value={pricing.priceMonthly}
          onChange={(v) => set("priceMonthly", v)}
        />

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={showQuarterly}
            onChange={(e) => {
              setShowQuarterly(e.target.checked);
              if (!e.target.checked) set("priceQuarterly", 0);
            }}
            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          {t("host.listingWizard.pricing.addQuarterly", "Add a quarterly rate")}
        </label>
        {showQuarterly && (
          <Money
            label={t("host.listingWizard.pricing.quarterlyRate", "Quarterly rate (total for 3 months)")}
            value={pricing.priceQuarterly || 0}
            onChange={(v) => set("priceQuarterly", v)}
          />
        )}

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={showAnnual}
            onChange={(e) => {
              setShowAnnual(e.target.checked);
              if (!e.target.checked) set("priceAnnual", 0);
            }}
            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          {t("host.listingWizard.pricing.addAnnual", "Add an annual rate")}
        </label>
        {showAnnual && (
          <Money
            label={t("host.listingWizard.pricing.annualRate", "Annual rate (total for 12 months)")}
            value={pricing.priceAnnual || 0}
            onChange={(v) => set("priceAnnual", v)}
          />
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-900">
            {t("host.listingWizard.pricing.minimumStay", "Minimum stay")}
          </label>
          <select
            value={pricing.minStayDays || 30}
            onChange={(e) => set("minStayDays", Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          >
            {MIN_STAY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.key, o.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <WizardFooter currentSlug="pricing" canContinue={ready} />
    </div>
  );
}

function Money({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-neutral-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
          $
        </span>
        <input
          type="number"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0"
          className="w-full rounded-lg border border-neutral-300 py-2.5 pl-7 pr-12 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
          CAD
        </span>
      </div>
    </div>
  );
}
