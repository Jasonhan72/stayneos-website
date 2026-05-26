"use client";

import { Minus, Plus } from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import { useI18n } from "@/lib/i18n";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

export default function StepBasicsPage() {
  const { draft, updateDraft } = useListingDraft();
  const { t } = useI18n();
  const basics = draft.basics || {
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    maxGuests: 2,
  };

  function setField<K extends keyof typeof basics>(key: K, value: number) {
    const v = Number.isFinite(value) ? Math.max(0, value) : 0;
    updateDraft({
      basics: { ...basics, [key]: v },
      step: Math.max(draft.step || 0, 4),
    });
  }

  const ready = (basics.bedrooms || 0) >= 0 && (basics.bathrooms || 0) >= 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("host.listingWizard.basics.title", "Share some basics")}
        </h1>
        <p className="text-sm text-neutral-600">{t("host.listingWizard.basics.subtitle", "How big is the place?")}</p>
      </header>

      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        <Counter
          label={t("host.listingWizard.basics.bedrooms", "Bedrooms")}
          decreaseLabel={t("host.listingWizard.decrease", "Decrease {label}", { label: t("host.listingWizard.basics.bedrooms", "Bedrooms") })}
          increaseLabel={t("host.listingWizard.increase", "Increase {label}", { label: t("host.listingWizard.basics.bedrooms", "Bedrooms") })}
          value={basics.bedrooms ?? 0}
          onChange={(v) => setField("bedrooms", v)}
          min={0}
        />
        <Counter
          label={t("host.listingWizard.basics.bathrooms", "Bathrooms")}
          decreaseLabel={t("host.listingWizard.decrease", "Decrease {label}", { label: t("host.listingWizard.basics.bathrooms", "Bathrooms") })}
          increaseLabel={t("host.listingWizard.increase", "Increase {label}", { label: t("host.listingWizard.basics.bathrooms", "Bathrooms") })}
          value={basics.bathrooms ?? 0}
          onChange={(v) => setField("bathrooms", v)}
          step={0.5}
          min={0}
        />
        <Counter
          label={t("host.listingWizard.basics.maxGuests", "Max guests")}
          decreaseLabel={t("host.listingWizard.decrease", "Decrease {label}", { label: t("host.listingWizard.basics.maxGuests", "Max guests") })}
          increaseLabel={t("host.listingWizard.increase", "Increase {label}", { label: t("host.listingWizard.basics.maxGuests", "Max guests") })}
          value={basics.maxGuests ?? 0}
          onChange={(v) => setField("maxGuests", v)}
          min={0}
        />
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <div className="text-sm font-medium text-neutral-900">{t("host.listingWizard.basics.area", "Area (sqft)")}</div>
            <div className="text-xs text-neutral-500">{t("host.listingWizard.optional", "Optional")}</div>
          </div>
          <input
            type="number"
            min={0}
            value={basics.sqft ?? 0}
            onChange={(e) => setField("sqft", Number(e.target.value))}
            className="w-32 rounded-lg border border-neutral-300 px-3 py-2 text-right outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      <WizardFooter currentSlug="basics" canContinue={ready} />
    </div>
  );
}

function Counter({
  label,
  decreaseLabel,
  increaseLabel,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  function fmt(n: number) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="text-sm font-medium text-neutral-900">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={decreaseLabel}
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="w-8 text-center text-base font-medium tabular-nums text-neutral-900">
          {fmt(value)}
        </div>
        <button
          type="button"
          aria-label={increaseLabel}
          onClick={() => onChange(value + step)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
