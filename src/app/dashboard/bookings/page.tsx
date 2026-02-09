'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui';
import { useAuth } from '@/lib/UserContext';
import { 
  Calendar, 
  ChevronRight,
  Check,
  X,
  Home,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  created_at: string;
}

type TabType = 'upcoming' | 'current' | 'past' | 'cancelled';

const tabs: { id: TabType; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'current', label: 'Current' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  CHECKED_IN: {
    label: 'Checked in',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  CHECKED_OUT: {
    label: 'Checked out',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  // 获取预订列表
  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 通过用户ID获取预订
      const response = await fetch(`/api/bookings/list?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      const allBookings = data.bookings || [];
      
      // 根据标签筛选预订
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const filteredBookings = allBookings.filter((booking: Booking) => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const status = booking.status;
        
        switch (activeTab) {
          case 'upcoming':
            return checkIn > today && status !== 'CANCELLED';
          case 'current':
            return checkIn <= today && checkOut >= today && status !== 'CANCELLED';
          case 'past':
            return checkOut < today && status !== 'CANCELLED';
          case 'cancelled':
            return status === 'CANCELLED';
          default:
            return true;
        }
      });
      
      setBookings(filteredBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isAuthenticated, user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={cn("px-3 py-1 rounded-full text-xs font-medium", config.bgColor, config.color)}>
        {config.label}
      </span>
    );
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      // 刷新列表
      fetchBookings();
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const emptyStateContent = {
    upcoming: {
      icon: Calendar,
      title: 'No upcoming bookings',
      description: 'You don\'t have any upcoming stays. Time to plan your next trip!',
      cta: { text: 'Browse Properties', href: '/properties' },
    },
    current: {
      icon: Home,
      title: 'No current stays',
      description: 'You\'re not checked in anywhere right now.',
      cta: { text: 'Browse Properties', href: '/properties' },
    },
    past: {
      icon: Check,
      title: 'No past bookings',
      description: 'You haven\'t completed any stays yet.',
      cta: null,
    },
    cancelled: {
      icon: X,
      title: 'No cancelled bookings',
      description: 'You don\'t have any cancelled reservations.',
      cta: null,
    },
  };

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-50 pt-20">
        <div className="pt-4 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">My Bookings</h1>
              <p className="text-neutral-600 mb-6">Please log in to view your bookings</p>
              <Link href="/login">
                <Button>Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 pt-20">
      <div className="pt-4 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">My Bookings</h1>
            <p className="text-neutral-600 mt-2">Manage your reservations and view your stay history</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-neutral-200 mb-8">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-4 font-medium text-sm transition-colors relative",
                    activeTab === tab.id 
                      ? "text-accent" 
                      : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin mr-2 text-accent" size={24} />
              <span className="text-neutral-600">Loading your bookings...</span>
            </div>
          ) : bookings.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
              {React.createElement(emptyStateContent[activeTab].icon, { 
                size: 48, 
                className: "text-neutral-300 mx-auto mb-4" 
              })}
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {emptyStateContent[activeTab].title}
              </h3>
              <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                {emptyStateContent[activeTab].description}
              </p>
              {emptyStateContent[activeTab].cta && (
                <Link href={emptyStateContent[activeTab].cta!.href}>
                  <Button>
                    {emptyStateContent[activeTab].cta!.text}
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            /* Bookings List */
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Property Image Placeholder */}
                    <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-neutral-100 flex items-center justify-center">
                      <Home className="text-neutral-300" size={48} />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-neutral-500">
                              Booking #{booking.booking_number}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>

                          <h3 className="text-lg font-semibold text-neutral-900">
                            {booking.property_title}
                          </h3>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="p-3 bg-neutral-50 rounded-lg">
                              <p className="text-xs text-neutral-500 mb-1">Check-in</p>
                              <p className="font-medium text-neutral-900">{formatDate(booking.check_in)}</p>
                            </div>
                            <div className="p-3 bg-neutral-50 rounded-lg">
                              <p className="text-xs text-neutral-500 mb-1">Check-out</p>
                              <p className="font-medium text-neutral-900">{formatDate(booking.check_out)}</p>
                            </div>
                            <div className="p-3 bg-neutral-50 rounded-lg">
                              <p className="text-xs text-neutral-500 mb-1">Nights</p>
                              <p className="font-medium text-neutral-900">{booking.nights}</p>
                            </div>
                            <div className="p-3 bg-neutral-50 rounded-lg">
                              <p className="text-xs text-neutral-500 mb-1">Guests</p>
                              <p className="font-medium text-neutral-900">{booking.guests}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-neutral-900">
                            ${booking.total_price.toLocaleString()}
                          </p>
                          <p className="text-sm text-neutral-500">{booking.currency}</p>
                          <div className="mt-4 space-y-2">
                            <Link href={`/dashboard/bookings/${booking.id}`}>
                              <Button variant="outline" size="sm" fullWidth>
                                View Details
                                <ChevronRight size={14} className="ml-1" />
                              </Button>
                            </Link>
                            
                            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && activeTab === 'upcoming' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                fullWidth
                                onClick={() => handleCancelClick(booking)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedBooking(null);
        }}
        title="Cancel Booking"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to cancel booking <span className="font-medium">#{selectedBooking?.booking_number}</span>?
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-medium text-amber-800 mb-2">⚠️ Please note:</p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• This action cannot be undone</li>
              <li>• Refunds will be processed within 3-5 business days</li>
              <li>• Cancellation fees may apply</li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowCancelModal(false);
                setSelectedBooking(null);
              }}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
