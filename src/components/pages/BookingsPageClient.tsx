'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Container, Card, Badge, Divider, Modal } from '@/components/ui';
import { useAuth } from '@/lib/context/UserContext';
import { useI18n } from '@/lib/i18n';
import { 
  Calendar,
  CreditCard,
  Download,
  MessageSquare,
  ChevronRight,
  Check,
  Clock,
  X,
  Printer,
  Star,
  Loader2,
  Home,
  LucideIcon
} from 'lucide-react';
import BackToHomeButton from '@/components/navigation/BackToHomeButton';

interface Booking {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  createdAt: string;
  property?: {
    title?: string;
  } | null;
}

type ApiBooking = Partial<Booking> & {
  booking_number?: string;
  check_in?: string;
  check_out?: string;
  total_price?: number;
  payment_status?: string;
  property_id?: string;
  property_title?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  special_requests?: string;
  created_at?: string;
};

function normalizeBooking(booking: ApiBooking): Booking {
  return {
    id: booking.id || '',
    bookingNumber: booking.bookingNumber || booking.booking_number || '',
    checkIn: booking.checkIn || booking.check_in || '',
    checkOut: booking.checkOut || booking.check_out || '',
    nights: Number(booking.nights || 0),
    guests: Number(booking.guests || 0),
    totalPrice: Number(booking.totalPrice ?? booking.total_price ?? 0),
    currency: booking.currency || 'CAD',
    status: booking.status || 'PENDING',
    paymentStatus: booking.paymentStatus || booking.payment_status || 'PENDING',
    propertyId: booking.propertyId || booking.property_id || '',
    propertyTitle: booking.propertyTitle || booking.property_title || booking.property?.title || 'NEOS Stay',
    guestName: booking.guestName || booking.guest_name || '',
    guestEmail: booking.guestEmail || booking.guest_email || '',
    guestPhone: booking.guestPhone || booking.guest_phone || '',
    specialRequests: booking.specialRequests || booking.special_requests,
    createdAt: booking.createdAt || booking.created_at || '',
    property: booking.property || null,
  };
}

function formatBookingDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '-';
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function getStatusConfig(t: (key: string) => string): Record<string, { label: string; color: string; bgColor: string; icon: LucideIcon }> {
  return {
    PENDING: {
      label: t('status.pending'),
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: Clock,
    },
    CONFIRMED: {
      label: t('status.confirmed'),
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: Check,
    },
    CHECKED_IN: {
      label: t('status.checkedIn'),
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: Check,
    },
    CHECKED_OUT: {
      label: t('status.checkedOut'),
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      icon: Check,
    },
    CANCELLED: {
      label: t('status.cancelled'),
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: X,
    },
  };
}

type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // 获取预订列表
  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/bookings`);
      
      if (!response.ok) {
        throw new Error(t('bookings.fetchFailed', 'Failed to fetch bookings'));
      }
      
      const data = await response.json();
      const rawBookings = (data?.data?.bookings || data?.bookings || []) as ApiBooking[];
      setBookings(rawBookings.map(normalizeBooking));
    } catch (_err) {
      setError(t('bookings.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 筛选预订
  const filteredBookings = bookings.filter((booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    
    switch (activeTab) {
      case 'upcoming':
        return checkIn > today && ['PENDING', 'CONFIRMED'].includes(booking.status);
      case 'completed':
        return (checkOut < today && booking.status !== 'CANCELLED') || booking.status === 'CHECKED_OUT';
      case 'cancelled':
        return booking.status === 'CANCELLED';
      default:
        return true;
    }
  });

  const statusConfig = getStatusConfig(t);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span className={`px-3 py-1 text-white text-sm font-medium flex items-center gap-1 ${config.bgColor.replace('bg-', 'bg-')}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const handleSubmitReview = () => {
    setTimeout(() => {
      setShowReviewModal(false);
      setSelectedBooking(null);
      setReviewRating(5);
      setReviewComment('');
    }, 500);
  };

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <main id="main-content" className="min-h-screen bg-neutral-50 pt-24 pb-12">
        <Container>
          <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
            <Home className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">{t('bookings.title')}</h1>
            <p className="text-neutral-600 mb-6">{t('bookings.pleaseLogin')}</p>
            <Link href="/login">
              <Button>{t('bookings.login')}</Button>
            </Link>
          </div>
        </Container>
        <BackToHomeButton />
      </main>
    );
  }

  const hasCancelled = bookings.some(b => b.status === 'CANCELLED');

  return (
    <main id="main-content" className="min-h-screen bg-white pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{t('bookings.title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('bookings.manageBookings')}</p>
        </div>

        {/* Airnbnb-style Tabs: underline indicator, no pill */}
        <div className="flex gap-0 mb-8 border-b border-neutral-200">
          {([] as { id: TabType; label: string }[]).concat(
            { id: 'upcoming' as TabType, label: t('bookings.upcoming', 'Upcoming') },
            ...(hasCancelled ? [{ id: 'cancelled' as TabType, label: t('status.cancelled', 'Cancelled') }] : []),
            { id: 'completed' as TabType, label: t('bookings.completed', 'Past') },
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-5 py-3 text-sm transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-neutral-900 font-medium' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-neutral-900" />
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin mr-2 text-neutral-400" size={24} />
            <span className="text-neutral-500 text-sm">{t('bookings.loading')}</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={fetchBookings} className="mt-3 text-sm font-medium text-neutral-900 underline underline-offset-4 hover:no-underline">{t('bookings.retry')}</button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">{/* placeholder for empty illustration */}
              <div className="mx-auto w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                <Calendar size={32} className="text-neutral-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">{t('bookings.noBookings', 'No trips yet')}</h2>
            <p className="text-sm text-neutral-500 mb-6">{t('bookings.noBookingsDesc', 'Where have you been, and where are you going?')}</p>
            <Link href="/properties">
              <span className="inline-block rounded-full bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors">{t('nav.properties')}</span>
            </Link>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
                  <div className="relative min-h-56 bg-neutral-100 flex items-center justify-center">
                    <Home className="text-neutral-300" size={52} />
                    <div className={`absolute top-4 left-4 ${statusConfig[booking.status]?.bgColor || 'bg-gray-100'}`}>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6">
                      <div className="min-w-0">
                        <p className="text-sm text-neutral-500 mb-1">
                          {t('bookings.bookingNumber')}: {booking.bookingNumber}
                        </p>
                        <h3 className="text-2xl font-semibold leading-snug text-neutral-900 mb-5 break-words">
                          {booking.propertyTitle}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-5">
                          <div>
                            <p className="text-sm text-neutral-500">{t('bookings.checkIn')}</p>
                            <p className="font-semibold text-neutral-900">{formatBookingDate(booking.checkIn)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">{t('bookings.checkOut')}</p>
                            <p className="font-semibold text-neutral-900">{formatBookingDate(booking.checkOut)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">{t('bookings.nights')}</p>
                            <p className="font-semibold text-neutral-900">{booking.nights} {t('booking.nights')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">{t('bookings.guests')}</p>
                            <p className="font-semibold text-neutral-900">{booking.guests} {t('booking.guests')}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <CreditCard size={16} className="text-neutral-400" />
                            <span>{booking.paymentStatus === 'COMPLETED' ? t('bookings.paid') : t('bookings.unpaid')}</span>
                          </div>
                          <div>
                            {t('bookings.bookingDate')}: {booking.createdAt ? formatBookingDate(booking.createdAt) : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="xl:text-right xl:min-w-56">
                        <p className="text-sm text-neutral-500">{t('bookings.totalPrice')}</p>
                        <p className="text-3xl font-bold text-neutral-900 whitespace-nowrap mb-6">
                          ${booking.totalPrice.toLocaleString()} {booking.currency}
                        </p>

                        <div className="flex flex-wrap xl:justify-end gap-2">
                          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <>
                              <Button variant="outline" size="sm" className="whitespace-nowrap">
                                <MessageSquare size={14} className="mr-1" />
                                {t('bookings.contactHost')}
                              </Button>
                              <Button variant="outline" size="sm" className="whitespace-nowrap">
                                <Download size={14} className="mr-1" />
                                {t('bookings.downloadVoucher')}
                              </Button>
                            </>
                          )}

                          {booking.status === 'CHECKED_OUT' && (
                            <Button
                              size="sm"
                              className="whitespace-nowrap"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowReviewModal(true);
                              }}
                            >
                              <Star size={14} className="mr-1" />
                              {t('bookings.writeReview')}
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            {t('bookings.viewDetails')}
                            <ChevronRight size={14} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking && !showReviewModal}
        onClose={() => setSelectedBooking(null)}
        title={t('bookings.bookingDetails')}
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20">
              <div>
                <p className="text-sm text-neutral-500">{t('bookings.bookingNumber')}</p>
                <p className="text-xl font-bold text-primary">{selectedBooking.bookingNumber}</p>
              </div>
              <Badge variant={selectedBooking.status === 'CONFIRMED' ? 'primary' : 'default'}>
                {statusConfig[selectedBooking.status]?.label || selectedBooking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">{t('bookings.property')}</p>
                <p className="font-medium">{selectedBooking.propertyTitle}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t('booking.guestName')}</p>
                <p className="font-medium">{selectedBooking.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t('bookings.checkIn')}</p>
                <p className="font-medium">{selectedBooking.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t('bookings.checkOut')}</p>
                <p className="font-medium">{selectedBooking.checkOut}</p>
              </div>
            </div>

            <Divider />

            <div>
              <h4 className="font-medium mb-3">{t('bookings.priceBreakdown')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t('bookings.basePrice')}</span>
                  <span>${selectedBooking.totalPrice.toLocaleString()} {selectedBooking.currency}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>{t('booking.total')}</span>
                  <span>${selectedBooking.totalPrice.toLocaleString()} {selectedBooking.currency}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                {t('bookings.close')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer size={16} className="mr-1" />
                  {t('bookings.print')}
                </Button>
                <Button variant="outline" size="sm">
                  <Download size={16} className="mr-1" />
                  {t('bookings.download')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedBooking(null);
        }}
        title={t('bookings.writeReview')}
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            {t('bookings.writeReview')} {selectedBooking?.propertyTitle}
          </p>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('bookings.rating')}</label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewRating(i + 1)}
                  className="p-1"
                >
                  <Star 
                    size={28} 
                    className={i < reviewRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('bookings.writeReview')}</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder={t('bookings.reviewPlaceholder')}
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowReviewModal(false);
                setSelectedBooking(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmitReview}>
              {t('bookings.submitReview')}
            </Button>
          </div>
        </div>
      </Modal>

      <BackToHomeButton />
    </main>
  );
}
