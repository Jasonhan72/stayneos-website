'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AirbnbCalendar, BookingPriceCalculator, GuestSelector, type GuestCounts } from '@/components/booking';
import StripeProvider from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { Input } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiErrorAlert } from '@/components/error';
import { calculateBookingPrice, validateBookingDates } from '@/lib/booking';
import { useAuth } from '@/lib/UserContext';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useProperty } from '@/hooks/useProperties';
import { useCreateBooking } from '@/hooks/useBookings';
import { 
  ChevronLeft, 
  AlertCircle,
  Loader2,
  Shield,
  Lock,
  User,
  Sparkles,
  Home,
  CreditCard
} from 'lucide-react';

export default function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = params.propertyId as string;
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  // Property data
  const { property, isLoading: isPropertyLoading, error: propertyError } = useProperty(propertyId);
  const propertyCardData = property;
  
  // Booking mutation
  const { createBooking, isCreating, error: bookingError } = useCreateBooking();
  
  // Get pre-filled data from URL
  const queryCheckIn = searchParams.get('checkIn') || '';
  const queryCheckOut = searchParams.get('checkOut') || '';
  const queryGuests = parseInt(searchParams.get('guests') || '1', 10);
  
  const hasPrefilled = !!(queryCheckIn && queryCheckOut);
  
  // Form state
  const [checkIn, setCheckIn] = useState(queryCheckIn);
  const [checkOut, setCheckOut] = useState(queryCheckOut);
  const [guests, setGuests] = useState(queryGuests);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Auto-fill user info
  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [isAuthenticated, user]);
  
  // Inline edit toggles
  const [editingDates, setEditingDates] = useState(!hasPrefilled);
  const [editingGuests, setEditingGuests] = useState(false);
  const [error, setError] = useState('');
  
  // Guest breakdown state
  const [guestBreakdown, setGuestBreakdown] = useState<GuestCounts>({
    adults: queryGuests,
    children: 0,
    infants: 0,
  });
  
  // Booking and payment state
  const [clientSecret, setClientSecret] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  // Redirect if property not found
  useEffect(() => {
    if (!isPropertyLoading && !property) {
      router.push('/properties');
    }
  }, [isPropertyLoading, property, router]);

  if (isPropertyLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton.PropertyDetail />
        </div>
      </div>
    );
  }

  if (propertyError || !property || !propertyCardData) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <ApiErrorAlert 
            error={propertyError || new Error('Property not found')}
            onRetry={() => window.location.reload()}
          />
          <div className="mt-6 text-center">
            <Link 
              href="/properties"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ChevronLeft size={18} />
              {t('common.backToList')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate price
  const priceCalc = checkIn && checkOut 
    ? calculateBookingPrice(propertyCardData, checkIn, checkOut)
    : null;

  // Validate dates
  const dateValidation = checkIn && checkOut
    ? validateBookingDates(checkIn, checkOut, propertyCardData.minNights)
    : { valid: true };

  // Calculate discounted price for display
  const nights = priceCalc?.nights || 0;
  const isMonthly = nights >= 28;
  const displayPrice = isMonthly && propertyCardData.monthlyDiscount 
    ? Math.round(propertyCardData.price * (100 - propertyCardData.monthlyDiscount) / 100)
    : propertyCardData.price;

  // Format date display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return t('booking.addDate');
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format guest display
  const formatGuestDisplay = () => {
    const parts: string[] = [];
    const totalGuests = guestBreakdown.adults + guestBreakdown.children;
    parts.push(`${totalGuests} ${totalGuests === 1 ? t('booking.guest') : t('booking.guests')}`);
    if (guestBreakdown.infants > 0) {
      parts.push(`${guestBreakdown.infants} ${guestBreakdown.infants === 1 ? t('booking.guestSelector.infant') : t('booking.guestSelector.infants')}`);
    }
    return parts.join(', ');
  };

  // Handle create booking
  const handleCreateBooking = async () => {
    if (!checkIn || !checkOut) {
      setError(t('booking.selectDatesError'));
      setEditingDates(true);
      return;
    }

    if (!dateValidation.valid) {
      setError(dateValidation.error || t('errors.selectDates'));
      return;
    }

    const finalGuestName = isAuthenticated ? (user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()) : guestName;
    const finalGuestEmail = isAuthenticated ? user?.email : guestEmail;
    const finalGuestPhone = isAuthenticated ? (user?.phone || guestPhone) : guestPhone;

    if (!finalGuestName || !finalGuestEmail || !finalGuestPhone) {
      setError(t('booking.fillAllInfo'));
      return;
    }

    setError('');

    try {
      const result = await createBooking({
        propertyId: property.id,
        checkIn,
        checkOut,
        guests,
        guestName: finalGuestName,
        guestEmail: finalGuestEmail,
        guestPhone: finalGuestPhone,
        specialRequests,
      });

      setBookingNumber(result.booking.bookingNumber);
      
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
      }
      
      setShowPayment(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/payment/success?booking=${bookingNumber}`);
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center">
          <Link 
            href={`/property/${property.id}`}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">{t('booking.backToProperty')}</span>
          </Link>
        </div>
      </nav>

      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Page Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-8">
            {t('booking.confirmAndPay') || 'Confirm and pay'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3 space-y-0">

              {/* Section 1: Trip Details - Dates */}
              <section className="py-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  {t('booking.yourTrip') || 'Your trip'}
                </h2>
                
                {/* Dates Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900">{t('booking.dates') || 'Dates'}</h3>
                    {checkIn && checkOut ? (
                      <p className="text-neutral-600 mt-0.5">
                        {formatDateDisplay(checkIn)} – {formatDateDisplay(checkOut)}
                        {nights > 0 && (
                          <span className="text-neutral-400 ml-1">
                            · {nights} {nights === 1 ? 'night' : 'nights'}
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="text-neutral-500 mt-0.5">{t('booking.addDates') || 'Add dates'}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingDates(!editingDates)}
                    className="text-sm font-semibold text-neutral-900 underline hover:text-neutral-600 transition-colors shrink-0 ml-4"
                  >
                    {editingDates ? (t('common.close') || 'Close') : (t('common.edit') || 'Edit')}
                  </button>
                </div>

                {/* Inline Calendar (opens as modal since AirbnbCalendar is modal-based) */}
                {editingDates && (
                  <AirbnbCalendar 
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onSelectCheckIn={setCheckIn}
                    onSelectCheckOut={setCheckOut}
                    onClose={() => {
                      setEditingDates(false);
                      setError('');
                    }}
                    onClearDates={() => {
                      setCheckIn('');
                      setCheckOut('');
                      setError('');
                    }}
                    pricePerNight={displayPrice}
                    minNights={propertyCardData.minNights}
                    rating={propertyCardData.rating}
                    currency="CAD"
                  />
                )}

                {!dateValidation.valid && !editingDates && (
                  <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                    <AlertCircle size={16} />
                    <span>{dateValidation.error}</span>
                  </div>
                )}

                {propertyCardData.monthlyDiscount && propertyCardData.monthlyDiscount > 0 && nights >= 28 && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="flex items-center gap-2 text-rose-800">
                      <Sparkles size={16} />
                      <span className="text-sm">
                        <span className="font-semibold">{propertyCardData.monthlyDiscount}% off</span> for stays of 28+ nights
                      </span>
                    </div>
                  </div>
                )}

                {/* Guests Row */}
                <div className="flex items-start justify-between mt-6">
                  <div>
                    <h3 className="font-medium text-neutral-900">{t('booking.guests') || 'Guests'}</h3>
                    <p className="text-neutral-600 mt-0.5">{formatGuestDisplay()}</p>
                  </div>
                  <button
                    onClick={() => setEditingGuests(!editingGuests)}
                    className="text-sm font-semibold text-neutral-900 underline hover:text-neutral-600 transition-colors shrink-0 ml-4"
                  >
                    {editingGuests ? (t('common.close') || 'Close') : (t('common.edit') || 'Edit')}
                  </button>
                </div>

                {/* Guest Selector (inline via modal) */}
                <GuestSelector
                  isOpen={editingGuests}
                  onClose={() => setEditingGuests(false)}
                  onSave={(newGuests) => {
                    setGuestBreakdown(newGuests);
                    setGuests(newGuests.adults + newGuests.children);
                    setEditingGuests(false);
                  }}
                  initialGuests={guestBreakdown}
                  maxGuests={propertyCardData.maxGuests}
                  allowPets={false}
                />
              </section>

              {/* Section 2: Contact Info */}
              <section className="py-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  {t('booking.contactInfo') || 'Contact information'}
                </h2>
                
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{guestName}</p>
                        <p className="text-sm text-neutral-500">{guestEmail}</p>
                        {guestPhone && (
                          <p className="text-sm text-neutral-500">{guestPhone}</p>
                        )}
                      </div>
                      <Link 
                        href="/profile" 
                        className="text-sm font-semibold text-neutral-900 underline hover:text-neutral-600 transition-colors"
                      >
                        {t('common.edit') || 'Edit'}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                      <Input
                        label="Phone Number *"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+1 (xxx) xxx-xxxx"
                        required
                      />
                    </div>

                    <Input
                      label="Email Address *"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                )}

                {/* Special Requests */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    {t('booking.specialRequests') || 'Special requests'} <span className="text-neutral-400 font-normal">({t('common.optional') || 'optional'})</span>
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={t('booking.specialRequestsPlaceholder') || 'Any special requests or requirements...'}
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all text-sm"
                  />
                </div>
              </section>

              {/* Section 3: Payment */}
              {showPayment ? (
                <section className="py-6 border-b border-neutral-200">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-neutral-700" />
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {t('booking.payWith') || 'Pay with'}
                    </h2>
                  </div>
                  
                  {clientSecret ? (
                    <StripeProvider clientSecret={clientSecret}>
                      <PaymentForm
                        amount={priceCalc?.total || 0}
                        currency={priceCalc?.currency || 'CAD'}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </StripeProvider>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="animate-spin mr-2 text-neutral-400" size={24} />
                      <span className="text-neutral-500">{t('common.loading')}</span>
                    </div>
                  )}
                </section>
              ) : (
                <section className="py-6">
                  {/* Error */}
                  {(error || bookingError) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                      <AlertCircle size={18} />
                      <span>{error || (bookingError instanceof Error ? bookingError.message : 'Booking failed')}</span>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <button
                    onClick={handleCreateBooking}
                    disabled={isCreating}
                    className={cn(
                      "w-full py-4 rounded-xl text-base font-semibold transition-all",
                      "bg-neutral-900 text-white hover:bg-neutral-800",
                      "disabled:bg-neutral-300 disabled:cursor-not-allowed",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {t('booking.processing') || 'Processing...'}
                      </>
                    ) : (
                      t('booking.confirmAndPay') || 'Confirm and pay'
                    )}
                  </button>

                  <p className="text-xs text-neutral-500 mt-4 text-center leading-relaxed">
                    {t('booking.termsNotice') || 'By confirming, you agree to our Terms of Service and Cancellation Policy.'}
                  </p>
                </section>
              )}

              {/* Payment Error */}
              {showPayment && error && (
                <div className="py-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sticky Summary Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
                {/* Property Info */}
                <div className="flex gap-4 pb-6 border-b border-neutral-200">
                  <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={propertyCardData.images[0]}
                      alt={propertyCardData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500 mb-0.5">{t('booking.entireHome') || 'Entire home'}</p>
                    <h3 className="font-medium text-neutral-900 text-sm line-clamp-2">{propertyCardData.title}</h3>
                    <div className="flex items-center gap-1 text-neutral-500 text-xs mt-1">
                      <Home size={12} />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </div>
                </div>

                {/* Dates Summary */}
                {checkIn && checkOut && (
                  <div className="py-4 border-b border-neutral-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{t('booking.checkIn')}</span>
                      <span className="font-medium">{formatDateDisplay(checkIn)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-neutral-600">{t('booking.checkOut')}</span>
                      <span className="font-medium">{formatDateDisplay(checkOut)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-neutral-600">{t('booking.guests')}</span>
                      <span className="font-medium">{formatGuestDisplay()}</span>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="py-4">
                  {priceCalc ? (
                    <BookingPriceCalculator
                      basePrice={propertyCardData.price}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      monthlyDiscount={propertyCardData.monthlyDiscount}
                      cleaningFee={propertyCardData.cleaningFee || 80}
                      compact
                    />
                  ) : (
                    <div className="text-center py-2 text-neutral-500 text-sm">
                      {t('booking.selectDatesToSeePrice')}
                    </div>
                  )}
                </div>

                {/* Security Badges */}
                <div className="pt-4 border-t border-neutral-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Shield size={14} className="text-neutral-400" />
                    <span>{t('booking.secureBooking')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Lock size={14} className="text-neutral-400" />
                    <span>{t('booking.encryptedPayment')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
