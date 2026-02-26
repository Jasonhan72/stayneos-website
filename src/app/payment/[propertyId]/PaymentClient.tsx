'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, 
  X, 
  Star, 
  Shield, 
  CreditCard,
  Wallet,
  Lock,
  Check,
  Tag,
  Calendar,
  Users,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { getPropertyById } from '@/lib/data';
import { getLocalizedTitle } from '@/components/property/PropertyCard';
import { useI18n } from '@/lib/i18n';

interface PaymentClientProps {
  propertyId: string;
}

type PaymentMethod = 'card' | 'paypal' | 'apple_pay' | 'google_pay';
type BookingStep = 'payment' | 'success';

// Card brand detection
const detectCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^(?:2131|1800|35)/.test(cleaned)) return 'jcb';
  return '';
};

// Card brand icons component
const CardBrandIcon = ({ brand }: { brand: string }) => {
  const icons: Record<string, JSX.Element> = {
    visa: (
      <svg viewBox="0 0 48 16" className="h-5">
        <path fill="#1A1F71" d="M17.68 1.5l-4.2 9.9h-2.9l2-9.9h5.1zm13.5 6.6c0-2.6-3.6-2.7-3.6-3.9 0-.4.3-.8 1.1-.9.4-.1 1.5-.1 2.7.6l.5-2.2c-.7-.3-1.5-.5-2.5-.5-2.6 0-4.5 1.4-4.5 3.3 0 1.4 1 2.2 1.8 2.7.8.5 1.1.8 1.1 1.3 0 .7-.7 1-1.3 1-.9 0-1.8-.3-2.3-.5l-.5 2.3c.6.3 1.7.5 2.8.5 2.8 0 4.7-1.3 4.7-3.7z"/>
        <path fill="#1A1F71" d="M36.8 1.5h-2.5c-.8 0-1.4.2-1.7 1l-4.9 8.9h3l.7-1.9h3.5l.4 1.9h2.6l-2.1-9.9zm-3.2 5.3l1-2.7.6 2.7h-1.6z"/>
        <path fill="#1A1F71" d="M30.5 1.5l-2.8 9.9h-2.7l2.8-9.9h2.7z"/>
        <path fill="#1A1F71" d="M12.5 1.5l-4.2 9.9h-2.9l2-9.9h5.1z"/>
      </svg>
    ),
    mastercard: (
      <svg viewBox="0 0 24 16" className="h-5">
        <circle cx="8" cy="8" r="6" fill="#EB001B"/>
        <circle cx="16" cy="8" r="6" fill="#F79E1B"/>
        <path fill="#FF5F00" d="M12 3.5c1.6 1.2 2.5 3 2.5 4.5s-1 3.3-2.5 4.5c-1.6-1.2-2.5-3-2.5-4.5s1-3.3 2.5-4.5z"/>
      </svg>
    ),
    amex: (
      <svg viewBox="0 0 48 16" className="h-5">
        <rect width="48" height="16" rx="2" fill="#006FCF"/>
        <text x="4" y="11" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
      </svg>
    ),
    discover: (
      <svg viewBox="0 0 48 16" className="h-5">
        <rect width="48" height="16" rx="2" fill="#FF6000"/>
        <text x="4" y="11" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">DISCOVER</text>
      </svg>
    ),
  };
  return icons[brand] || null;
};

export default function PaymentClient({ propertyId }: PaymentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const property = getPropertyById(propertyId);
  const { t, locale } = useI18n();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState('');
  const [currentStep, setCurrentStep] = useState<BookingStep>('payment');
  
  // Payment options
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  
  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState('');

  // Get booking details from URL
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');
  const infants = parseInt(searchParams.get('infants') || '0');

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

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSuccess = () => {
    const confirmationNum = 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setBookingConfirmation(confirmationNum);
    setCurrentStep('success');
  };

  const localizedTitle = property ? getLocalizedTitle(property, locale) : t('property.notFound') || 'Property';

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

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // Format expiry
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Validate card
  const validateCard = () => {
    const errors: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, '').length < 13) {
      errors.cardNumber = t('payment.invalidCardNumber') || 'Invalid card number';
    }
    if (cardExpiry.length < 5) {
      errors.cardExpiry = t('payment.invalidExpiry') || 'Invalid expiry date';
    }
    if (cardCvv.length < 3) {
      errors.cardCvv = t('payment.invalidCvc') || 'Invalid CVV';
    }
    if (cardHolder.trim().length < 2) {
      errors.cardHolder = t('payment.invalidCardholder') || 'Invalid cardholder name';
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Apply promo code
  const applyPromoCode = () => {
    if (!promoCode.trim()) return;
    // Simulate promo code validation
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

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (selectedPaymentMethod === 'card' && !validateCard()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    handleSuccess();
    setIsSubmitting(false);
  };

  // Payment method options
  const paymentMethods = [
    { 
      id: 'card' as PaymentMethod, 
      name: t('payment.creditCard') || 'Credit or debit card', 
      icon: <CreditCard className="w-5 h-5" />,
      description: t('payment.cardDescription') || 'Visa, Mastercard, Amex, Discover'
    },
    { 
      id: 'paypal' as PaymentMethod, 
      name: 'PayPal', 
      icon: <Wallet className="w-5 h-5" /> 
    },
    { 
      id: 'apple_pay' as PaymentMethod, 
      name: 'Apple Pay', 
      icon: <Wallet className="w-5 h-5" /> 
    },
    { 
      id: 'google_pay' as PaymentMethod, 
      name: 'Google Pay', 
      icon: <Wallet className="w-5 h-5" /> 
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">{t('payment.settingUp') || 'Setting up payment...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || t('property.notFound') || 'Property not found'}</p>
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

  // Success page
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {t('payment.success.title') || 'Payment Successful!'}
          </h1>
          
          <p className="text-neutral-600 mb-6">
            {t('payment.success.description') || 'Your booking has been confirmed'}
          </p>

          <div className="bg-neutral-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-neutral-500 mb-1">{t('payment.success.bookingNumber') || 'Confirmation Number'}</p>
            <p className="text-xl font-bold text-neutral-900">{bookingConfirmation}</p>
          </div>

          {/* Property summary */}
          <div className="flex gap-4 mb-6 p-4 border border-neutral-200 rounded-xl text-left">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={property.images[0]}
                alt={localizedTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-neutral-900 leading-tight line-clamp-2">{localizedTitle}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-600">{formatDateRange()}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-600 truncate">{property.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors"
            >
              {t('payment.success.viewBookings') || 'View My Bookings'}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 bg-white border border-neutral-300 text-neutral-900 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
            >
              {t('payment.success.backHome') || 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cardBrand = detectCardBrand(cardNumber);

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
              <section className="border border-neutral-200 rounded-xl p-6">
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

              {/* Payment method selection */}
              <section className="border border-neutral-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">{t('payment.paymentMethod') || 'Payment method'}</h2>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id}>
                      <button
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-all ${
                          selectedPaymentMethod === method.id 
                            ? 'border-black bg-neutral-50' 
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <div className={`${selectedPaymentMethod === method.id ? 'text-black' : 'text-neutral-600'}`}>
                          {method.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{method.name}</p>
                          {method.description && (
                            <p className="text-sm text-neutral-500">{method.description}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPaymentMethod === method.id ? 'border-black' : 'border-neutral-300'
                        }`}>
                          {selectedPaymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                      </button>

                      {/* Payment method details */}
                      {selectedPaymentMethod === method.id && method.id === 'card' && (
                        <div className="mt-4 p-4 bg-neutral-50 rounded-xl space-y-4">
                          {/* Card number */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                              {t('payment.cardNumber') || 'Card number'}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                                  cardErrors.cardNumber ? 'border-red-500' : 'border-neutral-300'
                                }`}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {cardBrand && <CardBrandIcon brand={cardBrand} />}
                              </div>
                            </div>
                            {cardErrors.cardNumber && (
                              <p className="text-red-500 text-sm mt-1">{cardErrors.cardNumber}</p>
                            )}
                          </div>

                          {/* Expiry and CVV */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                {t('payment.expiration') || 'Expiration (MM/YY)'}
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                placeholder="MM/YY"
                                maxLength={5}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                                  cardErrors.cardExpiry ? 'border-red-500' : 'border-neutral-300'
                                }`}
                              />
                              {cardErrors.cardExpiry && (
                                <p className="text-red-500 text-sm mt-1">{cardErrors.cardExpiry}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                {t('payment.cvv') || 'CVV'}
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  placeholder="123"
                                  maxLength={4}
                                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                                    cardErrors.cardCvv ? 'border-red-500' : 'border-neutral-300'
                                  }`}
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                              </div>
                              {cardErrors.cardCvv && (
                                <p className="text-red-500 text-sm mt-1">{cardErrors.cardCvv}</p>
                              )}
                            </div>
                          </div>

                          {/* Card holder */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                              {t('payment.cardHolder') || 'Cardholder name'}
                            </label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder={t('payment.cardHolderPlaceholder') || 'Name on card'}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                                cardErrors.cardHolder ? 'border-red-500' : 'border-neutral-300'
                              }`}
                            />
                            {cardErrors.cardHolder && (
                              <p className="text-red-500 text-sm mt-1">{cardErrors.cardHolder}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedPaymentMethod === method.id && method.id === 'paypal' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm text-blue-800">
                            {t('payment.paypalRedirect') || 'You will be redirected to PayPal to complete your payment securely.'}
                          </p>
                        </div>
                      )}

                      {selectedPaymentMethod === method.id && method.id === 'apple_pay' && (
                        <div className="mt-4">
                          <button className="w-full py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                              <path d="M17.72 9.73c-.04-1.54.63-2.71 1.98-3.58-.75-1.08-1.88-1.67-3.36-1.78-.56-.05-1.19.35-1.79.35-.63 0-1.29-.35-1.93-.35-1.49.07-2.96.89-3.74 2.24-1.6 2.77-.42 6.86 1.12 9.11.75 1.08 1.63 2.29 2.79 2.25.55-.02.76-.35 1.43-.35.68 0 .86.35 1.43.34 1.19-.02 1.95-1.08 2.69-2.16.85-1.22 1.19-2.41 1.21-2.47-.03-.01-2.32-.89-2.34-3.52-.02-1.62 1.82-2.53 1.91-2.58zM15.11 4.29c.63-.77 1.05-1.83.93-2.89-.9.04-1.99.6-2.63 1.36-.58.67-1.08 1.75-.95 2.79 1.01.08 2.03-.51 2.65-1.26z"/>
                            </svg>
                            {t('payment.payWithApplePay') || 'Pay with Apple Pay'}
                          </button>
                        </div>
                      )}

                      {selectedPaymentMethod === method.id && method.id === 'google_pay' && (
                        <div className="mt-4">
                          <button className="w-full py-3 bg-white border border-neutral-300 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {t('payment.payWithGooglePay') || 'Pay with Google Pay'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Promo code */}
              <section className="border border-neutral-200 rounded-xl p-6">
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

                {/* Confirm button */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('payment.processing') || 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {t('payment.confirmAndPay') || 'Confirm and pay'}
                    </>
                  )}
                </button>

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
