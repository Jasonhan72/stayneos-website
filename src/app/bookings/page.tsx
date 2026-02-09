'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Container, Card, Badge, Divider, Modal } from '@/components/ui';
import { useAuth } from '@/lib/UserContext';
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
  booking_number: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_price: number;
  currency: string;
  status: string;
  payment_status: string;
  property_id: string;
  property_title: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  created_at: string;
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

type TabType = 'all' | 'upcoming' | 'current' | 'completed';

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('all');
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
      const response = await fetch(`/api/bookings/list?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
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
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    
    switch (activeTab) {
      case 'all':
        return booking.status !== 'CANCELLED';
      case 'upcoming':
        return checkIn > today && ['PENDING', 'CONFIRMED'].includes(booking.status);
      case 'current':
        return checkIn <= today && checkOut >= today && booking.status !== 'CANCELLED';
      case 'completed':
        return (checkOut < today && booking.status !== 'CANCELLED') || booking.status === 'CHECKED_OUT';
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
      <main className="min-h-screen bg-neutral-50 pt-24 pb-12">
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

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">{t('bookings.title')}</h1>
          <p className="text-neutral-600 mt-2">{t('bookings.manageBookings')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200">
          {[
            { id: 'all', label: t('bookings.allBookings') },
            { id: 'upcoming', label: t('bookings.upcoming') },
            { id: 'current', label: t('bookings.current') },
            { id: 'completed', label: t('bookings.completed') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-primary' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin mr-2 text-primary" size={24} />
            <span className="text-neutral-600">{t('bookings.loading')}</span>
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchBookings} className="mt-4">{t('bookings.retry')}</Button>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 flex items-center justify-center">
              <Calendar size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">{t('bookings.noBookings')}</h3>
            <p className="text-neutral-600 mb-4">{t('bookings.noBookings')}</p>
            <Link href="/properties">
              <Button>{t('nav.properties')}</Button>
            </Link>
          </Card>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Property Image Placeholder */}
                  <div className="relative w-full lg:w-72 h-48 lg:h-auto flex-shrink-0 bg-neutral-100 flex items-center justify-center">
                    <Home className="text-neutral-300" size={48} />
                    <div className={`absolute top-4 left-4 ${statusConfig[booking.status]?.bgColor || 'bg-gray-100'}`}>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm text-neutral-500">{t('bookings.bookingNumber')}: {booking.booking_number}</p>
                            <h3 className="text-xl font-semibold text-neutral-900">
                              {booking.property_title}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="p-3 bg-neutral-50 border border-neutral-200">
                            <p className="text-xs text-neutral-500">{t('bookings.checkIn')}</p>
                            <p className="font-medium text-neutral-900">{booking.check_in}</p>
                          </div>
                          <div className="p-3 bg-neutral-50 border border-neutral-200">
                            <p className="text-xs text-neutral-500">{t('bookings.checkOut')}</p>
                            <p className="font-medium text-neutral-900">{booking.check_out}</p>
                          </div>
                          <div className="p-3 bg-neutral-50 border border-neutral-200">
                            <p className="text-xs text-neutral-500">{t('bookings.nights')}</p>
                            <p className="font-medium text-neutral-900">{booking.nights} {t('booking.nights')}</p>
                          </div>
                          <div className="p-3 bg-neutral-50 border border-neutral-200">
                            <p className="text-xs text-neutral-500">{t('bookings.guests')}</p>
                            <p className="font-medium text-neutral-900">{booking.guests} {t('booking.guests')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-neutral-400" />
                            <span className="text-sm">
                              {booking.payment_status === 'COMPLETED' ? t('bookings.paid') : t('bookings.unpaid')}
                            </span>
                          </div>
                          <div className="text-sm text-neutral-400">
                            {t('bookings.bookingDate')}: {new Date(booking.created_at).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="lg:text-right">
                        <div className="mb-4">
                          <p className="text-sm text-neutral-500">{t('bookings.totalPrice')}</p>
                          <p className="text-2xl font-bold text-neutral-900">
                            ${booking.total_price.toLocaleString()} {booking.currency}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <>
                              <Button variant="outline" size="sm">
                                <MessageSquare size={14} className="mr-1" />
                                {t('bookings.contactHost')}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download size={14} className="mr-1" />
                                {t('bookings.downloadVoucher')}
                              </Button>
                            </>
                          )}
                          
                          {booking.status === 'CHECKED_OUT' && (
                            <Button 
                              size="sm"
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
      </Container>

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
                <p className="text-xl font-bold text-primary">{selectedBooking.booking_number}</p>
              </div>
              <Badge variant={selectedBooking.status === 'CONFIRMED' ? 'primary' : 'default'}>
                {statusConfig[selectedBooking.status]?.label || selectedBooking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">{t('bookings.property')}</p>
                <p className="font-medium">{selectedBooking.property_title}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t('booking.guestName')}</p>
                <p className="font-medium">{selectedBooking.guest_name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t('bookings.checkIn')}</p>
                <p className="font-medium">{selectedBooking.check_in}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t('bookings.checkOut')}</p>
                <p className="font-medium">{selectedBooking.check_out}</p>
              </div>
            </div>

            <Divider />

            <div>
              <h4 className="font-medium mb-3">{t('bookings.priceBreakdown')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t('bookings.basePrice')}</span>
                  <span>${selectedBooking.total_price.toLocaleString()} {selectedBooking.currency}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>{t('booking.total')}</span>
                  <span>${selectedBooking.total_price.toLocaleString()} {selectedBooking.currency}</span>
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
            {t('bookings.writeReview')} {selectedBooking?.property_title}
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
