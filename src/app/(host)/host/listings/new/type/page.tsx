"use client";

import { Building2, Building, Crown, Hotel, Home, HomeIcon } from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import { useI18n } from "@/lib/i18n";
import { LISTING_TYPE_KEYS } from "@/lib/host-listing-i18n";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

const TYPES = [
  { value: "apartment", icon: Building2 },
  { value: "studio", icon: Hotel },
  { value: "penthouse", icon: Crown },
  { value: "condo", icon: Building },
  { value: "house", icon: Home },
  { value: "townhouse", icon: HomeIcon },
] as const;

export default function StepTypePage() {
  const { draft, updateDraft } = useListingDraft();
  const { t } = useI18n();
  const selected = draft.type || "";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("host.listingWizard.type.title", "What kind of place is it?")}
        </h1>
        <p className="text-sm text-neutral-600">
          {t("host.listingWizard.type.subtitle", "Pick the option that best describes your space.")}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TYPES.map(({ value, icon: Icon }) => {
          const active = selected === value;
          const label = t(LISTING_TYPE_KEYS[value], value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => updateDraft({ type: value, step: Math.max(draft.step || 0, 2) })}
              className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition ${
                active
                  ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <Icon className="h-6 w-6 text-neutral-700" />
              <span className="text-sm font-medium text-neutral-900">{label}</span>
            </button>
          );
        })}
      </div>

      <WizardFooter currentSlug="type" canContinue={Boolean(selected)} />
    </div>
  );
}
