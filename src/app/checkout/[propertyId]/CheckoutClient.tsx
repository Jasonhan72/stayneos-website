'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Star, 
  X,
  Plus,
  Minus,
  Shield,
  User
} from 'lucide-react';
import { Container } from '@/components/ui';
import { AirbnbCalendar } from '@/components/booking';
import { BookingPriceCalculator } from '@/components/booking';
import { calculateBookingPrice } from '@/lib/booking';
import { useProperty } from '@/hooks/useProperties';
import { getLocalizedTitle } from '@/components/property/PropertyCard';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/context/UserContext';

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
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '1'));
  const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0'));
  const [infants, setInfants] = useState(parseInt(searchParams.get('infants') || '0'));
  const [pets, setPets] = useState(parseInt(searchParams.get('pets') || '0'));
  const [guestName, setGuestName] = useState(searchParams.get('name') || '');
  const [guestEmail, setGuestEmail] = useState(searchParams.get('email') || '');
  const [guestPhone, setGuestPhone] = useState(searchParams.get('phone') || '');
  const [showGuestForm, setShowGuestForm] = useState(!isAuthenticated);
  
  // Modals state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
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
          <p className="text-neutral-500">{t('common.loading') || 'Loading...'}</p>
        </div>
      </main>
    );
  }

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

  // Calculate pricing with Airbnb style breakdown
  const priceCalc = checkIn && checkOut ? calculateBookingPrice(property, checkIn, checkOut) : null;

  const nights = priceCalc?.nights || 0;
  // months available via priceCalc?.months if needed
  const finalPrice = priceCalc?.total || 0;

  // Format date for display
  const formatDateRange = () => {
    if (!checkIn || !checkOut) return t('booking.selectDates') || 'Select dates';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const formatter = new Intl.DateTimeFormat(
      locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', 
      { month: 'short', day: 'numeric' }
    );
    return `${formatter.format(start)} - ${formatter.format(end)}, ${end.getFullYear()}`;
  };

  // Format single date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', 
      { month: 'long', day: 'numeric' }
    );
  };

  // Get cancellation date
  const getCancellationDeadline = () => {
    if (!checkIn) return '';
    const checkInDate = new Date(checkIn);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayBeforeCheckIn = new Date(checkInDate);
    dayBeforeCheckIn.setDate(dayBeforeCheckIn.getDate() - 1);
    
    const deadline = twentyFourHoursFromNow < dayBeforeCheckIn ? twentyFourHoursFromNow : dayBeforeCheckIn;
    return formatDate(deadline.toISOString().split('T')[0]);
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!checkIn || !checkOut) {
      setShowDatePicker(true);
      return;
    }

    // Require name and email - from logged-in user or guest form
    if (!guestName.trim() || !guestEmail.trim()) {
      setShowGuestForm(true);
      return;
    }

    // Redirect to payment page with booking details
    const params = new URLSearchParams();
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('amount', finalPrice.toString());
    params.set('guestName', guestName.trim());
    params.set('guestEmail', guestEmail.trim());
    params.set('adults', adults.toString());
    params.set('children', children.toString());
    params.set('infants', infants.toString());
    params.set('pets', pets.toString());
    if (guestPhone.trim()) params.set('guestPhone', guestPhone.trim());
    if (isAuthenticated && user) params.set('userId', user.id);
    
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

  const isMonthly = nights >= 28;

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
              {property.reviewCount > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star size={14} className="text-black fill-black" />
                  <span className="text-sm font-medium">{property.rating}</span>
                  <span className="text-sm text-neutral-500">({property.reviewCount} {t('properties.reviews') || 'reviews'})</span>
                </div>
              )}
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
                className="px-4 py-2 text-sm font-semibold underline rounded-lg hover:bg-neutral-50 transition-colors"
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
                className="px-4 py-2 text-sm font-semibold underline rounded-lg hover:bg-neutral-50 transition-colors"
              >
                {t('common.change') || 'Change'}
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              <h3 className="font-medium">{t('checkout.contactInfo') || 'Contact information'}</h3>
            </div>
            {isAuthenticated && user && !showGuestForm ? (
              <div className="text-sm text-neutral-700 space-y-1">
                <p>{user.name || guestName}</p>
                <p className="text-neutral-500">{user.email || guestEmail}</p>
                {(user.phone || guestPhone) && <p className="text-neutral-500">{user.phone || guestPhone}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t('checkout.fullName') || 'Full name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t('checkout.fullNamePlaceholder') || 'Enter your full name'}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t('checkout.email') || 'Email'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder={t('checkout.emailPlaceholder') || 'Enter your email'}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t('checkout.phone') || 'Phone number'}
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder={t('checkout.phonePlaceholder') || 'Enter your phone number'}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                {!isAuthenticated && (
                  <p className="text-sm text-neutral-500">
                    {t('checkout.orSignIn') || 'Already have an account?'}{' '}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/checkout/${propertyId}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`)}`}
                      className="text-black underline font-medium"
                    >
                      {t('checkout.signIn') || 'Sign in'}
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

          {/* Price Summary */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <h3 className="font-medium mb-4">{t('booking.priceSummary') || 'Price Summary'}</h3>
            
            {priceCalc ? (
              <BookingPriceCalculator
                basePrice={property.price}
                checkIn={checkIn}
                checkOut={checkOut}
                monthlyDiscount={property.monthlyDiscount}
                cleaningFee={property.cleaningFee || 80}
                compact
              />
            ) : (
              <p className="text-neutral-500 text-sm">Select dates to see pricing</p>
            )}
          </div>
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
                  <span className="text-lg font-bold">${finalPrice.toLocaleString()}</span>
                  <span className="text-sm text-neutral-500">CAD</span>
                </div>
                <p className="text-xs text-neutral-500">{checkIn && checkOut ? formatDateRange() : 'Select dates'}</p>
              </div>
            </div>
            
            <button 
              onClick={handleProceedToPayment}
              disabled={!checkIn || !checkOut}
              className="w-full py-4 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-semibold text-lg rounded-xl transition-colors"
            >
              {!checkIn || !checkOut 
                ? 'Select dates' 
                : (t('checkout.reviewAndContinue') || 'Review and continue')
              }
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

      {/* Date Picker Modal - Fullscreen Vertical Scroll Calendar */}
      {showDatePicker && (
        <AirbnbCalendar 
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectCheckIn={setCheckIn}
          onSelectCheckOut={setCheckOut}
          onClose={() => setShowDatePicker(false)}
          onClearDates={() => {
            setCheckIn('');
            setCheckOut('');
          }}
          totalPrice={priceCalc?.total || 0}
          minNights={property.minNights}
          rating={property.reviewCount > 0 ? property.rating : 0}
          currency="CAD"
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
                className="text-sm font-semibold underline"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => setShowGuestPicker(false)}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
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
