'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Container, Card, Badge, Divider, Modal } from '@/components/ui';
import { useAuth } from '@/lib/context/UserContext';
import { useI18n } from '@/lib/i18n';
import { 
  Calendar,
  CreditCard,
  Download,
  MessageSquare,
  Check,
  Clock,
  X,
  Printer,
  Star,
  Loader2,
  Home,
  LucideIcon
} from 'lucide-react';

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
    images?: Array<{ url: string; alt?: string | null }>;
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
type BookingModal = 'details' | 'contact' | 'voucher' | null;

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingModal, setBookingModal] = useState<BookingModal>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hostMessage, setHostMessage] = useState('');
  const [isSendingHostMessage, setIsSendingHostMessage] = useState(false);
  const [hostMessageStatus, setHostMessageStatus] = useState<'idle' | 'sent' | 'error'>('idle');

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

  const openBookingModal = (booking: Booking, modal: Exclude<BookingModal, null>) => {
    setSelectedBooking(booking);
    setBookingModal(modal);
    if (modal === 'contact') {
      setHostMessageStatus('idle');
      setHostMessage(
        `Hi, I have a question about booking ${booking.bookingNumber} for ${booking.propertyTitle} (${formatBookingDate(booking.checkIn)} - ${formatBookingDate(booking.checkOut)}).`
      );
    }
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setBookingModal(null);
    setHostMessageStatus('idle');
    setIsSendingHostMessage(false);
  };

  const escapeVoucherText = (value: string | number | null | undefined) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));

  const buildVoucherHtml = (booking: Booking) => {
    const propertyTitle = escapeVoucherText(booking.propertyTitle);
    const bookingNumber = escapeVoucherText(booking.bookingNumber);
    const statusLabel = escapeVoucherText(statusConfig[booking.status]?.label || booking.status);
    const guestName = escapeVoucherText(booking.guestName || 'Guest');
    const paymentStatus = escapeVoucherText(booking.paymentStatus);
    const currency = escapeVoucherText(booking.currency);
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>NEOS booking voucher ${bookingNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #171717; margin: 40px; }
    .voucher { max-width: 760px; border: 1px solid #e5e5e5; border-radius: 24px; padding: 32px; }
    .brand { font-size: 13px; letter-spacing: .18em; text-transform: uppercase; color: #737373; }
    h1 { margin: 8px 0 24px; font-size: 30px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .box { border: 1px solid #eee; border-radius: 16px; padding: 16px; }
    .label { font-size: 12px; color: #737373; margin-bottom: 6px; }
    .value { font-weight: 700; font-size: 16px; }
    .total { margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: end; }
    .price { font-size: 28px; font-weight: 800; }
    .footer { margin-top: 28px; color: #737373; font-size: 13px; }
  </style>
</head>
<body>
  <section class="voucher">
    <div class="brand">NEOS Booking Voucher</div>
    <h1>${propertyTitle}</h1>
    <div class="grid">
      <div class="box"><div class="label">Booking number</div><div class="value">${bookingNumber}</div></div>
      <div class="box"><div class="label">Status</div><div class="value">${statusLabel}</div></div>
      <div class="box"><div class="label">Check-in</div><div class="value">${formatBookingDate(booking.checkIn)}</div></div>
      <div class="box"><div class="label">Check-out</div><div class="value">${formatBookingDate(booking.checkOut)}</div></div>
      <div class="box"><div class="label">Guest</div><div class="value">${guestName}</div></div>
      <div class="box"><div class="label">Guests / nights</div><div class="value">${booking.guests} guests · ${booking.nights} nights</div></div>
    </div>
    <div class="total">
      <div><div class="label">Payment</div><div class="value">${paymentStatus}</div></div>
      <div class="price">$${booking.totalPrice.toLocaleString()} ${currency}</div>
    </div>
    <div class="footer">Issued by NEOS. Please keep this voucher for check-in and support.</div>
  </section>
</body>
</html>`;
  };

  const downloadVoucher = (booking: Booking) => {
    const blob = new Blob([buildVoucherHtml(booking)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neos-voucher-${booking.bookingNumber || booking.id}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const printVoucher = (booking: Booking) => {
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) return;
    win.document.write(buildVoucherHtml(booking));
    win.document.close();
    win.focus();
    win.print();
  };

  const sendHostMessage = async () => {
    if (!selectedBooking || !hostMessage.trim()) return;
    setIsSendingHostMessage(true);
    setHostMessageStatus('idle');
    try {
      const conversationRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedBooking.id, type: 'host_guest' }),
      });
      if (!conversationRes.ok) throw new Error('Unable to create conversation');
      const conversationPayload = await conversationRes.json() as { conversation?: { id?: string } };
      const conversationId = conversationPayload.conversation?.id;
      if (!conversationId) throw new Error('Missing conversation id');

      const messageRes = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: hostMessage.trim() }),
      });
      if (!messageRes.ok) throw new Error('Unable to send message');
      setHostMessageStatus('sent');
    } catch {
      setHostMessageStatus('error');
    } finally {
      setIsSendingHostMessage(false);
    }
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
      </main>
    );
  }

  const hasCancelled = bookings.some(b => b.status === 'CANCELLED');

  return (
    <main id="main-content" className="min-h-screen bg-white pt-28 pb-16">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2">
          <p className="text-sm font-medium text-neutral-500">Trips</p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">{t('bookings.title')}</h1>
          <p className="text-base text-neutral-500">{t('bookings.manageBookings')}</p>
        </div>

        {/* Airnbnb-style Tabs: underline indicator, no pill */}
        <div className="flex gap-8 mb-8 border-b border-neutral-200">
          {([] as { id: TabType; label: string }[]).concat(
            { id: 'upcoming' as TabType, label: t('bookings.upcoming', 'Upcoming') },
            ...(hasCancelled ? [{ id: 'cancelled' as TabType, label: t('status.cancelled', 'Cancelled') }] : []),
            { id: 'completed' as TabType, label: t('bookings.completed', 'Past') },
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 text-sm transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-neutral-900 font-medium' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
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
              <Card key={booking.id} className="overflow-hidden rounded-3xl border-neutral-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
                    <div className="relative h-56 md:h-full min-h-48 overflow-hidden rounded-2xl bg-neutral-100">
                      {booking.property?.images?.[0]?.url ? (
                        <Image
                          src={booking.property.images[0].url}
                          alt={booking.property.images[0].alt || booking.propertyTitle}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 220px"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Home className="text-neutral-300" size={44} />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                      <div className={`absolute left-3 top-3 rounded-full ${statusConfig[booking.status]?.bgColor || 'bg-white/90'} shadow-sm`}>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>

                    <div className="min-w-0 py-1 md:py-2">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="min-w-0 max-w-xl">
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 mb-2 break-all">
                            {booking.bookingNumber}
                          </p>
                          <h3 className="text-2xl lg:text-3xl font-semibold leading-tight text-neutral-950 break-words">
                            {booking.propertyTitle}
                          </h3>
                        </div>

                        <div className="shrink-0 lg:text-right">
                          <p className="text-sm text-neutral-500">{t('bookings.totalPrice')}</p>
                          <p className="text-3xl font-semibold text-neutral-950 whitespace-nowrap">
                            ${booking.totalPrice.toLocaleString()} {booking.currency}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <div className="px-4 py-3">
                          <p className="text-xs font-medium text-neutral-500 whitespace-nowrap">{t('bookings.checkIn')}</p>
                          <p className="mt-1 font-semibold text-neutral-950 whitespace-nowrap">{formatBookingDate(booking.checkIn)}</p>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-xs font-medium text-neutral-500 whitespace-nowrap">{t('bookings.checkOut')}</p>
                          <p className="mt-1 font-semibold text-neutral-950 whitespace-nowrap">{formatBookingDate(booking.checkOut)}</p>
                        </div>
                        <div className="px-4 py-3 border-t lg:border-t-0 border-neutral-200">
                          <p className="text-xs font-medium text-neutral-500 whitespace-nowrap">{t('bookings.nights')}</p>
                          <p className="mt-1 font-semibold text-neutral-950 whitespace-nowrap">{booking.nights} {t('booking.nights')}</p>
                        </div>
                        <div className="px-4 py-3 border-t lg:border-t-0 border-neutral-200">
                          <p className="text-xs font-medium text-neutral-500 whitespace-nowrap">{t('bookings.guests')}</p>
                          <p className="mt-1 font-semibold text-neutral-950 whitespace-nowrap">{booking.guests} {t('booking.guests')}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <CreditCard size={16} className="text-neutral-400" />
                            <span>{booking.paymentStatus === 'COMPLETED' ? t('bookings.paid') : t('bookings.unpaid')}</span>
                          </div>
                          <span className="hidden sm:inline text-neutral-300">•</span>
                          <div>{t('bookings.bookingDate')}: {booking.createdAt ? formatBookingDate(booking.createdAt) : '-'}</div>
                        </div>

                        <div className="flex flex-wrap lg:justify-end gap-3">
                          <Button
                            size="sm"
                            className="rounded-full bg-neutral-950 px-5 text-white hover:bg-neutral-800 whitespace-nowrap"
                            onClick={() => openBookingModal(booking, 'details')}
                          >
                            {t('bookings.viewDetails')}
                          </Button>

                          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <>
                              <Button variant="outline" size="sm" className="rounded-full px-4 whitespace-nowrap" onClick={() => openBookingModal(booking, 'contact')}>
                                <MessageSquare size={14} className="mr-1" />
                                {t('bookings.contactHost')}
                              </Button>
                              <Button variant="ghost" size="sm" className="rounded-full px-3 whitespace-nowrap" onClick={() => openBookingModal(booking, 'voucher')}>
                                <Download size={14} className="mr-1" />
                                {t('bookings.downloadVoucher')}
                              </Button>
                            </>
                          )}

                          {booking.status === 'CHECKED_OUT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full px-4 whitespace-nowrap"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowReviewModal(true);
                              }}
                            >
                              <Star size={14} className="mr-1" />
                              {t('bookings.writeReview')}
                            </Button>
                          )}
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
        isOpen={!!selectedBooking && bookingModal === 'details' && !showReviewModal}
        onClose={closeBookingModal}
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
              <Button variant="outline" onClick={closeBookingModal}>
                {t('bookings.close')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => printVoucher(selectedBooking)}>
                  <Printer size={16} className="mr-1" />
                  {t('bookings.print')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadVoucher(selectedBooking)}>
                  <Download size={16} className="mr-1" />
                  {t('bookings.download')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Contact Host Modal */}
      <Modal
        isOpen={!!selectedBooking && bookingModal === 'contact'}
        onClose={closeBookingModal}
        title={t('bookings.contactHost')}
      >
        {selectedBooking && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500">{selectedBooking.bookingNumber}</p>
              <p className="font-semibold text-neutral-950">{selectedBooking.propertyTitle}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {formatBookingDate(selectedBooking.checkIn)} - {formatBookingDate(selectedBooking.checkOut)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">Message to host</label>
              <textarea
                value={hostMessage}
                onChange={(event) => setHostMessage(event.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
              />
            </div>

            {hostMessageStatus === 'sent' && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Message sent. You can continue the conversation in Messages.</div>
            )}
            {hostMessageStatus === 'error' && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Could not send this message. Please try again or open Messages.</div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Link href="/dashboard/messages" className="inline-flex justify-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:border-neutral-900">
                Open Messages
              </Link>
              <Button
                onClick={sendHostMessage}
                disabled={isSendingHostMessage || !hostMessage.trim()}
                className="rounded-full px-5"
              >
                {isSendingHostMessage ? 'Sending...' : 'Send message'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Voucher Modal */}
      <Modal
        isOpen={!!selectedBooking && bookingModal === 'voucher'}
        onClose={closeBookingModal}
        title={t('bookings.downloadVoucher')}
      >
        {selectedBooking && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-neutral-200 p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">NEOS Booking Voucher</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-950">{selectedBooking.propertyTitle}</h3>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-neutral-50 p-3"><p className="text-neutral-500">Booking</p><p className="font-semibold">{selectedBooking.bookingNumber}</p></div>
                <div className="rounded-xl bg-neutral-50 p-3"><p className="text-neutral-500">Status</p><p className="font-semibold">{statusConfig[selectedBooking.status]?.label || selectedBooking.status}</p></div>
                <div className="rounded-xl bg-neutral-50 p-3"><p className="text-neutral-500">Check-in</p><p className="font-semibold">{formatBookingDate(selectedBooking.checkIn)}</p></div>
                <div className="rounded-xl bg-neutral-50 p-3"><p className="text-neutral-500">Check-out</p><p className="font-semibold">{formatBookingDate(selectedBooking.checkOut)}</p></div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-neutral-200 pt-4">
                <div><p className="text-sm text-neutral-500">Guest</p><p className="font-semibold">{selectedBooking.guestName || 'Guest'}</p></div>
                <p className="text-2xl font-bold">${selectedBooking.totalPrice.toLocaleString()} {selectedBooking.currency}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button variant="outline" className="rounded-full px-5" onClick={() => printVoucher(selectedBooking)}>
                <Printer size={16} className="mr-2" />
                {t('bookings.print')}
              </Button>
              <Button className="rounded-full px-5" onClick={() => downloadVoucher(selectedBooking)}>
                <Download size={16} className="mr-2" />
                {t('bookings.download')}
              </Button>
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

    </main>
  );
}
