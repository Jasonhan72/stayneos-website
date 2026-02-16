'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight,
  X, 
  Star, 
  Shield, 
  CreditCard,
  Building2,
  Wallet,
  Check
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { getPropertyById } from '@/lib/data';
import { getLocalizedTitle } from '@/components/property/PropertyCard';
import { useI18n } from '@/lib/i18n';
import StripePaymentForm from '@/components/payment/StripePaymentForm';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripePromise = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
};

interface PaymentClientProps {
  propertyId: string;
}

type PaymentMethod = 'card' | 'bank' | 'paypal' | 'apple_pay' | 'google_pay';
type PaymentTiming = 'now' | 'later';

export default function PaymentClient({ propertyId }: PaymentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const property = getPropertyById(propertyId);
  const { t, locale } = useI18n();
  
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment options
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>('now');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  // Get booking details from URL
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const amount = parseInt(searchParams.get('amount') || '0');
  const guestName = searchParams.get('guestName') || '';
  const guestEmail = searchParams.get('guestEmail') || '';
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');
  const infants = parseInt(searchParams.get('infants') || '0');
  const pets = parseInt(searchParams.get('pets') || '0');

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
  const taxes = nights > 0 ? Math.round(subtotal * 0.13) : 0;
  const total = subtotal + taxes;

  useEffect(() => {
    if (!amount || amount <= 0) {
      setError(t('payment.invalidAmount') || 'Invalid payment amount');
      setIsLoading(false);
      return;
    }

    // Create payment intent
    fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'cad',
        metadata: {
          propertyId,
          propertyTitle: property ? getLocalizedTitle(property, locale) : '',
          checkIn,
          checkOut,
          guestName,
          guestEmail,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError(t('payment.failedToInitialize') || 'Failed to initialize payment');
        setIsLoading(false);
      });
  }, [amount, propertyId, checkIn, checkOut, guestName, guestEmail, property, locale, t]);

  const handleSuccess = () => {
    router.push(`/payment/success?propertyId=${propertyId}`);
  };

  const handleError = (err: string) => {
    setError(err);
  };

  const localizedTitle = property ? getLocalizedTitle(property, locale) : t('property.notFound') || 'Property';

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

  // Payment method options
  const paymentMethods: { id: PaymentMethod; name: string; icon: React.ReactNode; description?: string }[] = [
    { 
      id: 'card', 
      name: t('payment.creditCard') || 'Credit or debit card', 
      icon: <CreditCard className="w-5 h-5" />,
      description: t('payment.cardDescription') || 'Visa, Mastercard, Amex, Discover'
    },
    { 
      id: 'bank', 
      name: t('payment.bankTransfer') || 'Bank transfer', 
      icon: <Building2 className="w-5 h-5" />,
      description: t('payment.bankDescription') || 'Direct debit from your bank account'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: <Wallet className="w-5 h-5" /> 
    },
    { 
      id: 'apple_pay', 
      name: 'Apple Pay', 
      icon: <Wallet className="w-5 h-5" /> 
    },
    { 
      id: 'google_pay', 
      name: 'Google Pay', 
      icon: <Wallet className="w-5 h-5" /> 
    },
  ];

  const selectedPayment = paymentMethods.find(m => m.id === selectedPaymentMethod);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">{t('payment.settingUp') || 'Setting up payment...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 mb-4">{error || t('payment.unableToInitialize') || 'Unable to initialize payment'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            {t('common.goBack') || 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#000000',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        borderRadius: '12px',
      },
    },
  };

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-neutral-100 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold">{t('booking.confirmAndPay') || 'Confirm and pay'}</h1>
            <button 
              onClick={() => router.push('/properties')}
              className="p-2 -mr-2 hover:bg-neutral-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </Container>
      </nav>

      <Container className="py-6">
        <div className="max-w-xl mx-auto">
          {/* Property Card */}
          <div className="flex gap-4 mb-6 p-4 border border-neutral-200 rounded-xl">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              {property && (
                <Image
                  src={property.images[0]}
                  alt={localizedTitle}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-neutral-900 leading-tight line-clamp-2">{localizedTitle}</h2>
              {property && (
                <>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Star size={14} className="text-black fill-black" />
                    <span className="text-sm font-medium">{property.rating}</span>
                    <span className="text-sm text-neutral-500">({property.reviewCount} {t('properties.reviews') || 'reviews'})</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1 truncate">{property.location}</p>
                </>
              )}
            </div>
          </div>

          {/* Trip Details Summary */}
          <div className="space-y-0 mb-6">
            {/* Dates */}
            <div className="flex items-center justify-between py-4 border-t border-neutral-200">
              <div>
                <h3 className="font-medium">{t('booking.dates') || 'Dates'}</h3>
                <p className="text-neutral-600 mt-0.5">{formatDateRange()}</p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-center justify-between py-4 border-t border-b border-neutral-200">
              <div>
                <h3 className="font-medium">{t('booking.guests') || 'Guests'}</h3>
                <p className="text-neutral-600 mt-0.5">{getGuestDisplayText()}</p>
              </div>
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

          {/* When You'll Pay */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <h3 className="font-medium mb-4">{t('payment.whenYoullPay') || "When you'll pay"}</h3>
            
            <div className="space-y-3">
              {/* Pay Now Option */}
              <label className="flex items-start gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-neutral-400 transition-colors">
                <input
                  type="radio"
                  name="paymentTiming"
                  value="now"
                  checked={paymentTiming === 'now'}
                  onChange={() => setPaymentTiming('now')}
                  className="mt-1 w-4 h-4 text-black focus:ring-black"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t('payment.payNow') || 'Pay now'}</span>
                    <span className="font-semibold">${total.toLocaleString()} CAD</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    {t('payment.payNowDesc') || 'Your reservation will be confirmed immediately'}
                  </p>
                </div>
              </label>

              {/* Pay Later Option - Only for monthly stays */}
              {isMonthly && (
                <label className="flex items-start gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-neutral-400 transition-colors">
                  <input
                    type="radio"
                    name="paymentTiming"
                    value="later"
                    checked={paymentTiming === 'later'}
                    onChange={() => setPaymentTiming('later')}
                    className="mt-1 w-4 h-4 text-black focus:ring-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t('payment.payLater') || 'Pay in installments'}</span>
                      <span className="font-semibold">${Math.round(total / 2).toLocaleString()} CAD {t('payment.today') || 'today'}</span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      {t('payment.payLaterDesc') || 'Split your payment into 2 installments'}
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{t('payment.paymentMethod') || 'Payment method'}</h3>
            </div>
            
            {/* Selected Payment Method Display */}
            <button
              onClick={() => setShowPaymentMethods(true)}
              className="w-full flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-neutral-600">{selectedPayment?.icon}</div>
                <div className="text-left">
                  <p className="font-medium">{selectedPayment?.name}</p>
                  {selectedPayment?.description && (
                    <p className="text-sm text-neutral-500">{selectedPayment.description}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={20} className="text-neutral-400" />
            </button>
          </div>

          {/* Price Details */}
          <div className="py-4 border-b border-neutral-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{t('booking.priceDetails') || 'Price details'}</h3>
              <button 
                onClick={() => setShowPriceDetails(!showPriceDetails)}
                className="text-sm font-medium underline"
              >
                {showPriceDetails ? (t('common.hide') || 'Hide') : (t('common.show') || 'Show')}
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  ${pricePerNight.toLocaleString()} {isMonthly ? (t('property.monthlyPrice') || 'CAD / month') : (t('property.perNight') || 'CAD / night')} x {nights} {nights === 1 ? (t('common.night') || 'night') : (t('common.nights') || 'nights')}
                </span>
                <span>${subtotal.toLocaleString()} CAD</span>
              </div>
              
              {isMonthly && property?.monthlyDiscount && (
                <div className="flex justify-between text-rose-600">
                  <span>{t('properties.monthlyDiscount', { percent: property.monthlyDiscount })}</span>
                  <span>-${Math.round(property.price * nights - subtotal).toLocaleString()} CAD</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('booking.taxHST') || 'Taxes (13% HST)'}</span>
                <span>${taxes.toLocaleString()} CAD</span>
              </div>
              
              {showPriceDetails && (
                <>
                  <Divider className="my-3" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>{t('booking.total') || 'Total'} <u>CAD</u></span>
                    <span>${total.toLocaleString()} CAD</span>
                  </div>
                  <Link href="#" className="text-sm underline block mt-2">
                    {t('booking.priceBreakdown') || 'Price breakdown'}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className="py-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-neutral-600">
                  {t('payment.securePayment') || 'Your payment information is encrypted and secure.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Payment Method Selector Modal */}
      {showPaymentMethods && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{t('payment.selectPaymentMethod') || 'Select payment method'}</h2>
              <button 
                onClick={() => setShowPaymentMethods(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    setShowPaymentMethods(false);
                  }}
                  className={`w-full flex items-center gap-3 p-4 border rounded-xl transition-colors ${
                    selectedPaymentMethod === method.id 
                      ? 'border-black bg-neutral-50' 
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div className="text-neutral-600">{method.icon}</div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{method.name}</p>
                    {method.description && (
                      <p className="text-sm text-neutral-500">{method.description}</p>
                    )}
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <Check size={20} className="text-black" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Form - Only show for card payments */}
      {selectedPaymentMethod === 'card' && clientSecret && (
        <Container>
          <div className="max-w-xl mx-auto mb-6">
            <Elements stripe={getStripePromise()} options={options}>
              <StripePaymentForm 
                amount={paymentTiming === 'later' ? Math.round(total / 2) : total}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          </div>
        </Container>
      )}

      {/* Other Payment Methods - Placeholder */}
      {selectedPaymentMethod !== 'card' && (
        <Container>
          <div className="max-w-xl mx-auto mb-6">
            <div className="p-4 bg-neutral-50 rounded-xl text-center">
              <p className="text-neutral-600 mb-4">
                {t('payment.comingSoon') || `${selectedPayment?.name} integration coming soon. Please use credit card for now.`}
              </p>
              <button
                onClick={() => setSelectedPaymentMethod('card')}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {t('payment.switchToCard') || 'Switch to Credit Card'}
              </button>
            </div>
          </div>
        </Container>
      )}

      {/* Bottom Payment Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <Container>
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-neutral-500">{t('booking.total') || 'Total'}</p>
                <p className="text-xl font-semibold">${total.toLocaleString()} CAD</p>
              </div>
              <p className="text-xs text-neutral-500 text-right">
                {paymentTiming === 'later' 
                  ? `${t('payment.firstInstallment') || 'First installment'}: $${Math.round(total / 2).toLocaleString()} CAD`
                  : t('payment.chargedNow') || 'Charged now'
                }
              </p>
            </div>
            
            {selectedPaymentMethod === 'card' && clientSecret && (
              <div id="payment-submit-button">
                {/* Stripe will inject the submit button here or we use the one in StripePaymentForm */}
              </div>
            )}
          </div>
        </Container>
      </div>
    </main>
  );
}
