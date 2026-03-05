'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, 
  X, 
  Star, 
  Lock,
  Check,
  Tag,
  Calendar,
  Users,
  AlertCircle,
  Shield
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { useProperty } from '@/hooks/useProperties';
import { getLocalizedTitle } from '@/components/property/PropertyCard';
import { useI18n } from '@/lib/i18n';
import StripeProvider from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';

interface PaymentClientProps {
  propertyId: string;
}

export default function PaymentClient({ propertyId }: PaymentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { property, isLoading: isPropertyLoading } = useProperty(propertyId);
  const { t, locale } = useI18n();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stripe
  const [clientSecret, setClientSecret] = useState('');
  const [paymentReady, setPaymentReady] = useState(false);
  
  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Get booking details from URL
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');
  const infants = parseInt(searchParams.get('infants') || '0');
  const bookingId = searchParams.get('bookingId') || '';

  // Calculate pricing
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const isMonthly = nights >= 28;
  const discountRate = isMonthly && property?.monthlyDiscount ? (100 - property.monthlyDiscount) / 100 : 1;
  const pricePerNight = property ? Math.round(property.price * discountRate) : 0;
  const subtotal = nights * pricePerNight;
  const taxes = nights > 0 ? Math.round((subtotal - promoDiscount) * 0.13) : 0;
  const total = subtotal - promoDiscount + taxes;

  const localizedTitle = property ? getLocalizedTitle(property, locale) : t('property.notFound') || 'Property';

  // Create payment intent on mount
  useEffect(() => {
    const initPayment = async () => {
      try {
        if (!bookingId) {
          // If no bookingId, we can't create a payment intent via the API
          // Show an informational state or redirect
          setError(t('payment.noBookingId') || 'No booking found. Please start from the booking page.');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        setClientSecret(data.clientSecret);
        setPaymentReady(true);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initPayment();
  }, [bookingId, t]);

  // Format date for display
  const formatDateRange = () => {
    if (!checkIn || !checkOut) return t('booking.selectDates') || 'Select dates';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return `${start.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  };

  // Guest display
  const getGuestDisplayText = () => {
    const parts = [];
    const guestTotal = adults + children;
    parts.push(`${guestTotal} ${guestTotal === 1 ? (t('search.guest') || 'guest') : (t('search.guests') || 'guests')}`);
    if (infants > 0) {
      parts.push(`${infants} ${infants === 1 ? (t('search.infant') || 'infant') : (t('search.infants') || 'infants')}`);
    }
    return parts.join(', ');
  };

  // Apply promo code
  const applyPromoCode = () => {
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoApplied(true);
      setPromoDiscount(Math.round(subtotal * 0.1));
      setPromoError('');
    } else {
      setPromoError(t('payment.invalidPromoCode') || 'Invalid promo code');
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const handlePaymentSuccess = () => {
    const bookingNum = searchParams.get('bookingNumber') || bookingId;
    router.push(`/payment/success?booking=${bookingNum}`);
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // Loading state
  if (isLoading || isPropertyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">{t('payment.settingUp') || 'Setting up payment...'}</p>
        </div>
      </div>
    );
  }

  // Error state (no property)
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{t('property.notFound') || 'Property not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-neutral-800"
          >
            {t('common.goBack') || 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">{t('booking.confirmAndPay') || 'Confirm and pay'}</h1>
            <button 
              onClick={() => router.push('/properties')}
              className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </Container>
      </nav>

      <Container className="py-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left column - Payment form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Security badge */}
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Lock className="w-4 h-4" />
                <span>{t('payment.encryptedNotice') || 'Your payment is encrypted and secure'}</span>
              </div>

              {/* Trip details */}
              <section className="border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">{t('booking.tripDetails') || 'Your trip'}</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium">{t('booking.dates') || 'Dates'}</p>
                        <p className="text-sm text-neutral-600">{formatDateRange()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium">{t('booking.guests') || 'Guests'}</p>
                        <p className="text-sm text-neutral-600">{getGuestDisplayText()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stripe Payment */}
              <section className="border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">{t('payment.paymentMethod') || 'Payment method'}</h2>
                
                {error && !paymentReady && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/booking/${propertyId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${adults + children}`)}
                      className="mt-3 text-sm font-medium text-red-800 underline hover:no-underline"
                    >
                      {t('payment.goToBooking') || 'Go to booking page'}
                    </button>
                  </div>
                )}

                {paymentReady && clientSecret ? (
                  <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                      amount={total}
                      currency="CAD"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                ) : !error && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                  </div>
                )}
              </section>

              {/* Promo code */}
              <section className="border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {t('payment.promoCode') || 'Promo code'}
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('payment.enterPromoCode') || 'Enter promo code'}
                    disabled={promoApplied}
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black disabled:bg-neutral-100"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={promoApplied || !promoCode.trim()}
                    className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {promoApplied ? <Check className="w-5 h-5" /> : (t('payment.apply') || 'Apply')}
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm mt-2">{promoError}</p>
                )}
                {promoApplied && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {t('payment.promoApplied') || 'Promo code applied!'}
                  </p>
                )}
              </section>
            </div>

            {/* Right column - Order summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 border border-neutral-200 rounded-xl p-6 space-y-6">
                {/* Property card */}
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={localizedTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 leading-tight line-clamp-2 text-sm">{localizedTitle}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-black fill-black" />
                      <span className="text-sm font-medium">{property.rating}</span>
                      <span className="text-sm text-neutral-500">({property.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Price details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('booking.priceDetails') || 'Price details'}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        ${pricePerNight.toLocaleString()} {isMonthly ? (t('property.monthlyPrice') || 'CAD/month') : (t('property.perNight') || 'CAD/night')} x {nights} {nights === 1 ? (t('common.night') || 'night') : (t('common.nights') || 'nights')}
                      </span>
                      <span>${subtotal.toLocaleString()} CAD</span>
                    </div>
                    
                    {isMonthly && property?.monthlyDiscount && (
                      <div className="flex justify-between text-rose-600">
                        <span>{t('properties.monthlyDiscount', { percent: property.monthlyDiscount })}</span>
                        <span>-${Math.round(property.price * nights - subtotal).toLocaleString()} CAD</span>
                      </div>
                    )}

                    {promoApplied && promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t('payment.promoDiscount') || 'Promo discount'}</span>
                        <span>-${promoDiscount.toLocaleString()} CAD</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t('booking.taxHST') || 'Taxes (13% HST)'}</span>
                      <span>${taxes.toLocaleString()} CAD</span>
                    </div>
                    
                    <Divider />
                    
                    <div className="flex justify-between font-semibold text-base">
                      <span>{t('booking.total') || 'Total'} (CAD)</span>
                      <span>${total.toLocaleString()} CAD</span>
                    </div>
                  </div>
                </div>

                {/* Payment protection */}
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <Shield className="w-5 h-5 text-neutral-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('payment.protected') || 'Your payment is protected'}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {t('payment.protectedDesc') || 'Your money is held securely until 24 hours after check-in.'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 text-center">
                  {t('payment.youWontBeChargedYet') || "You won't be charged until the host accepts your request."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
