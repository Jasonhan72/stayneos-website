// Booking Price Calculator Component
// Real-time price breakdown with long-term rental discounts

'use client';

import { useMemo } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceBreakdown {
  nights: number;
  basePrice: number;
  originalSubtotal: number;
  discountedPrice: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  discount: number;
  discountPercentage: number;
  tax: number;
  total: number;
  isMonthly: boolean;
  savings: number;
}

interface BookingPriceCalculatorProps {
  basePrice: number;
  checkIn: string;
  checkOut: string;
  monthlyDiscount?: number;
  cleaningFee?: number;
  serviceFeeRate?: number;
  taxRate?: number;
  currency?: string;
  className?: string;
  compact?: boolean;
}

export function calculateBookingPrice({
  basePrice,
  checkIn,
  checkOut,
  monthlyDiscount = 0,
  cleaningFee = 0,
  serviceFeeRate = 0.10,
  taxRate = 0.13,
}: Omit<BookingPriceCalculatorProps, 'currency' | 'className' | 'compact'>): PriceBreakdown | null {
  if (!checkIn || !checkOut) return null;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) return null;

  const isMonthly = nights >= 28;
  const discountPercentage = isMonthly && monthlyDiscount ? monthlyDiscount : 0;
  const discountRate = (100 - discountPercentage) / 100;

  const originalSubtotal = nights * basePrice;
  const discountedPrice = Math.round(basePrice * discountRate);
  const subtotal = nights * discountedPrice;
  const discount = originalSubtotal - subtotal;

  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const taxableAmount = subtotal + cleaningFee + serviceFee;
  const tax = Math.round(taxableAmount * taxRate);
  const total = subtotal + cleaningFee + serviceFee + tax;

  return {
    nights,
    basePrice,
    originalSubtotal,
    discountedPrice,
    subtotal,
    cleaningFee,
    serviceFee,
    discount,
    discountPercentage,
    tax,
    total,
    isMonthly,
    savings: discount,
  };
}

export function BookingPriceCalculator({
  basePrice,
  checkIn,
  checkOut,
  monthlyDiscount = 0,
  cleaningFee = 0,
  serviceFeeRate = 0.10,
  taxRate = 0.13,
  currency = 'CAD',
  className,
  compact = false,
}: BookingPriceCalculatorProps) {
  const price = useMemo(() => 
    calculateBookingPrice({
      basePrice,
      checkIn,
      checkOut,
      monthlyDiscount,
      cleaningFee,
      serviceFeeRate,
      taxRate,
    }),
    [basePrice, checkIn, checkOut, monthlyDiscount, cleaningFee, serviceFeeRate, taxRate]
  );

  if (!price) {
    return (
      <div className={cn("text-center py-4 text-neutral-500", className)}>
        Select dates to see pricing
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()} ${currency}`;
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between items-baseline">
          <span className="text-neutral-600">
            {price.isMonthly ? (
              <span className="line-through text-neutral-400">${price.basePrice.toLocaleString()}</span>
            ) : (
              `$${price.basePrice.toLocaleString()}`
            )} x {price.nights} nights
          </span>
          <span className="font-medium">{formatCurrency(price.subtotal)}</span>
        </div>
        
        {price.discount > 0 && (
          <div className="flex justify-between items-center text-success">
            <span className="flex items-center gap-1">
              <Sparkles size={14} />
              Monthly discount ({price.discountPercentage}% off)
            </span>
            <span>-{formatCurrency(price.discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-neutral-600">Service fee</span>
          <span>{formatCurrency(price.serviceFee)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-neutral-600">Taxes (13%)</span>
          <span>{formatCurrency(price.tax)}</span>
        </div>
        
        <div className="pt-2 border-t border-neutral-200">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-xl">{formatCurrency(price.total)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-neutral-50 rounded-xl p-4 space-y-3", className)}>
      {/* Header - Price per night */}
      <div className="flex items-baseline gap-2">
        {price.isMonthly ? (
          <>
            <span className="text-3xl font-bold text-neutral-900">
              ${price.discountedPrice.toLocaleString()}
            </span>
            <span className="text-lg text-neutral-400 line-through">
              ${price.basePrice.toLocaleString()}
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-neutral-900">
            ${price.basePrice.toLocaleString()}
          </span>
        )}
        <span className="text-neutral-500">{currency} / night</span>
      </div>

      {/* Monthly Discount Badge */}
      {price.isMonthly && monthlyDiscount > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-100 text-accent-800 rounded-full text-sm font-medium">
          <Sparkles size={14} />
          <span>Monthly rate: {monthlyDiscount}% off applied</span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 pt-3 border-t border-neutral-200">
        {/* Base price */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 underline decoration-dotted">
            {price.isMonthly ? (
              <>
                <span className="line-through">${price.basePrice.toLocaleString()}</span>
                {' '}${price.discountedPrice.toLocaleString()} x {price.nights} nights
              </>
            ) : (
              `$${price.basePrice.toLocaleString()} x ${price.nights} nights`
            )}
          </span>
          <span className="text-neutral-900">{formatCurrency(price.subtotal)}</span>
        </div>

        {/* Discount */}
        {price.discount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span className="flex items-center gap-1">
              <Sparkles size={14} />
              Monthly discount ({price.discountPercentage}% off)
            </span>
            <span>-{formatCurrency(price.discount)}</span>
          </div>
        )}

        {/* Cleaning fee */}
        {cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Cleaning fee</span>
            <span className="text-neutral-900">{formatCurrency(price.cleaningFee)}</span>
          </div>
        )}

        {/* Service fee */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 flex items-center gap-1">
            Service fee
            <Info size={14} className="text-neutral-400" />
          </span>
          <span className="text-neutral-900">{formatCurrency(price.serviceFee)}</span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Taxes (13% HST)</span>
          <span className="text-neutral-900">{formatCurrency(price.tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-neutral-200">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-neutral-900">Total</span>
          <div className="text-right">
            <span className="font-bold text-2xl text-neutral-900">{formatCurrency(price.total)}</span>
            <span className="text-sm text-neutral-500 block">{currency}</span>
          </div>
        </div>
      </div>

      {/* Savings message */}
      {price.savings > 0 && (
        <div className="pt-2 text-center">
          <span className="text-sm text-success font-medium">
            You save {formatCurrency(price.savings)} with monthly rate!
          </span>
        </div>
      )}
    </div>
  );
}

export default BookingPriceCalculator;
