"use client";

import { useRouter } from "next/navigation";
import { WIZARD_STEPS } from "@/types/listing-draft";

interface WizardFooterProps {
  currentSlug: string;
  /** When false, the primary action is disabled (validation failed). */
  canContinue?: boolean;
  /** Override label for the primary action. */
  nextLabel?: string;
  /** Custom handler instead of plain "go to next slug". */
  onNext?: () => void | Promise<void>;
  /** Hide the back button (used on step 0). */
  hideBack?: boolean;
}

function nextSlug(currentSlug: string): string | null {
  const idx = WIZARD_STEPS.findIndex((s) => s.slug === currentSlug);
  if (idx < 0 || idx >= WIZARD_STEPS.length - 1) return null;
  return WIZARD_STEPS[idx + 1].slug;
}

export default function WizardFooter({
  currentSlug,
  canContinue = true,
  nextLabel,
  onNext,
  hideBack = false,
}: WizardFooterProps) {
  const router = useRouter();
  const next = nextSlug(currentSlug);

  async function handleNext() {
    if (onNext) {
      await onNext();
      return;
    }
    if (next === null) return;
    const path =
      next === ""
        ? "/host/listings/new"
        : `/host/listings/new/${next}`;
    router.push(path);
  }

  return (
    <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
      {!hideBack ? (
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Back
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={handleNext}
        disabled={!canContinue}
        className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel || (next ? "Continue" : "Finish")}
      </button>
    </div>
  );
}
