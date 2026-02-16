'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  Star, 
  X,
  Plus,
  Minus,
  Shield
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { getPropertyById } from '@/lib/data';
import { getLocalizedTitle } from '@/components/property/PropertyCard';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/UserContext';

interface CheckoutClientProps {
  propertyId: string;
}

// Airbnb Style Range Calendar Component
function RangeCalendar({ 
  checkIn, 
  checkOut, 
  onSelectCheckIn, 
  onSelectCheckOut,
  onClose,
  pricePerNight
}: { 
  checkIn: string; 
  checkOut: string; 
  onSelectCheckIn: (date: string) => void;
  onSelectCheckOut: (date: string) => void;
  onClose: () => void;
  pricePerNight: number;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { t } = useI18n();
  const monthNames = [
    t('calendar.january') || 'January',
    t('calendar.february') || 'February',
    t('calendar.march') || 'March',
    t('calendar.april') || 'April',
    t('calendar.may') || 'May',
    t('calendar.june') || 'June',
    t('calendar.july') || 'July',
    t('calendar.august') || 'August',
    t('calendar.september') || 'September',
    t('calendar.october') || 'October',
    t('calendar.november') || 'November',
    t('calendar.december') || 'December'
  ];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDateStatus = (year: number, month: number, day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const date = new Date(year, month, day);
    const start = checkIn ? new Date(checkIn) : null;
    const end = checkOut ? new Date(checkOut) : null;
    
    if (checkIn && dateStr === checkIn) return 'start';
    if (checkOut && dateStr === checkOut) return 'end';
    if (start && end && date > start && date < end) return 'between';
    return 'none';
  };
  
  const handleDateClick = (year: number, month: number, day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const clickedDate = new Date(year, month, day);
    
    if (!checkIn || (checkIn && checkOut)) {
      onSelectCheckIn(dateStr);
      onSelectCheckOut('');
    } else {
      const startDate = new Date(checkIn);
      if (clickedDate <= startDate) {
        onSelectCheckIn(dateStr);
      } else {
        onSelectCheckOut(dateStr);
      }
    }
  };

  const renderMonth = (monthOffset: number) => {
    const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    return (
      <div className="flex-1 min-w-[280px]">
        <h3 className="font-semibold text-center mb-4">{monthNames[month]} {year}</h3>
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-neutral-500 py-2 text-xs font-medium">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const disabled = isDateDisabled(year, month, day);
            const status = getDateStatus(year, month, day);
            
            const baseClasses = "aspect-square flex items-center justify-center text-sm relative";
            const stateClasses = disabled 
              ? "text-neutral-300 cursor-not-allowed line-through" 
              : "cursor-pointer hover:bg-neutral-100";
            
            let bgClasses = "";
            if (status === 'start' || status === 'end') {
              bgClasses = "bg-black text-white rounded-full hover:bg-black";
            } else if (status === 'between') {
              bgClasses = "bg-neutral-100";
            }
            
            const roundedClasses = 
              status === 'start' ? "rounded-l-full" :
              status === 'end' ? "rounded-r-full" :
              status === 'between' ? "" : "rounded-full";
            
            return (
              <button
                key={day}
                onClick={() => !disabled && handleDateClick(year, month, day)}
                disabled={disabled}
                className={`${baseClasses} ${stateClasses} ${bgClasses} ${roundedClasses}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Calculate nights and display text
  const getSelectionDisplay = () => {
    if (!checkIn) return { nights: 0, text: t('booking.selectCheckIn') || 'Select check-in date' };
    if (!checkOut) {
      const date = new Date(checkIn);
      return { 
        nights: 0, 
        text: `${t('booking.checkIn') || 'Check-in'}: ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` 
      };
    }
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return {
      nights,
      text: `${nights} ${nights > 1 ? (t('common.nights') || 'nights') : (t('common.night') || 'night')}`,
      range: `${start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
    };
  };

  const selection = getSelectionDisplay();
  // totalPrice used for future enhancements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _totalPrice = selection.nights > 0 ? selection.nights * pricePerNight : 0;

  return (
    <div className="w-full">
      {/* Selection info */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{selection.text}</h2>
        {selection.range && <p className="text-neutral-600 mt-1">{selection.range}</p>}
        {!checkOut && <p className="text-neutral-500 mt-1 text-sm">{t('booking.selectCheckOut') || 'Select check-out date'}</p>}
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-neutral-100 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-neutral-100 rounded-full"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Two months side by side */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        {renderMonth(0)}
        {renderMonth(1)}
      </div>

      {/* Bottom bar with price and Save */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200">
        <button 
          onClick={() => {
            onSelectCheckIn('');
            onSelectCheckOut('');
          }}
          className="text-sm font-medium underline"
        >
          {t('common.clear') || 'Clear dates'}
        </button>
        <button
          onClick={onClose}
          disabled={!checkIn || !checkOut}
          className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.save') || 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutClient({ propertyId }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const property = getPropertyById(propertyId);
  const { t, locale } = useI18n();
  const { isAuthenticated, user } = useAuth();

  // Get initial values from URL params
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '1'));
  const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0'));
  const [infants, setInfants] = useState(parseInt(searchParams.get('infants') || '0'));
  const [pets, setPets] = useState(parseInt(searchParams.get('pets') || '0'));
  
  // Modals state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  if (!property) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">{t('errors.propertyNotFound') || 'Property not found'}</p>
          <Link href="/properties" className="text-primary mt-4 inline-block underline">
            {t('properties.viewAll') || 'Back to properties'}
          </Link>
        </div>
      </main>
    );
  }

  const localizedTitle = getLocalizedTitle(property, locale);

  // Calculate nights and pricing
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const isMonthly = nights >= 28;
  const discountRate = isMonthly && property.monthlyDiscount ? (100 - property.monthlyDiscount) / 100 : 1;
  const discountedPrice = Math.round(property.price * discountRate);
  const subtotal = nights * discountedPrice;
  const taxes = nights > 0 ? Math.round(subtotal * 0.13) : 0; // 13% HST for Canada
  const finalPrice = subtotal + taxes;
  
  // Total guests (adults + children only, infants don't count toward max)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _totalGuests = adults + children;

  // Format date for display
  const formatDateRange = () => {
    if (!checkIn || !checkOut) return t('booking.selectDates') || 'Select dates';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return `${start.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  };

  // Format single date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', day: 'numeric' });
  };

  // Get cancellation date (24 hours after booking or before check-in, whichever is earlier)
  const getCancellationDeadline = () => {
    if (!checkIn) return '';
    const checkInDate = new Date(checkIn);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Show the earlier of: 24 hours from now or day before check-in
    const dayBeforeCheckIn = new Date(checkInDate);
    dayBeforeCheckIn.setDate(dayBeforeCheckIn.getDate() - 1);
    
    const deadline = twentyFourHoursFromNow < dayBeforeCheckIn ? twentyFourHoursFromNow : dayBeforeCheckIn;
    return formatDate(deadline.toISOString().split('T')[0]);
  };

  // Get user info for booking
  const getGuestInfo = () => {
    if (isAuthenticated && user) {
      return {
        guestName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest',
        guestEmail: user.email || '',
        guestPhone: user.phone || '',
        userId: user.id,
      };
    }
    // Get from URL params if passed
    const nameFromUrl = searchParams.get('name');
    const emailFromUrl = searchParams.get('email');
    const phoneFromUrl = searchParams.get('phone');
    
    return {
      guestName: nameFromUrl || 'Guest',
      guestEmail: emailFromUrl || '',
      guestPhone: phoneFromUrl || '',
      userId: undefined,
    };
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!checkIn || !checkOut) {
      setShowDatePicker(true);
      return;
    }

    const guestInfo = getGuestInfo();
    
    // Validate required info
    if (!guestInfo.guestName || !guestInfo.guestEmail) {
      // Redirect to login or show guest info form
      router.push(`/login?redirect=/checkout/${propertyId}`);
      return;
    }

    // Redirect to payment page with booking details
    const params = new URLSearchParams();
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('amount', finalPrice.toString());
    params.set('guestName', guestInfo.guestName);
    params.set('guestEmail', guestInfo.guestEmail);
    params.set('adults', adults.toString());
    params.set('children', children.toString());
    params.set('infants', infants.toString());
    params.set('pets', pets.toString());
    if (guestInfo.guestPhone) params.set('guestPhone', guestInfo.guestPhone);
    
    router.push(`/payment/${propertyId}?${params.toString()}`);
  };

  // Format guest display text
  const getGuestDisplayText = () => {
    const parts = [];
    const total = adults + children;
    parts.push(`${total} ${total === 1 ? (t('search.guest') || 'guest') : (t('search.guests') || 'guests')}`);
    if (infants > 0) {
      parts.push(`${infants} ${infants === 1 ? (t('search.infant') || 'infant') : (t('search.infants') || 'infants')}`);
    }
    if (pets > 0) {
      parts.push(`${pets} ${pets === 1 ? (t('search.pet') || 'pet') : (t('search.pets') || 'pets')}`);
    }
    return parts.join(', ');
  };

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
            <h1 className="text-lg font-semibold">{t('checkout.reviewAndContinue') || 'Review and continue'}</h1>
            <button 
              onClick={() => router.push('/properties')}
              className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </Container>
      </nav>

      <Container className="py-6">
        <div className="max-w-xl mx-auto">
          {/* Property Card - Airbnb Style */}
          <div className="flex gap-4 mb-6 p-4 border border-neutral-200 rounded-xl">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={property.images[0]}
                alt={localizedTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-neutral-900 leading-tight line-clamp-2">{localizedTitle}</h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Star size={14} className="text-black fill-black" />
                <span className="text-sm font-medium">{property.rating}</span>
                <span className="text-sm text-neutral-500">({property.reviewCount} {t('properties.reviews') || 'reviews'})</span>
              </div>
              <p className="text-sm text-neutral-500 mt-1 truncate">{property.location}</p>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-0 mb-6">
            {/* Dates */}
            <div className="flex items-center justify-between py-4 border-t border-neutral-200">
              <div>
                <h3 className="font-medium">{t('booking.dates') || 'Dates'}</h3>
                <p className="text-neutral-600 mt-0.5">{formatDateRange()}</p>
                {isMonthly && property.monthlyDiscount && (
                  <p className="text-sm text-rose-600 font-medium mt-1">
                    {t('properties.monthlyDiscount', { percent: property.monthlyDiscount })}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setShowDatePicker(true)}
                className="px-4 py-2 text-sm font-medium underline rounded-lg hover:bg-neutral-50 transition-colors"
              >
                {t('common.change') || 'Change'}
              </button>
            </div>

            {/* Guests */}
            <div className="flex items-center justify-between py-4 border-t border-b border-neutral-200">
              <div>
                <h3 className="font-medium">{t('booking.guests') || 'Guests'}</h3>
                <p className="text-neutral-600 mt-0.5">{getGuestDisplayText()}</p>
              </div>
              <button 
                onClick={() => setShowGuestPicker(true)}
                className="px-4 py-2 text-sm font-medium underline rounded-lg hover:bg-neutral-50 transition-colors"
              >
                {t('common.change') || 'Change'}
              </button>
            </div>
          </div>

          {/* Free Cancellation */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">{t('checkout.freeCancellation') || 'Free cancellation for 24 hours'}</h3>
                <p className="text-neutral-600 mt-1 text-sm">
                  {t('checkout.freeCancellationDesc', { date: getCancellationDeadline() }) || 
                    `After that, cancel before check-in for a partial refund.`}{' '}
                  <Link href="/cancellation-policy" className="underline font-medium">
                    {t('checkout.fullPolicy') || 'Full policy'}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Ground Rules */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <h3 className="font-medium mb-3">{t('checkout.groundRules') || 'Ground rules'}</h3>
            <p className="text-neutral-600 text-sm mb-3">
              {t('checkout.groundRulesDesc') || 'We ask every guest to remember a few simple things about what makes a great stay.'}
            </p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                {t('checkout.followHouseRules') || 'Follow the house rules'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                {t('checkout.treatHome') || 'Treat your home like your own'}
              </li>
            </ul>
          </div>

          {/* Price Summary (Preview) */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{t('booking.priceSummary') || 'Price Summary'}</h3>
              <button 
                onClick={() => setShowPriceDetails(!showPriceDetails)}
                className="text-sm font-medium underline"
              >
                {showPriceDetails ? (t('common.hide') || 'Hide') : (t('common.show') || 'Show')}
              </button>
            </div>
            
            {showPriceDetails && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">
                    ${discountedPrice.toLocaleString()} {isMonthly ? (t('property.monthlyPrice') || 'CAD / month') : (t('property.perNight') || 'CAD / night')} x {nights} {nights === 1 ? (t('common.night') || 'night') : (t('common.nights') || 'nights')}
                  </span>
                  <span>${subtotal.toLocaleString()} CAD</span>
                </div>
                {isMonthly && property.monthlyDiscount && (
                  <div className="flex justify-between text-rose-600">
                    <span>{t('properties.monthlyDiscount', { percent: property.monthlyDiscount })}</span>
                    <span>-${Math.round(property.price * nights - subtotal).toLocaleString()} CAD</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t('booking.taxHST') || 'Taxes (13% HST)'}</span>
                  <span>${taxes.toLocaleString()} CAD</span>
                </div>
                <Divider className="my-3" />
                <div className="flex justify-between font-semibold text-base">
                  <span>{t('booking.total') || 'Total'} <u>CAD</u></span>
                  <span>${finalPrice.toLocaleString()} CAD</span>
                </div>
              </div>
            )}
            
            {!showPriceDetails && (
              <p className="text-neutral-600">
                <span className="font-semibold">${finalPrice.toLocaleString()} CAD</span> {t('checkout.totalBeforeTaxes') || 'total before taxes'}
              </p>
            )}
          </div>
        </div>
      </Container>

      {/* Bottom Payment Bar - Airbnb Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <Container>
          <div className="py-4">
            <button 
              onClick={handleProceedToPayment}
              className="w-full py-4 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-medium text-lg rounded-xl transition-colors"
            >
              {t('checkout.reviewAndContinue') || 'Review and continue'}
            </button>
            <p className="text-xs text-neutral-500 text-center mt-3">
              {t('checkout.agreement') || 'By selecting the button below, I agree to the'}{' '}
              <Link href="/terms" className="underline">{t('footer.terms') || 'booking terms'}</Link>,{' '}
              <Link href="/cancellation-policy" className="underline">{t('checkout.cancellationPolicy') || 'cancellation policy'}</Link>,{' '}
              {t('common.and') || 'and'}{' '}
              <Link href="/privacy" className="underline">{t('footer.privacy') || 'privacy policy'}</Link>.
            </p>
          </div>
        </Container>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setShowDatePicker(false)}
                className="p-2 -ml-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <RangeCalendar 
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectCheckIn={setCheckIn}
              onSelectCheckOut={setCheckOut}
              onClose={() => setShowDatePicker(false)}
              pricePerNight={discountedPrice}
            />
          </div>
        </div>
      )}

      {/* Guest Picker Modal */}
      {showGuestPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('checkout.changeGuests') || 'Change guests'}</h2>
              <button 
                onClick={() => setShowGuestPicker(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-sm text-neutral-600 mb-6">
              {t('checkout.maxGuestsInfo', { count: property.maxGuests }) || 
                `This place has a maximum of ${property.maxGuests} guests, not including infants.`}
            </p>
            
            <div className="space-y-6">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t('search.adults') || 'Adults'}</h3>
                  <p className="text-sm text-neutral-500">{t('search.ages13Plus') || 'Ages 13+'}</p>
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
                    onClick={() => setAdults(Math.min(property.maxGuests - children, adults + 1))}
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
                  <h3 className="font-medium">{t('search.children') || 'Children'}</h3>
                  <p className="text-sm text-neutral-500">{t('search.ages2To12') || 'Ages 2-12'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-neutral-400 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">{children}</span>
                  <button 
                    onClick={() => setChildren(Math.min(property.maxGuests - adults, children + 1))}
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
                  <h3 className="font-medium">{t('search.infants') || 'Infants'}</h3>
                  <p className="text-sm text-neutral-500">{t('search.under2') || 'Under 2'}</p>
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
                  <h3 className="font-medium">{t('search.pets') || 'Pets'}</h3>
                  <p className="text-sm text-neutral-500">
                    <Link href="/service-animals" className="underline">{t('search.serviceAnimal') || 'Bringing a service animal?'}</Link>
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
                className="text-sm font-medium underline"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => setShowGuestPicker(false)}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {t('common.save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
