'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { CheckCircle, Calendar, Mail, ArrowRight, Loader2, MessageCircle, Home, Users } from 'lucide-react';

type BookingDetail = {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
  status: string;
  property?: {
    title?: string;
    images?: Array<{ url: string; alt?: string | null }>;
  } | null;
};

function PaymentSuccessContent() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get('booking');
  const bookingId = searchParams.get('id');
  const itineraryHref = bookingId ? `/dashboard/bookings/${encodeURIComponent(bookingId)}` : '/dashboard/bookings';

  const [countdown, setCountdown] = useState(10);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isTripLoading, setIsTripLoading] = useState(Boolean(bookingId));

  useEffect(() => {
    if (!bookingId) {
      setIsTripLoading(false);
      return;
    }

    let isMounted = true;

    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId as string)}`);
        if (!response.ok) throw new Error('Failed to load booking details');

        const payload = await response.json() as { data?: { booking?: BookingDetail } };
        if (isMounted) setBooking(payload.data?.booking ?? null);
      } catch {
        if (isMounted) setBooking(null);
      } finally {
        if (isMounted) setIsTripLoading(false);
      }
    }

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((seconds) => seconds - 1), 1000);
      return () => clearTimeout(timer);
    }

    router.push(itineraryHref);
  }, [countdown, itineraryHref, router]);

  const localeCode = locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US';

  const tripDates = useMemo(() => {
    if (!booking?.checkIn || !booking?.checkOut) return null;

    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

    return `${start.toLocaleDateString(localeCode, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(localeCode, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [booking?.checkIn, booking?.checkOut, localeCode]);

  const totalPrice = useMemo(() => {
    if (!booking) return null;

    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: booking.currency || 'CAD',
      maximumFractionDigits: 0,
    }).format(booking.totalPrice || 0);
  }, [booking, localeCode]);

  const statusKey = booking?.status?.toLowerCase() ?? 'confirmed';
  const statusLabel = booking?.status
    ? t(`payment.success.status.${statusKey}`, booking.status.replace(/_/g, ' ').toLowerCase())
    : t('payment.success.status.confirmed');
  const coverImage = booking?.property?.images?.[0];

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('payment.success.title')}
        </h1>

        <p className="text-gray-600 mb-6">
          {t('payment.success.description')}
        </p>

        {bookingNumber && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">{t('payment.success.bookingNumber')}</p>
            <p className="text-xl font-bold text-gray-900">{bookingNumber}</p>
          </div>
        )}

        {isTripLoading ? (
          <div className="border border-gray-200 rounded-2xl p-5 mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin" size={18} />
            {t('payment.success.loadingTrip')}
          </div>
        ) : booking ? (
          <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6 text-left">
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-44 sm:h-auto sm:w-44 bg-gray-100 shrink-0">
                {coverImage?.url ? (
                  <Image
                    src={coverImage.url}
                    alt={coverImage.alt || booking.property?.title || t('payment.success.tripImageAlt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 176px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <Home size={28} />
                  </div>
                )}
              </div>

              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">
                      {t('payment.success.tripBooked')}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {booking.property?.title || t('payment.success.yourStay')}
                    </h2>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 whitespace-nowrap">
                    {statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {tripDates && (
                    <div>
                      <p className="text-gray-500">{t('payment.success.dates')}</p>
                      <p className="font-medium text-gray-900">{tripDates}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">{t('payment.success.guests')}</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Users size={15} />
                      {t('payment.success.guestCount', { count: booking.guests || 1 })}
                    </p>
                  </div>
                  {totalPrice && (
                    <div>
                      <p className="text-gray-500">{t('payment.success.total')}</p>
                      <p className="font-medium text-gray-900">{totalPrice}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={18} className="text-amber-500" />
            <span>{t('payment.success.emailSent')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar size={18} className="text-amber-500" />
            <span>{t('payment.success.manageBooking')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href={itineraryHref} className="sm:col-span-3">
            <Button size="lg" className="w-full">
              {t('payment.success.viewItinerary')}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>

          <Link href="/dashboard/messages" className="sm:col-span-2">
            <Button variant="outline" className="w-full">
              <MessageCircle size={18} className="mr-2" />
              {t('payment.success.messageHost')}
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              {t('payment.success.backHome')}
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          {countdown > 0 ? t('payment.success.redirecting', { seconds: countdown }) : t('payment.success.redirectingNow')}
        </p>
      </div>
    </main>
  );
}

export default function SuccessClient() {
  const { t } = useI18n();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span>{t('payment.success.loading')}</span>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
