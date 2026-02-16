'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { BookingPriceCalculator } from '@/components/booking';
import StripeProvider from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { Button, Input } from '@/components/ui';
import { getPropertyById } from '@/lib/data';
import { calculateBookingPrice, validateBookingDates } from '@/lib/booking';
import { useAuth } from '@/lib/UserContext';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  Calendar, 
  Check, 
  AlertCircle,
  Loader2,
  Shield,
  Lock,
  User,
  Sparkles,
  Home,
  ChevronRight,
  CreditCard
} from 'lucide-react';

export default function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = params.propertyId as string;
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  const property = getPropertyById(propertyId);
  
  // Get pre-filled data from URL
  const queryCheckIn = searchParams.get('checkIn') || '';
  const queryCheckOut = searchParams.get('checkOut') || '';
  const queryGuests = parseInt(searchParams.get('guests') || '1', 10);
  
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
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Booking and payment state
  const [, setBookingId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');

  // Redirect if property not found
  useEffect(() => {
    if (!property) {
      router.push('/properties');
    }
  }, [property, router]);

  if (!property) {
    return null;
  }

  // Calculate price
  const priceCalc = checkIn && checkOut 
    ? calculateBookingPrice(property, checkIn, checkOut)
    : null;

  // Validate dates
  const dateValidation = checkIn && checkOut
    ? validateBookingDates(checkIn, checkOut, property.minNights)
    : { valid: true };

  // Handle create booking
  const handleCreateBooking = async () => {
    if (!checkIn || !checkOut) {
      setError(t('booking.selectDatesError'));
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

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          checkIn,
          checkOut,
          nights: priceCalc?.nights || 0,
          guests,
          guestName: finalGuestName,
          guestEmail: finalGuestEmail,
          guestPhone: finalGuestPhone,
          basePrice: property.price,
          discountRate: priceCalc?.discountPercentage || 0,
          discountAmount: priceCalc?.discount || 0,
          serviceFee: priceCalc?.serviceFee || 0,
          totalPrice: priceCalc?.total || 0,
          specialRequests,
          userId: isAuthenticated ? user?.id : undefined,
        }),
      });

      const data = await response.json() as { error?: string; booking: { id: string; bookingNumber: string } };

      if (!response.ok) {
        throw new Error(data.error || t('booking.createBookingError'));
      }

      setBookingId(data.booking.id);
      setBookingNumber(data.booking.bookingNumber);
      setCurrentStep(3);
      
      await createPaymentIntent(data.booking.id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentIntent = async (bookingId: string) => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json() as { error?: string; clientSecret: string };

      if (!response.ok) {
        throw new Error(data.error || t('booking.createPaymentError'));
      }

      setClientSecret(data.clientSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('booking.createPaymentError');
      setError(errorMessage);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/payment/success?booking=${bookingNumber}`);
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center max-w-2xl mx-auto">
        {[1, 2, 3].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors",
              currentStep > step 
                ? 'bg-success text-white' 
                : currentStep === step 
                  ? 'bg-primary text-white'
                  : 'bg-neutral-200 text-neutral-500'
            )}>
              {currentStep > step ? (
                <Check size={20} />
              ) : (
                step
              )}
            </div>
            {index < 2 && (
              <div className={cn(
                "w-16 h-1 mx-2 transition-colors",
                currentStep > step ? 'bg-success' : 'bg-neutral-200'
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-12 mt-3 text-sm">
        <span className={currentStep === 1 ? 'text-primary font-medium' : 'text-neutral-500'}>{t('booking.step1')}</span>
        <span className={currentStep === 2 ? 'text-primary font-medium' : 'text-neutral-500'}>{t('booking.step2')}</span>
        <span className={currentStep === 3 ? 'text-primary font-medium' : 'text-neutral-500'}>{t('booking.step3')}</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link 
            href={`/property/${property.id}`}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back to property</span>
          </Link>
        </div>
      </nav>

      <div className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <StepIndicator />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Dates & Guests */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    Select dates and guests
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Check-in / Check-out
                      </label>
                      <DateRangePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onCheckInChange={setCheckIn}
                        onCheckOutChange={setCheckOut}
                        minNights={property.minNights}
                        monthlyDiscount={property.monthlyDiscount}
                      />
                      
                      {!dateValidation.valid && (
                        <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                          <AlertCircle size={16} />
                          <span>{dateValidation.error}</span>
                        </div>
                      )}
                      
                      {property.monthlyDiscount && property.monthlyDiscount > 0 && (
                        <div className="mt-3 p-3 bg-accent-50 border border-accent-200 rounded-lg">
                          <div className="flex items-center gap-2 text-accent-800">
                            <Sparkles size={16} />
                            <span className="text-sm">
                              <span className="font-semibold">{property.monthlyDiscount}% off</span> for stays of 28+ nights
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Guests
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        {Array.from({ length: property.maxGuests }).map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1} {i === 0 ? 'guest' : 'guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!checkIn || !checkOut || !dateValidation.valid}
                      size="lg"
                      rightIcon={<ChevronRight size={18} />}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Guest Info */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    Confirm your information
                  </h2>
                  
                  <div className="space-y-6">
                    {isAuthenticated && user ? (
                      <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900">Logged in as</h3>
                            <p className="text-sm text-neutral-500">Your account information will be used</p>
                          </div>
                        </div>                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-neutral-500">Name: </span>
                            <span className="font-medium">{guestName}</span>
                          </p>
                          <p>
                            <span className="text-neutral-500">Email: </span>
                            <span className="font-medium">{guestEmail}</span>
                          </p>
                          {guestPhone && (
                            <p>
                              <span className="text-neutral-500">Phone: </span>
                              <span className="font-medium">{guestPhone}</span>
                            </p>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary-200">
                          <Link href="/profile" className="text-primary text-sm font-medium hover:underline">
                            Edit profile →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requests or requirements..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleCreateBooking}
                      disabled={isLoading}
                      isLoading={isLoading}
                      size="lg"
                    >
                      {isLoading ? 'Processing...' : 'Confirm & Pay'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Secure Payment</h2>
                      <p className="text-neutral-500">Your payment information is encrypted</p>
                    </div>
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
                      <Loader2 className="animate-spin mr-2 text-primary" size={24} />
                      <span>Loading payment details...</span>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right - Price Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
                {/* Property Info */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-neutral-100">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 line-clamp-2">{property.title}</h3>
                    <div className="flex items-center gap-1 text-neutral-500 text-sm mt-1">
                      <Home size={14} />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </div>
                </div>

                {/* Dates Summary */}
                {checkIn && checkOut && (
                  <div className="mb-6 pb-6 border-b border-neutral-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Calendar size={18} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Check-in</p>
                        <p className="font-medium">{checkIn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Calendar size={18} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Check-out</p>
                        <p className="font-medium">{checkOut}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                {priceCalc && (
                  <BookingPriceCalculator
                    basePrice={property.price}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    monthlyDiscount={property.monthlyDiscount}
                    compact
                  />
                )}

                {/* Security Badges */}
                <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Shield size={16} className="text-primary" />
                    <span>Secure booking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Lock size={16} className="text-primary" />
                    <span>Encrypted payment</span>
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
