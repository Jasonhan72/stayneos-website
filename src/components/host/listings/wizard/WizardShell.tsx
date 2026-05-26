"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { WIZARD_STEPS } from "@/types/listing-draft";
import { useI18n } from "@/lib/i18n";
import { listingStepTranslationKey } from "@/lib/host-listing-i18n";

function currentStepIndex(pathname: string): number {
  const m = pathname.match(/\/host\/listings\/new\/?(.*)$/);
  if (!m) return 0;
  const tail = (m[1] || "").split("/")[0];
  if (!tail) return 0;
  const idx = WIZARD_STEPS.findIndex((s) => s.slug === tail);
  return idx >= 0 ? idx : 0;
}

export default function WizardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { t } = useI18n();
  const idx = currentStepIndex(pathname);
  const total = WIZARD_STEPS.length - 1; // 8 real steps
  const progressPct = idx === 0 ? 0 : (idx / total) * 100;
  const stepLabel = t(listingStepTranslationKey(WIZARD_STEPS[idx]?.slug || ""));

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.back", "Back")}
          </button>
          <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 truncate max-w-[160px] sm:max-w-none">
            {idx === 0
              ? t("host.listingWizard.newListing", "New listing")
              : t("host.listingWizard.stepProgress", "Step {current} of {total} · {label}", {
                  current: idx,
                  total,
                  label: stepLabel,
                })}
          </div>
          <Link
            href="/host/listings"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
            aria-label="Close wizard"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">{t("host.listingWizard.exit", "Exit")}</span>
          </Link>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-neutral-100">
          <div
            className="h-full bg-neutral-900 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
