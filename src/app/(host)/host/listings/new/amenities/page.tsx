"use client";

import {
  Wifi,
  Utensils,
  WashingMachine,
  Wind,
  Snowflake,
  Flame,
  Dumbbell,
  Waves,
  Car,
  Bell,
  Trees,
  Refrigerator,
  Tv,
  ArrowUpDown,
  PawPrint,
} from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

const AMENITIES = [
  { key: "WiFi", icon: Wifi },
  { key: "Kitchen", icon: Utensils },
  { key: "Washer", icon: WashingMachine },
  { key: "Dryer", icon: Wind },
  { key: "Air Conditioning", icon: Snowflake },
  { key: "Heating", icon: Flame },
  { key: "Gym", icon: Dumbbell },
  { key: "Pool", icon: Waves },
  { key: "Parking", icon: Car },
  { key: "Concierge", icon: Bell },
  { key: "Balcony", icon: Trees },
  { key: "Dishwasher", icon: Refrigerator },
  { key: "TV", icon: Tv },
  { key: "Elevator", icon: ArrowUpDown },
  { key: "Pet Friendly", icon: PawPrint },
] as const;

export default function StepAmenitiesPage() {
  const { draft, updateDraft } = useListingDraft();
  const selected = new Set(draft.amenities || []);

  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateDraft({
      amenities: Array.from(next),
      step: Math.max(draft.step || 0, 5),
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Tell guests what your place has to offer
        </h1>
        <p className="text-sm text-neutral-600">
          You can add more later. Pick everything that applies.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {AMENITIES.map(({ key, icon: Icon }) => {
          const active = selected.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                active
                  ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <Icon className="h-5 w-5 text-neutral-700" />
              <span className="text-sm font-medium text-neutral-900">{key}</span>
            </button>
          );
        })}
      </div>

      <WizardFooter currentSlug="amenities" />
    </div>
  );
}
