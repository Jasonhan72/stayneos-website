'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Star,
  Calendar,
  Users,
  CreditCard,
  Shield,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { Container } from '@/components/ui';
import { Property, getLocalizedTitle } from '@/components/property/PropertyCard';
import { useI18n } from '@/lib/i18n';

interface RequestToBookProps {
  property: Property;
  checkIn: string;
  checkOut: string;
  adults: number;
  childCount: number;
  infants: number;
  pets: number;
  total: number;
  paymentMethod: string;
  messageToHost: string;
  onBack: () => void;
  onSubmit: () => void;
  isProcessing?: boolean;
}

export function RequestToBook({
  property,
  checkIn,
  checkOut,
  adults,
  childCount,
  infants,
  pets,
  total,
  paymentMethod,
  messageToHost,
  onBack,
  onSubmit,
  isProcessing = false,
}: RequestToBookProps) {
  const { t, locale } = useI18n();
  const [showMessage, setShowMessage] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const localizedTitle = getLocalizedTitle(property, locale);
  
  // Calculate nights
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
  const pricePerNight = Math.round(property.price * discountRate);
  const subtotal = nights * pricePerNight;
  const taxes = nights > 0 ? Math.round(subtotal * 0.13) : 0;

  // Format dates
  const formatDateRange = () => {
    if (!checkIn || !checkOut) return '';
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
      { month: 'long', day: 'numeric', year: 'numeric' }
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

  // Guest display
  const getGuestDisplayText = () => {
    const parts = [];
    const guestTotal = adults + childCount;
    parts.push(`${guestTotal} ${guestTotal === 1 ? (t('search.guest') || 'guest') : (t('search.guests') || 'guests')}`);
    if (infants > 0) {
      parts.push(`${infants} ${infants === 1 ? (t('search.infant') || 'infant') : (t('search.infants') || 'infants')}`);
    }
    if (pets > 0) {
      parts.push(`${pets} ${pets === 1 ? (t('search.pet') || 'pet') : (t('search.pets') || 'pets')}`);
    }
    return parts.join(', ');
  };

  // Payment method display
  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case 'card':
        return t('payment.creditCard') || 'Credit or debit card';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return paymentMethod;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center h-16">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-neutral-100 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold ml-4">
              {t('payment.requestToBook') || 'Request to book'}
            </h1>
          </div>
        </Container>
      </nav>

      <Container className="py-6">
        <div className="max-w-xl mx-auto">
          {/* Property Card */}
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
              <p className="text-sm text-neutral-500 mb-1">
                {t('property.roomIn') || 'Room in'} {property.location.split(',')[0]}
              </p>
              <h2 className="font-medium text-neutral-900 leading-tight line-clamp-2">
                {localizedTitle}
              </h2>
              {property.reviewCount > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star size={14} className="text-black fill-black" />
                  <span className="text-sm font-medium">{property.rating}</span>
                  <span className="text-sm text-neutral-500">({property.reviewCount} {t('properties.reviews') || 'reviews'})</span>
                  <span className="mx-1">·</span>
                  <span className="text-sm font-medium text-rose-600">
                    {t('property.guestFavourite') || 'Guest favourite'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="border-t border-neutral-200">
            {/* Dates */}
            <div className="flex items-center justify-between py-4 border-b border-neutral-200">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">{t('booking.dates') || 'Dates'}</h3>
                  <p className="text-neutral-600 mt-0.5">{formatDateRange()}</p>
                  <p className="text-sm text-rose-600 font-medium mt-1">
                    {t('property.rareFind') || 'Rare find'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onBack}
                className="text-sm font-semibold underline"
              >
                {t('common.change') || 'Change'}
              </button>
            </div>

            {/* Guests */}
            <div className="flex items-center justify-between py-4 border-b border-neutral-200">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">{t('booking.guests') || 'Guests'}</h3>
                  <p className="text-neutral-600 mt-0.5">{getGuestDisplayText()}</p>
                </div>
              </div>
              <button 
                onClick={onBack}
                className="text-sm font-semibold underline"
              >
                {t('common.change') || 'Change'}
              </button>
            </div>
          </div>

          {/* Price Details */}
          <div className="py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{t('booking.totalPrice') || 'Total price'}</h3>
              <span className="font-semibold">${total.toLocaleString()} CAD</span>
            </div>

            <div className={`space-y-2 text-sm ${showPriceDetails ? '' : 'hidden'}`}>
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  ${pricePerNight.toLocaleString()} {t('property.perNight') || 'CAD/mo'} x {nights} {nights === 1 ? (t('common.night') || 'night') : (t('common.nights') || 'nights')}
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
              
              <div className="flex justify-between font-semibold pt-2 border-t border-neutral-200">
                <span>{t('booking.total') || 'Total'} <u>CAD</u></span>
                <span>${total.toLocaleString()} CAD</span>
              </div>
            </div>

            <button 
              onClick={() => setShowPriceDetails(!showPriceDetails)}
              className="text-sm font-medium underline mt-2"
            >
              {showPriceDetails ? (t('common.hide') || 'Hide') : (t('common.show') || 'Show')} {t('booking.priceBreakdown') || 'price breakdown'}
            </button>
          </div>

          {/* Free Cancellation */}
          <div className="py-4 border-b border-neutral-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">{t('checkout.freeCancellation') || 'Free cancellation for 24 hours'}</h3>
                <p className="text-neutral-600 mt-1 text-sm">
                  {t('checkout.freeCancellationDesc', { date: getCancellationDeadline() }) || 
                    `After that, cancel before check-in for a partial refund.`}
                </p>
              </div>
            </div>
          </div>

          {/* When You'll Pay */}
          <div className="py-4 border-b border-neutral-200">
            <h3 className="font-medium mb-2">{t('payment.whenYoullPay') || "When you'll pay"}</h3>
            <p className="text-neutral-600 text-sm">
              {t('payment.chargedUponConfirmation') || 'You will be charged upon host confirmation.'}
            </p>
          </div>

          {/* Payment Method */}
          <div className="py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-neutral-600" />
                <h3 className="font-medium">{t('payment.paymentMethod') || 'Payment method'}</h3>
              </div>
              <button 
                onClick={onBack}
                className="text-sm font-semibold underline"
              >
                {t('common.edit') || 'Edit'}
              </button>
            </div>
            <p className="text-neutral-600 text-sm ml-8">{getPaymentMethodDisplay()}</p>
          </div>

          {/* Message to Host */}
          <div className="py-4 border-b border-neutral-200">
            <button
              onClick={() => setShowMessage(!showMessage)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-neutral-600" />
                <h3 className="font-medium">{t('payment.messageToHost') || 'Message to the host'}</h3>
              </div>
              {showMessage ? (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              )}
            </button>
            
            {showMessage && (
              <div className="mt-3 ml-8 p-4 bg-neutral-50 rounded-xl">
                <p className="text-neutral-700 text-sm whitespace-pre-wrap">{messageToHost}</p>
              </div>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="py-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                agreedToTerms ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300'
              }`}>
                {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="hidden"
              />
              <span className="text-sm text-neutral-600">
                {t('payment.agreement') || 'By selecting the button below, I agree to the'}{' '}
                <Link href="/terms" className="underline">{t('footer.terms') || 'booking terms'}</Link>,{' '}
                <Link href="/cancellation-policy" className="underline">{t('checkout.cancellationPolicy') || 'cancellation policy'}</Link>,{' '}
                {t('common.and') || 'and'}{' '}
                <Link href="/privacy" className="underline">{t('footer.privacy') || 'privacy policy'}</Link>.
              </span>
            </label>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <Container>
          <div className="py-4">
            <button
              onClick={onSubmit}
              disabled={!agreedToTerms || isProcessing}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-300 text-white font-semibold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('payment.processing') || 'Processing...'}
                </>
              ) : (
                t('payment.requestToBook') || 'Request to book'
              )}
            </button>
            
            <p className="text-xs text-neutral-500 text-center mt-3">
              {t('payment.youWontBeChargedYet') || "You won't be charged until the host accepts your request."}
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default RequestToBook;
