// Booking Price Calculator Component - Airbnb Style
// Display-only breakdown based on src/lib/booking.ts single source of truth

'use client';

import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { Sparkles, Info } from 'lucide-react';
import { calculateBookingPrice, type BookingCalculation } from '@/lib/booking';
import { cn } from '@/lib/utils';

interface BookingPriceCalculatorProps {
  basePrice: number;
  checkIn: string;
  checkOut: string;
  monthlyDiscount?: number;
  cleaningFee?: number;
  currency?: string;
  className?: string;
  compact?: boolean;
}

function buildPriceCalculation({
  basePrice,
  checkIn,
  checkOut,
  monthlyDiscount = 0,
  cleaningFee = 0,
}: Omit<BookingPriceCalculatorProps, 'currency' | 'className' | 'compact'>): BookingCalculation | null {
  if (!checkIn || !checkOut) return null;

  return calculateBookingPrice(
    {
      id: 'pricing-preview',
      title: 'Pricing Preview',
      location: '',
      price: basePrice,
      priceUnit: 'month',
      reviewCount: 0,
      images: [],
      maxGuests: 1,
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      monthlyDiscount,
      cleaningFee,
      minNights: 1,
    },
    checkIn,
    checkOut
  );
}

export function BookingPriceCalculator({
  basePrice,
  checkIn,
  checkOut,
  monthlyDiscount = 0,
  cleaningFee = 0,
  currency = 'CAD',
  className,
  compact = false,
}: BookingPriceCalculatorProps) {
  const { t } = useI18n();
  const price = useMemo(
    () => buildPriceCalculation({ basePrice, checkIn, checkOut, monthlyDiscount, cleaningFee }),
    [basePrice, checkIn, checkOut, monthlyDiscount, cleaningFee]
  );

  if (!price) {
    return <div className={cn('text-center py-4 text-neutral-500', className)}>{t('booking.selectDatesToSeePrice', 'Select dates to see pricing')}</div>;
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()} ${currency}`;

  if (compact) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex justify-between items-baseline text-sm">
          <span className="text-neutral-600 underline decoration-dotted cursor-help">
            {price.discount > 0 ? (
              <>
                <span className="line-through text-neutral-400">${price.ratePerMonth.toLocaleString()}</span>{' '}
                ${Math.round(price.ratePerMonth * price.discountRate).toLocaleString()}
              </>
            ) : (
              `$${price.ratePerMonth.toLocaleString()}`
            )}{' '}
            x {price.months} {price.months === 1 ? 'month' : 'months'} ({price.tierName})
          </span>
          <span className="text-neutral-900">{formatCurrency(price.subtotal)}</span>
        </div>

        {price.discount > 0 && (
          <div className="flex justify-between items-center text-sm text-rose-600">
            <span className="flex items-center gap-1">
              <Sparkles size={14} />
              Monthly discount ({price.discountPercentage}% off)
            </span>
            <span>-{formatCurrency(price.discount)}</span>
          </div>
        )}

        {price.cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 underline decoration-dotted cursor-help">Cleaning fee</span>
            <span className="text-neutral-900">{formatCurrency(price.cleaningFee)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 underline decoration-dotted cursor-help flex items-center gap-1">
            Service fee <Info size={12} className="text-neutral-400" />
          </span>
          <span className="text-neutral-900">{formatCurrency(price.serviceFee)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Taxes (13%)</span>
          <span className="text-neutral-900">{formatCurrency(price.tax)}</span>
        </div>

        <div className="pt-3 border-t border-neutral-200">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-neutral-900">Total <span className="text-sm font-normal">({currency})</span></span>
            <span className="font-bold text-xl text-neutral-900">{formatCurrency(price.total)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-neutral-50 rounded-xl p-4 space-y-3', className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-neutral-900">${price.ratePerMonth.toLocaleString()}</span>
        <span className="text-neutral-500">{currency} / month ({price.tierName})</span>
      </div>

      <div className="space-y-2 pt-3 border-t border-neutral-200">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 underline decoration-dotted cursor-help">
            ${price.ratePerMonth.toLocaleString()} x {price.months} months
          </span>
          <span className="text-neutral-900">{formatCurrency(price.subtotal)}</span>
        </div>

        {price.discount > 0 && (
          <div className="flex justify-between text-sm text-rose-600">
            <span className="flex items-center gap-1">
              <Sparkles size={14} /> Monthly discount ({price.discountPercentage}% off)
            </span>
            <span>-{formatCurrency(price.discount)}</span>
          </div>
        )}

        {price.cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 underline decoration-dotted cursor-help">Cleaning fee</span>
            <span className="text-neutral-900">{formatCurrency(price.cleaningFee)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 flex items-center gap-1 underline decoration-dotted cursor-help">
            Service fee <Info size={14} className="text-neutral-400" />
          </span>
          <span className="text-neutral-900">{formatCurrency(price.serviceFee)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Taxes (13%)</span>
          <span className="text-neutral-900">{formatCurrency(price.tax)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-200">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-neutral-900">Total</span>
          <div className="text-right">
            <span className="font-bold text-2xl text-neutral-900">{formatCurrency(price.total)}</span>
            <span className="text-sm text-neutral-500 block">{currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPriceCalculator;
