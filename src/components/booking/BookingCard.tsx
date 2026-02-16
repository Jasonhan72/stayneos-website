// Booking Card Component - Airbnb Style
// Main booking widget for property detail page

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  AlertCircle, 
  ChevronDown,
  Minus,
  Plus,
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { BookingPriceCalculator, calculateBookingPrice } from './BookingPriceCalculator';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    maxGuests: number;
    minNights?: number;
    monthlyDiscount?: number;
  };
  className?: string;
}

export function BookingCard({ property, className }: BookingCardProps) {
  const router = useRouter();
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const price = calculateBookingPrice({
    basePrice: property.price,
    checkIn,
    checkOut,
    monthlyDiscount: property.monthlyDiscount,
  });

  const nights = price?.nights || 0;
  const qualifiesForDiscount = nights >= 28 && property.monthlyDiscount;

  const handleReserve = useCallback(async () => {
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (property.minNights && nights < property.minNights) {
      setError(`Minimum ${property.minNights} nights required`);
      return;
    }

    setIsLoading(true);
    setError('');

    // Navigate to booking confirmation page with query params
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
    });

    router.push(`/booking/${property.id}?${params.toString()}`);
  }, [checkIn, checkOut, guests, nights, property.id, property.minNights, router]);

  const adjustGuests = (delta: number) => {
    const newGuests = guests + delta;
    if (newGuests >= 1 && newGuests <= property.maxGuests) {
      setGuests(newGuests);
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-200 shadow-xl p-6 sticky top-24",
      className
    )}>
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-1">
          {qualifiesForDiscount ? (
            <>
              <span className="text-2xl font-bold text-neutral-900">
                ${Math.round(property.price * (100 - (property.monthlyDiscount || 0)) / 100).toLocaleString()}
              </span>
              <span className="text-lg text-neutral-400 line-through ml-2">
                ${property.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-neutral-900">
              ${property.price.toLocaleString()}
            </span>
          )}
          <span className="text-neutral-500"> CAD / night</span>
        </div>

        {/* Rating placeholder - could be passed as prop */}
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">4.9</span>
          <span className="text-neutral-400">· 127 reviews</span>
        </div>
      </div>

      {/* Monthly Discount Banner */}
      {property.monthlyDiscount && property.monthlyDiscount > 0 && (
        <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-xl">
          <div className="flex items-center gap-2 text-accent-800">
            <Sparkles size={16} className="shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">{property.monthlyDiscount}% off</span>
              {' '}for stays of 28+ nights
            </div>
          </div>        </div>
      )}

      {/* Min Nights Warning */}
      {property.minNights && nights > 0 && nights < property.minNights && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-2 text-amber-800 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>Minimum {property.minNights} nights required</span>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="space-y-4">
        {/* Date Picker */}
        <div>
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            minNights={property.minNights}
            monthlyDiscount={property.monthlyDiscount}
          />
        </div>

        {/* Guests Selector */}
        <div className="relative">
          <label className="block text-xs font-semibold text-neutral-900 uppercase tracking-wide mb-1">
            Guests
          </label>
          <button
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors bg-white"
          >
            <div className="flex items-center gap-2">
              <Users size={18} className="text-neutral-400" />
              <span className="font-medium">
                {guests} {guests === 1 ? 'guest' : 'guests'}
              </span>
            </div>
            <ChevronDown 
              size={18} 
              className={cn(
                "text-neutral-400 transition-transform",
                showGuestDropdown && "rotate-180"
              )} 
            />
          </button>

          {/* Guest Dropdown */}
          {showGuestDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowGuestDropdown(false)} 
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl p-4 z-20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-sm text-neutral-500">Max {property.maxGuests} guests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustGuests(-1)}
                      disabled={guests <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-300 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-medium">{guests}</span>
                    <button
                      onClick={() => adjustGuests(1)}
                      disabled={guests >= property.maxGuests}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-300 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Reserve Button */}
        <Button
          onClick={handleReserve}
          disabled={isLoading || !checkIn || !checkOut || (property.minNights ? nights < property.minNights : false)}
          isLoading={isLoading}
          fullWidth
          size="lg"
          className="py-4 text-lg font-semibold"
        >
          {isLoading ? 'Processing...' : price ? 'Reserve' : 'Check availability'}
        </Button>

        <p className="text-center text-sm text-neutral-500">
          You won&apos;t be charged yet
        </p>

        {/* Price Breakdown */}
        {price && (
          <div className="pt-4 border-t border-neutral-200">
            <BookingPriceCalculator
              basePrice={property.price}
              checkIn={checkIn}
              checkOut={checkOut}
              monthlyDiscount={property.monthlyDiscount}
              compact
            />
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-neutral-200">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Shield size={16} className="text-primary" />
          <span>Secure booking · Free cancellation within 24h</span>
        </div>
      </div>
    </div>
  );
}

export default BookingCard;
