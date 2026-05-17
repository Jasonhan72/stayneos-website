'use client';

import { Star, ReceiptText } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { normalizeStayType, type StayType } from '@/lib/booking';
import { formatDateLabel } from '@/components/booking/calendar-utils';
import type { PropertyCardData } from '@/types';

/** Price-tier values needed by the sidebar. */
export interface BookingPriceInfo {
  unitRate: number;
  unitCount: number;
  subtotal: number;
  tax: number;
  total: number;
  tierName: string;
  minNights?: number;
  ratePerMonth?: number;
}

export interface BookingSidebarProps {
  property: PropertyCardData;
  /** Stay-type tier monthly prices */
  tierPrices: { monthly: number; quarterly: number; annual: number };
  /** Current selected stay type */
  selectedStayType: StayType | null;
  /** Default stay type for the property */
  defaultStayType: StayType;
  /** Callback when user selects a stay type */
  onStayTypeChange: (type: StayType) => void;
  /** Current check-in date (YYYY-MM-DD) */
  checkIn: string;
  /** Current check-out date (YYYY-MM-DD) */
  checkOut: string;
  /** Total guest count */
  guests: number;
  /** Computed booking price (null if dates incomplete) */
  bookingPrice: BookingPriceInfo | null;
  /** Any booking validation error message */
  bookingError: string;
  /** Open calendar modal */
  onOpenCalendar: () => void;
  /** Open guest selector modal */
  onOpenGuestSelector: () => void;
  /** Click CTA → trigger checkout/auth flow */
  onCheckAvailability: () => void;
  /** Estimated first-month tax amount */
  estimatedTax?: number;
  /** Custom sticky top class override */
  stickyTopClass?: string;
  /** Optional wrapper className */
  className?: string;
}

export default function BookingSidebar({
  property,
  tierPrices,
  selectedStayType,
  defaultStayType,
  onStayTypeChange,
  checkIn,
  checkOut,
  guests,
  bookingPrice,
  bookingError,
  onOpenCalendar,
  onOpenGuestSelector,
  onCheckAvailability,
  estimatedTax: estimatedTaxProp,
  stickyTopClass = 'top-32',
  className = '',
}: BookingSidebarProps) {
  const { t, locale } = useI18n();
  const { formatPrice: fp } = useCurrency();

  const effectiveStayType = normalizeStayType(selectedStayType, defaultStayType);

  const selectedMonthlyEstimate =
    effectiveStayType === 'QUARTERLY'
      ? tierPrices.quarterly
      : effectiveStayType === 'YEARLY'
        ? tierPrices.annual
        : tierPrices.monthly || property.price || 0;

  const estimatedTax =
    estimatedTaxProp ?? Math.round(selectedMonthlyEstimate * 0.13);

  return (
    <div
      className={`bg-white border border-neutral-200 rounded-2xl p-6 shadow-lg sticky ${stickyTopClass} ${className}`}
    >
      {/* ── Price Header ──────────────────────────────────────── */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-2xl font-bold text-neutral-900">
          {t('property.fromPrice', 'From ${price}/Mo', {
            price: fp(property.price).replace(/[$€¥]/, ''),
          })}
        </span>
        {property.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-black" />
            <span className="font-medium">{property.rating}</span>
            <span className="text-neutral-500">
              · {property.reviewCount} {t('property.reviews')}
            </span>
          </div>
        )}
      </div>

      {/* ── Stay Type Toggle ──────────────────────────────────── */}
      <div className="mb-4 rounded-xl border border-neutral-200 p-3 bg-neutral-50 space-y-2">
        {(['MONTHLY', 'QUARTERLY', 'YEARLY'] as StayType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onStayTypeChange(type)}
            className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${
              effectiveStayType === type
                ? 'bg-white shadow-sm ring-1 ring-neutral-200'
                : ''
            }`}
          >
            <span className="text-neutral-600">
              {type === 'MONTHLY'
                ? t('property.monthly', 'Monthly')
                : type === 'QUARTERLY'
                  ? `${t('property.quarterly', 'Quarterly')} (3 ${t('common.months', 'mo')})`
                  : `${t('property.annual', 'Annual')} (12 ${t('common.months', 'mo')})`}
            </span>
            <span className="font-semibold text-neutral-900">
              {fp(
                type === 'MONTHLY'
                  ? tierPrices.monthly
                  : type === 'QUARTERLY'
                    ? tierPrices.quarterly
                    : tierPrices.annual
              )}
              /Mo
            </span>
          </button>
        ))}
      </div>

      {/* ── Transparent pricing ───────────────────────────────── */}
      <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <ReceiptText size={20} className="mt-0.5 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-950">Transparent monthly estimate</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-neutral-600">Selected monthly rate</span>
                <span className="font-medium text-neutral-950">{fp(selectedMonthlyEstimate)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-neutral-600">Estimated tax</span>
                <span className="font-medium text-neutral-950">{fp(estimatedTax)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-emerald-200 pt-2">
                <span className="font-semibold text-neutral-950">Est. first month total</span>
                <span className="font-bold text-neutral-950">
                  {fp(selectedMonthlyEstimate + estimatedTax)}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-600">
              Utilities, WiFi, basic kitchenware, linens, and support are included unless noted otherwise.
            </p>
          </div>
        </div>
      </div>

      {/* ── Existing reservation edit ──────────────────────────── */}
      {checkIn && checkOut && (
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Modify reservation</p>
              <p className="mt-1 text-sm text-neutral-600">
                {formatDateLabel(checkIn, locale === 'zh' ? 'zh-CN' : 'en-US')} –{' '}
                {formatDateLabel(checkOut, locale === 'zh' ? 'zh-CN' : 'en-US')}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Change dates, extend your stay, or clear this selection.
              </p>
            </div>
            <button
              onClick={onOpenCalendar}
              className="shrink-0 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* ── Date / Guest selector ──────────────────────────────── */}
      <div className="border border-neutral-300 rounded-xl overflow-hidden mb-4">
        <div className="grid grid-cols-2 divide-x divide-neutral-300">
          <button
            onClick={onOpenCalendar}
            className="p-3 text-left hover:bg-neutral-50 transition-colors"
          >
            <p className="text-xs font-semibold text-neutral-900 uppercase">
              {t('booking.checkIn', 'Check-in')}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {checkIn
                ? formatDateLabel(checkIn, locale === 'zh' ? 'zh-CN' : 'en-US')
                : t('booking.addDate')}
            </p>
          </button>
          <button
            onClick={onOpenCalendar}
            className="p-3 text-left hover:bg-neutral-50 transition-colors"
          >
            <p className="text-xs font-semibold text-neutral-900 uppercase">
              {t('booking.checkOut', 'Checkout')}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {checkOut
                ? formatDateLabel(checkOut, locale === 'zh' ? 'zh-CN' : 'en-US')
                : t('booking.addDate')}
            </p>
          </button>
        </div>
        <button
          onClick={onOpenGuestSelector}
          className="w-full p-3 text-left border-t border-neutral-300 hover:bg-neutral-50 transition-colors"
        >
          <p className="text-xs font-semibold text-neutral-900 uppercase">
            {t('booking.guests', 'Guests')}
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            {guests} {guests === 1 ? t('booking.guestSingular') : t('booking.guestsPlural')}
          </p>
        </button>
      </div>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <button
        onClick={onCheckAvailability}
        className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-rose-700 transition-colors mb-4"
      >
        {checkIn && checkOut
          ? t('property.reserve', 'Reserve')
          : t('property.checkAvailability')}
      </button>

      <p className="text-center text-neutral-500 text-sm mb-6">
        {t('booking.youWontBeCharged')}
      </p>

      {bookingError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {bookingError}
        </p>
      )}

      {/* ── Price Breakdown ────────────────────────────────────── */}
      {bookingPrice && (
        <div className="space-y-3 text-sm border-t border-neutral-100 pt-4">
          <div className="flex justify-between">
            <span className="text-neutral-600 underline">
              {fp(bookingPrice.unitRate)} x {bookingPrice.unitCount}{' '}
              {effectiveStayType === 'NIGHTLY'
                ? t('booking.nights', { count: bookingPrice.unitCount })
                : t('booking.months', { count: bookingPrice.unitCount })}{' '}
              ({bookingPrice.tierName})
            </span>
            <span className="text-neutral-900">{fp(bookingPrice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">{t('booking.taxes', 'Taxes')} (13%)</span>
            <span className="text-neutral-900">{fp(bookingPrice.tax)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-neutral-200">
            <span className="font-semibold text-neutral-900">
              {t('property.totalBeforeTaxes', 'Total')}
            </span>
            <span className="font-semibold text-neutral-900">{fp(bookingPrice.total)}</span>
          </div>
          <p className="text-xs text-neutral-500 text-center pt-2">
            {t(
              'booking.allInclusive',
              'All-inclusive pricing: WiFi, utilities, cleaning & service fees included'
            )}
          </p>
        </div>
      )}

      {/* ── Report ─────────────────────────────────────────────── */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-neutral-500 text-sm">
        <span className="underline">{t('property.reportListing')}</span>
      </div>
    </div>
  );
}
