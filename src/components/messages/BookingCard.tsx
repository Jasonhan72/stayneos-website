"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/mock/messages";

// ── helpers ──────────────────────────────────────────────
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
  }).format(n);
}

// ── Props ────────────────────────────────────────────────
interface Props {
  conversation: Conversation;
  visible: boolean;
  onClose: () => void;
  t: (k: string, d: string) => string;
}

// ── Component ────────────────────────────────────────────
export default function BookingCard({
  conversation,
  visible,
  onClose,
  t,
}: Props) {
  const { booking } = conversation;
  const subtotal = booking.nights * booking.nightlyRate;
  const guestLabel =
    booking.guests === 1
      ? t("messages.guest", "guest")
      : t("messages.guests", "guests");
  const nightLabel =
    booking.nights === 1
      ? t("messages.night", "night")
      : t("messages.nights", "nights");

  // Mobile drawer
  return (
    <>
      {/* Desktop panel */}
      <aside
        className={cn(
          "hidden border-l border-neutral-100 bg-white transition-all duration-300 md:block",
          visible ? "w-80" : "w-0 overflow-hidden border-l-0",
        )}
      >
        <div className={cn("w-80", !visible && "hidden")}>
          <BookingCardContent
            conversation={conversation}
            t={t}
            fmtDate={fmtDate}
            fmtCurrency={fmtCurrency}
            guestLabel={guestLabel}
            nightLabel={nightLabel}
            subtotal={subtotal}
          />
        </div>
      </aside>

      {/* Mobile overlay drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
          visible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl transition-transform duration-300",
            visible ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-neutral-300" />
          </div>

          {/* Close button */}
          <div className="flex items-center justify-between px-5 py-2">
            <h3 className="text-base font-semibold text-neutral-900">
              {t("messages.reservationDetails", "Reservation details")}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-neutral-100"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-neutral-500"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <BookingCardContent
            conversation={conversation}
            t={t}
            fmtDate={fmtDate}
            fmtCurrency={fmtCurrency}
            guestLabel={guestLabel}
            nightLabel={nightLabel}
            subtotal={subtotal}
          />
        </div>
      </div>
    </>
  );
}

// ── Shared content ─────────────────────────────────────
function BookingCardContent({
  conversation,
  t,
  fmtDate,
  fmtCurrency,
  guestLabel,
  nightLabel,
  subtotal,
}: {
  conversation: Conversation;
  t: (k: string, d: string) => string;
  fmtDate: (iso: string) => string;
  fmtCurrency: (n: number) => string;
  guestLabel: string;
  nightLabel: string;
  subtotal: number;
}) {
  return (
    <div className="p-5">
      {/* Property image */}
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100">
        <div className="flex h-full w-full items-center justify-center text-neutral-300">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
      </div>

      {/* Property title */}
      <h4 className="text-base font-semibold text-neutral-900">
        {conversation.propertyTitle}
      </h4>
      <p className="mt-1 text-xs text-neutral-500">
        {conversation.propertyAddress}
      </p>

      {/* Divider */}
      <div className="my-4 border-t border-neutral-100" />

      {/* Booking details */}
      <h5 className="mb-3 text-sm font-semibold text-neutral-800">
        {t("messages.reservationDetails", "Reservation details")}
      </h5>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">
            {t("messages.checkIn", "Check-in")}
          </span>
          <span className="font-medium text-neutral-900">
            {fmtDate(conversation.booking.checkIn)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">
            {t("messages.checkOut", "Check-out")}
          </span>
          <span className="font-medium text-neutral-900">
            {fmtDate(conversation.booking.checkOut)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">
            {conversation.booking.guests} {guestLabel}
          </span>
          <span className="text-neutral-400">
            · {conversation.booking.nights} {nightLabel}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-neutral-100" />

      {/* Pricing */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-900">
          {fmtCurrency(conversation.booking.nightlyRate)}{" "}
          <span className="text-neutral-500">
            {t("messages.nightlyRate", "per night")}
          </span>
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm font-medium text-neutral-900">
          {t("messages.subtotal", "Subtotal")}
        </span>
        <span className="text-sm font-semibold text-neutral-900">
          {fmtCurrency(subtotal)}
        </span>
      </div>

      {/* CTA */}
      <button
        type="button"
        className="mt-5 w-full rounded-xl border border-neutral-900 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
      >
        {t("messages.viewReservation", "View reservation details")}
      </button>
    </div>
  );
}
