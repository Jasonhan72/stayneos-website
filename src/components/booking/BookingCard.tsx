// Booking Card Component - Airbnb Style
// Main booking widget for property detail page

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  ChevronDown,
  Minus,
  Plus,
  Shield,
  Sparkles,
  X,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui';
import { AirbnbCalendar } from './AirbnbCalendar';
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
    cleaningFee?: number;
    rating?: number;
    reviewCount?: number;
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate price with cleaning fee
  const price = calculateBookingPrice({
    basePrice: property.price,
    checkIn,
    checkOut,
    monthlyDiscount: property.monthlyDiscount,
    cleaningFee: property.cleaningFee || 80, // Default cleaning fee
  });

  const nights = price?.nights || 0;
  const qualifiesForDiscount = nights >= 28 && property.monthlyDiscount;

  // Handle reserve button click
  const handleReserve = useCallback(async () => {
    if (!checkIn || !checkOut) {
      setShowDatePicker(true);
      setError('Please select dates');
      return;
    }

    if (property.minNights && nights < property.minNights) {
      setError(`Minimum ${property.minNights} nights required`);
      return;
    }

    setIsLoading(true);
    setError('');

    // Navigate to checkout page with query params
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
    });

    router.push(`/checkout/${property.id}?${params.toString()}`);
  }, [checkIn, checkOut, guests, nights, property.id, property.minNights, router]);

  // Adjust guests
  const adjustGuests = (delta: number) => {
    const newGuests = guests + delta;
    if (newGuests >= 1 && newGuests <= property.maxGuests) {
      setGuests(newGuests);
    }
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Add date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get reserve button text
  const getReserveButtonText = () => {
    if (isLoading) return 'Processing...';
    if (!checkIn || !checkOut) return 'Check availability';
    return 'Reserve';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowGuestDropdown(false);
    };
    
    if (showGuestDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showGuestDropdown]);

  return (
    <>
      {/* Main Booking Card */}
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

          {/* Rating */}
          {(property.rating || property.reviewCount) && (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-black" />
              <span className="font-medium">{property.rating || '4.9'}</span>
              <span className="text-neutral-400">· {property.reviewCount || '127'} reviews</span>
            </div>
          )}
        </div>

        {/* Monthly Discount Banner */}
        {property.monthlyDiscount && property.monthlyDiscount > 0 && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-center gap-2 text-rose-800">
              <Sparkles size={16} className="shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">{property.monthlyDiscount}% off</span>
                {' '}for stays of 28+ nights
              </div>
            </div>
          </div>
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

        {/* Booking Form - Airbnb Style Input Container */}
        <div className={cn(
          "border-2 border-neutral-900 rounded-xl overflow-hidden mb-4",
          error && "border-red-500"
        )}>
          {/* Date Inputs */}
          <div className="grid grid-cols-2 divide-x divide-neutral-200">
            <button
              onClick={() => setShowDatePicker(true)}
              className="p-3 text-left hover:bg-neutral-50 transition-colors"
            >
              <div className="text-xs font-bold text-neutral-900 uppercase">Check-in</div>
              <div className={cn(
                "text-sm mt-0.5",
                checkIn ? 'text-neutral-900 font-medium' : 'text-neutral-500'
              )}>
                {formatDateDisplay(checkIn)}
              </div>
            </button>
            
            <button
              onClick={() => setShowDatePicker(true)}
              className="p-3 text-left hover:bg-neutral-50 transition-colors"
            >
              <div className="text-xs font-bold text-neutral-900 uppercase">Checkout</div>
              <div className={cn(
                "text-sm mt-0.5",
                checkOut ? 'text-neutral-900 font-medium' : 'text-neutral-500'
              )}>
                {formatDateDisplay(checkOut)}
              </div>
            </button>
          </div>
          
          {/* Guest Input */}
          <div className="border-t border-neutral-200 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGuestDropdown(!showGuestDropdown);
              }}
              className="w-full p-3 text-left hover:bg-neutral-50 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-neutral-900 uppercase">Guests</div>
                <div className="text-sm mt-0.5 font-medium text-neutral-900">
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </div>
              </div>
              <ChevronDown 
                size={18} 
                className={cn(
                  "text-neutral-700 transition-transform",
                  showGuestDropdown && "rotate-180"
                )} 
              />
            </button>
            
            {/* Guest Dropdown */}
            {showGuestDropdown && (
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
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-400 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-neutral-300 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-medium">{guests}</span>
                    <button
                      onClick={() => adjustGuests(1)}
                      disabled={guests >= property.maxGuests}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-400 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-neutral-300 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Reserve Button */}
        <Button
          onClick={handleReserve}
          disabled={isLoading}
          isLoading={isLoading}
          fullWidth
          size="lg"
          className="py-4 text-lg font-semibold bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
        >
          {getReserveButtonText()}
        </Button>

        <p className="text-center text-sm text-neutral-500 mt-3">
          You won&apos;t be charged yet
        </p>

        {/* Price Breakdown */}
        {price && (
          <div className="pt-4 mt-4 border-t border-neutral-200">
            <BookingPriceCalculator
              basePrice={property.price}
              checkIn={checkIn}
              checkOut={checkOut}
              monthlyDiscount={property.monthlyDiscount}
              cleaningFee={property.cleaningFee || 80}
              compact
            />
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Shield size={16} className="text-neutral-900" />
            <span>Secure booking · Free cancellation within 24h</span>
          </div>
        </div>
      </div>

      {/* Date Picker Modal - Mobile Optimized */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
        >
          <div 
            className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div />
              <button 
                onClick={() => setShowDatePicker(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={24} className="text-neutral-700" />
              </button>
            </div>
            
            {/* Calendar */}
            <AirbnbCalendar 
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectCheckIn={setCheckIn}
              onSelectCheckOut={setCheckOut}
              onClose={() => setShowDatePicker(false)}
              pricePerNight={qualifiesForDiscount 
                ? Math.round(property.price * (100 - (property.monthlyDiscount || 0)) / 100)
                : property.price
              }
              minNights={property.minNights}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default BookingCard;
