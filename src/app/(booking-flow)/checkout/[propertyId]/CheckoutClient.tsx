"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Star, X, Plus, Minus, Shield, User } from "lucide-react";
import { Container } from "@/components/ui";
import { calculateBookingPrice, normalizeStayType, getDefaultStayType, stayTypeToQuery } from "@/lib/booking";
import { useProperty } from "@/hooks/useProperties";
import { getLocalizedTitle } from "@/components/property/PropertyCard";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { ensureCsrfToken } from "@/lib/security/csrf-client";

const AirbnbCalendar = dynamic(
  () => import("@/components/booking").then((mod) => mod.AirbnbCalendar),
  {
    ssr: false,
    loading: () => null,
  },
);

interface CheckoutClientProps {
  propertyId: string;
}

export default function CheckoutClient({ propertyId }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { property, isLoading: isPropertyLoading } = useProperty(propertyId);
  const { t, locale } = useI18n();
  const { isAuthenticated, user } = useAuth();

  // Get initial values from URL params
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const bookedRanges =
    (
      property as
        | (typeof property & {
            bookedRanges?: Array<{ start: string; end: string }>;
          })
        | null
    )?.bookedRanges || [];
  const initialGuests = Math.max(
    1,
    parseInt(searchParams.get("guests") || "1", 10) || 1,
  );
  const [adults, setAdults] = useState(
    parseInt(searchParams.get("adults") || String(initialGuests), 10),
  );
  const [children, setChildren] = useState(
    parseInt(searchParams.get("children") || "0", 10),
  );
  const [infants, setInfants] = useState(
    parseInt(searchParams.get("infants") || "0", 10),
  );
  const [pets, setPets] = useState(
    parseInt(searchParams.get("pets") || "0", 10),
  );
  const [guestName, setGuestName] = useState(searchParams.get("name") || "");
  const [guestEmail, setGuestEmail] = useState(searchParams.get("email") || "");
  const [guestPhone, setGuestPhone] = useState(searchParams.get("phone") || "");
  const stayType = property
    ? normalizeStayType(searchParams.get("stayType") || searchParams.get("type"), getDefaultStayType(property))
    : normalizeStayType(searchParams.get("stayType") || searchParams.get("type"));
  const [showGuestForm, setShowGuestForm] = useState(!isAuthenticated);

  // Modals state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestName(
        user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "",
      );
      setGuestEmail(user.email || "");
      setGuestPhone(user.phone || "");
      setShowGuestForm(false);
      return;
    }
    setShowGuestForm(true);
  }, [isAuthenticated, user]);

  if (isPropertyLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">
            {t("errors.propertyNotFound") || "Property not found"}
          </p>
          <Link
            href="/properties"
            className="text-primary mt-4 inline-block underline"
          >
            {t("properties.viewAll") || "Back to properties"}
          </Link>
        </div>
      </main>
    );
  }

  const localizedTitle = getLocalizedTitle(property, locale);
  const propertyImage =
    (property as typeof property & { coverImage?: string }).coverImage ||
    property.images?.[0] ||
    "/images/cooper-55-c5e8357d.jpg";

  // Calculate pricing with Airbnb style breakdown
  const priceCalc =
    checkIn && checkOut
      ? calculateBookingPrice(property, checkIn, checkOut, stayType)
      : null;

  const finalPrice = priceCalc?.total || 0;
  const isMonthly = stayType !== "NIGHTLY";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(
      locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-CA" : "en-CA",
      {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      },
    ).format(amount);

  const unitLabel = (count: number) => {
    if (locale === "zh") {
      if (stayType === "NIGHTLY") return "晚";
      if (stayType === "QUARTERLY") return "季度";
      if (stayType === "YEARLY") return "年";
      return "个月";
    }
    if (locale === "fr") {
      if (stayType === "NIGHTLY") return count === 1 ? "nuit" : "nuits";
      if (stayType === "QUARTERLY") return count === 1 ? "trimestre" : "trimestres";
      if (stayType === "YEARLY") return count === 1 ? "an" : "ans";
      return "mois";
    }
    if (stayType === "NIGHTLY") return count === 1 ? "night" : "nights";
    if (stayType === "QUARTERLY") return count === 1 ? "quarter" : "quarters";
    if (stayType === "YEARLY") return count === 1 ? "year" : "years";
    return count === 1 ? "month" : "months";
  };

  const stayTypeLabel = () => {
    if (locale === "zh") return stayType === "NIGHTLY" ? "短租" : stayType === "MONTHLY" ? "月租" : stayType === "QUARTERLY" ? "季租" : "年租";
    if (locale === "fr") return stayType === "NIGHTLY" ? "Court séjour" : stayType === "MONTHLY" ? "Mensuel" : stayType === "QUARTERLY" ? "Trimestriel" : "Annuel";
    return stayType === "NIGHTLY" ? "Short stay" : stayType === "MONTHLY" ? "Monthly stay" : stayType === "QUARTERLY" ? "Quarterly stay" : "Yearly stay";
  };

  const baseRateLabel = priceCalc
    ? `${formatCurrency(priceCalc.unitRate)} × ${priceCalc.unitCount} ${unitLabel(priceCalc.unitCount)}`
    : t("booking.selectDates") || "Select dates";

  // Format date for display
  const formatDateRange = () => {
    if (!checkIn || !checkOut)
      return t("booking.selectDates") || "Select dates";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const formatter = new Intl.DateTimeFormat(
      locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-FR" : "en-US",
      { month: "short", day: "numeric" },
    );
    return `${formatter.format(start)} - ${formatter.format(end)}, ${end.getFullYear()}`;
  };

  // Format single date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-FR" : "en-US",
      { month: "long", day: "numeric" },
    );
  };

  // Get cancellation deadline for the strict policy summary
  const getCancellationDeadline = () => {
    if (!checkIn) return "";
    const checkInDate = new Date(checkIn);
    const deadline = new Date(checkInDate);
    deadline.setDate(deadline.getDate() - 7);
    return formatDate(deadline.toISOString().split("T")[0]);
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    if (!checkIn || !checkOut) {
      setShowDatePicker(true);
      return;
    }

    // Require name and email - prefer authenticated user profile, fall back to guest form.
    const contactName = (guestName.trim() || user?.name || '').trim();
    const contactEmail = (guestEmail.trim() || user?.email || '').trim();
    const contactPhone = (guestPhone.trim() || user?.phone || '').trim();

    if (!contactName || !contactEmail) {
      setShowGuestForm(true);
      return;
    }

    const params = new URLSearchParams();
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("amount", finalPrice.toString());
    params.set("stayType", stayTypeToQuery(stayType));
    params.set("guestName", contactName);
    params.set("guestEmail", contactEmail);
    params.set("adults", adults.toString());
    params.set("children", children.toString());
    params.set("infants", infants.toString());
    params.set("pets", pets.toString());
    if (contactPhone) params.set("guestPhone", contactPhone);

    if (!isAuthenticated) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(`/checkout/${propertyId}?${params.toString()}`)}`,
      );
      return;
    }

    setBookingError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": ensureCsrfToken(),
        },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          guests: adults + children,
          guestName: contactName,
          guestEmail: contactEmail,
          guestPhone: contactPhone || undefined,
          stayType,
          unitCount: priceCalc?.unitCount,
          unitRate: priceCalc?.unitRate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to create booking. Please try again.",
        );
      }

      const booking = data.booking || data.data?.booking;
      if (!booking?.id) {
        throw new Error("Booking was created but no booking id was returned.");
      }

      params.set("bookingId", booking.id);
      if (booking.bookingNumber)
        params.set("bookingNumber", booking.bookingNumber);
      if (user?.id) params.set("userId", user.id);

      router.push(`/payment/${propertyId}?${params.toString()}`);
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to create booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format guest display text
  const getGuestDisplayText = () => {
    const parts = [];
    const total = adults + children;
    parts.push(
      `${total} ${total === 1 ? t("search.guest") || "guest" : t("search.guests") || "guests"}`,
    );
    if (infants > 0) {
      parts.push(
        `${infants} ${infants === 1 ? t("search.infant") || "infant" : t("search.infants") || "infants"}`,
      );
    }
    if (pets > 0) {
      parts.push(
        `${pets} ${pets === 1 ? t("search.pet") || "pet" : t("search.pets") || "pets"}`,
      );
    }
    return parts.join(", ");
  };

  const PriceSummaryCard = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`${compact ? "" : "sticky top-[88px]"} rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.08)]`}
    >
      <div className="flex gap-4 border-b border-neutral-200 pb-5">
        <div className="relative h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          <Image
            src={propertyImage}
            alt={localizedTitle}
            fill
            className="object-cover"
            sizes="112px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
            {localizedTitle}
          </h2>
          <p className="mt-1 truncate text-sm text-neutral-500">
            {property.location}
          </p>
          {property.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Star size={14} className="fill-black text-black" />
              <span className="font-medium">{property.rating}</span>
              <span className="text-neutral-500">
                ({property.reviewCount} {t("properties.reviews") || "reviews"})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-5">
        <h3 className="text-xl font-semibold">
          <span className="sr-only">Price Summary</span>
          {t("checkout.priceDetails") || "Price details"}
        </h3>
        {priceCalc ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-700 underline decoration-neutral-300 underline-offset-2">
                {baseRateLabel}
              </span>
              <span>{formatCurrency(priceCalc.subtotal)}</span>
            </div>
            {priceCalc.discount > 0 && (
              <div className="flex justify-between gap-4 text-emerald-700">
                <span>{t("booking.discount") || "Discount"}</span>
                <span>-{formatCurrency(priceCalc.discount)}</span>
              </div>
            )}
            {priceCalc.cleaningFee > 0 && (
              <div className="flex justify-between gap-4">
                <span>{t("booking.cleaningFee") || "Cleaning fee"}</span>
                <span>{formatCurrency(priceCalc.cleaningFee)}</span>
              </div>
            )}
            {priceCalc.serviceFee > 0 && (
              <div className="flex justify-between gap-4">
                <span>{t("booking.serviceFee") || "Service fee"}</span>
                <span>{formatCurrency(priceCalc.serviceFee)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span>{t("checkout.taxesHst") || "Taxes (13% HST)"}</span>
              <span>{formatCurrency(priceCalc.tax)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-neutral-200 pt-4 text-base font-semibold">
              <span>{t("checkout.totalCad") || "Total CAD"}</span>
              <span>{formatCurrency(priceCalc.total)}</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            {t("booking.selectDatesToSeePrice") ||
              "Select dates to see pricing"}
          </p>
        )}
        <p className="mt-4 text-center text-sm text-neutral-500">
          {t("checkout.youWontBeChargedYet") || "You won't be charged yet"}
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header - Airbnb Style */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold">
              {t("checkout.reviewAndContinue") || "Review and continue"}
            </h1>
            <button
              onClick={() => router.push("/properties")}
              className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </Container>
      </nav>

      <Container className="py-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="min-w-0">
            {/* Property Card - Airbnb Style */}
            <div className="mb-6 flex gap-4 rounded-xl border border-neutral-200 p-4 lg:hidden">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={propertyImage}
                  alt={localizedTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-neutral-900 leading-tight line-clamp-2">
                  {localizedTitle}
                </h2>
                {property.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Star size={14} className="text-black fill-black" />
                    <span className="text-sm font-medium">
                      {property.rating}
                    </span>
                    <span className="text-sm text-neutral-500">
                      ({property.reviewCount}{" "}
                      {t("properties.reviews") || "reviews"})
                    </span>
                  </div>
                )}
                <p className="text-sm text-neutral-500 mt-1 truncate">
                  {property.location}
                </p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-0 mb-6">
              {/* Dates */}
              <div className="flex items-center justify-between py-4 border-t border-neutral-200">
                <div>
                  <h3 className="font-medium">
                    {t("booking.dates") || "Dates"}
                  </h3>
                  <p className="text-neutral-600 mt-0.5">{formatDateRange()}</p>
                  <p className="mt-1 text-sm text-neutral-500">{stayTypeLabel()}</p>
                  {isMonthly && property.monthlyDiscount && (
                    <p className="text-sm text-rose-600 font-medium mt-1">
                      {t("properties.monthlyDiscount", {
                        percent: property.monthlyDiscount,
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="px-4 py-2 text-sm font-semibold underline rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  {t("common.change") || "Change"}
                </button>
              </div>

              {/* Guests */}
              <div className="flex items-center justify-between py-4 border-t border-b border-neutral-200">
                <div>
                  <h3 className="font-medium">
                    {t("booking.guests") || "Guests"}
                  </h3>
                  <p className="text-neutral-600 mt-0.5">
                    {getGuestDisplayText()}
                  </p>
                </div>
                <button
                  onClick={() => setShowGuestPicker(true)}
                  className="px-4 py-2 text-sm font-semibold underline rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  {t("common.change") || "Change"}
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="py-4 border-b border-neutral-200 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" />
                <h3 className="font-medium">
                  {t("checkout.contactInfo") || "Contact information"}
                </h3>
              </div>
              {isAuthenticated && user && !showGuestForm ? (
                <div className="text-sm text-neutral-700 space-y-1">
                  <p>{user.name || guestName}</p>
                  <p className="text-neutral-500">{user.email || guestEmail}</p>
                  {(user.phone || guestPhone) && (
                    <p className="text-neutral-500">
                      {user.phone || guestPhone}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {t("checkout.fullName") || "Full name"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={
                        t("checkout.fullNamePlaceholder") ||
                        "Enter your full name"
                      }
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {t("checkout.email") || "Email"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder={
                        t("checkout.emailPlaceholder") || "Enter your email"
                      }
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {t("checkout.phone") || "Phone number"}
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder={
                        t("checkout.phonePlaceholder") ||
                        "Enter your phone number"
                      }
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  {!isAuthenticated && (
                    <p className="text-sm text-neutral-500">
                      {t("checkout.orSignIn") || "Already have an account?"}{" "}
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/checkout/${propertyId}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`)}`}
                        className="text-black underline font-medium"
                      >
                        {t("checkout.signIn") || "Sign in"}
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Free Cancellation */}
            <div className="py-4 border-b border-neutral-200 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">
                    {t("checkout.cancellationPolicy") || "Cancellation policy"}
                  </h3>
                  <p className="text-neutral-600 mt-1 text-sm">
                    {t("checkout.strictCancellationDesc", {
                      date: getCancellationDeadline(),
                    }) ||
                      `Strict cancellation policy. Get a 50% refund if you cancel before ${getCancellationDeadline()}.`}{" "}
                    <Link
                      href="/cancellation-policy"
                      className="underline font-medium"
                    >
                      {t("checkout.readFullPolicy") || "Read full policy"}
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Ground Rules */}
            <div className="py-4 border-b border-neutral-200 mb-6">
              <h3 className="font-medium mb-3">
                {t("checkout.groundRules") || "Ground rules"}
              </h3>
              <p className="text-neutral-600 text-sm mb-3">
                {t("checkout.groundRulesDesc") ||
                  "We ask every guest to remember a few simple things about what makes a great stay."}
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                  {t("checkout.selfCheckIn") || "Self check-in"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                  {t("checkout.checkInAfter") || "Check-in after 3:00 PM"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                  {t("checkout.checkoutBefore") || "Checkout before 11:00 AM"}
                </li>
                <li>
                  <Link
                    href={`/property/${propertyId}`}
                    className="font-medium underline"
                  >
                    {t("checkout.seeAll") || "See all"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Mobile / tablet Price Summary */}
            <div className="mb-6 lg:hidden">
              <PriceSummaryCard compact />
            </div>
          </div>

          <aside className="hidden lg:block">
            <PriceSummaryCard />
          </aside>
        </div>
      </Container>

      {/* Bottom Payment Bar - Airbnb Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <Container>
          <div className="py-4">
            {/* Price info on mobile */}
            <div className="flex items-center justify-between mb-3 sm:hidden">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold">
                    ${finalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-500">CAD</span>
                </div>
                <p className="text-xs text-neutral-500">
                  {checkIn && checkOut
                    ? formatDateRange()
                    : t("booking.selectDates") || "Select dates"}
                </p>
              </div>
            </div>

            {bookingError && (
              <p className="mb-3 text-sm text-rose-600 text-center">
                {bookingError}
              </p>
            )}
            <button
              onClick={handleProceedToPayment}
              disabled={!checkIn || !checkOut || isSubmitting}
              className="w-full py-4 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-semibold text-lg rounded-xl transition-colors"
            >
              {isSubmitting
                ? t("common.loading") || "Loading..."
                : !checkIn || !checkOut
                  ? t("booking.selectDates") || "Select dates"
                  : t("checkout.reviewAndContinue") || "Review and continue"}
            </button>

            <p className="text-xs text-neutral-500 text-center mt-3">
              {t("checkout.agreement") ||
                "By selecting the button below, I agree to the"}{" "}
              <Link href="/terms" className="underline">
                {t("footer.terms") || "booking terms"}
              </Link>
              ,{" "}
              <Link href="/cancellation-policy" className="underline">
                {t("checkout.cancellationPolicy") || "cancellation policy"}
              </Link>
              , {t("common.and") || "and"}{" "}
              <Link href="/privacy" className="underline">
                {t("footer.privacy") || "privacy policy"}
              </Link>
              .
            </p>
          </div>
        </Container>
      </div>

      {/* Date Picker Modal - Fullscreen Vertical Scroll Calendar */}
      {showDatePicker && (
        <AirbnbCalendar
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectCheckIn={setCheckIn}
          onSelectCheckOut={(date) => {
            setCheckOut(date);
            if (date && checkIn) setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
          onClearDates={() => {
            setCheckIn("");
            setCheckOut("");
          }}
          totalPrice={priceCalc?.total || 0}
          minNights={property.minNights}
          rating={property.reviewCount > 0 ? property.rating : 0}
          currency="CAD"
          bookedRanges={bookedRanges}
          autoCloseOnRangeSelect
        />
      )}

      {/* Guest Picker Modal */}
      {showGuestPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setShowGuestPicker(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {t("checkout.changeGuests") || "Change guests"}
              </h2>
              <button
                onClick={() => setShowGuestPicker(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-neutral-600 mb-6">
              {t("checkout.maxGuestsInfo", { count: property.maxGuests }) ||
                `This place has a maximum of ${property.maxGuests} guests, not including infants.`}
            </p>

            <div className="space-y-6">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {t("search.adults") || "Adults"}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {t("search.ages13Plus") || "Ages 13+"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-neutral-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">{adults}</span>
                  <button
                    onClick={() =>
                      setAdults(
                        Math.min(property.maxGuests - children, adults + 1),
                      )
                    }
                    disabled={adults + children >= property.maxGuests}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-neutral-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {t("search.children") || "Children"}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {t("search.ages2To12") || "Ages 2-12"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-neutral-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">
                    {children}
                  </span>
                  <button
                    onClick={() =>
                      setChildren(
                        Math.min(property.maxGuests - adults, children + 1),
                      )
                    }
                    disabled={adults + children >= property.maxGuests}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-neutral-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {t("search.infants") || "Infants"}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {t("search.under2") || "Under 2"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    disabled={infants <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-neutral-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">{infants}</span>
                  <button
                    onClick={() => setInfants(infants + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-neutral-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Pets */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("search.pets") || "Pets"}</h3>
                  <p className="text-sm text-neutral-500">
                    <Link href="/service-animals" className="underline">
                      {t("search.serviceAnimal") ||
                        "Bringing a service animal?"}
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPets(Math.max(0, pets - 1))}
                    disabled={pets <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-neutral-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">{pets}</span>
                  <button
                    onClick={() => setPets(pets + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-neutral-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowGuestPicker(false)}
                className="text-sm font-semibold underline"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={() => setShowGuestPicker(false)}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {t("common.save") || "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
