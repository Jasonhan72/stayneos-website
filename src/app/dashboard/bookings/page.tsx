'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui';
import { 
  Calendar, 
  MapPin, 
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
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    images: { url: string }[];
  };
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

// Mock data for different tabs
const mockBookings: Record<TabType, Booking[]> = {
  upcoming: [
    {
      id: 'booking-1',
      bookingNumber: 'BK-2024-001',
      checkIn: '2024-04-15',
      checkOut: '2024-04-20',
      nights: 5,
      guests: 2,
      totalPrice: 2500,
      currency: 'CAD',
      status: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
      property: {
        id: 'prop-1',
        title: 'Luxury Downtown Condo',
        address: '123 Bay Street',
        city: 'Toronto',
        images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' }],
      },
    },
    {
      id: 'booking-2',
      bookingNumber: 'BK-2024-002',
      checkIn: '2024-05-10',
      checkOut: '2024-05-15',
      nights: 5,
      guests: 4,
      totalPrice: 3500,
      currency: 'CAD',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      property: {
        id: 'prop-2',
        title: 'Waterfront Executive Suite',
        address: '456 Harbourfront',
        city: 'Toronto',
        images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' }],
      },
    },
  ],
  current: [
    {
      id: 'booking-3',
      bookingNumber: 'BK-2024-003',
      checkIn: '2024-02-01',
      checkOut: '2024-02-28',
      nights: 27,
      guests: 2,
      totalPrice: 12000,
      currency: 'CAD',
      status: 'CHECKED_IN',
      paymentStatus: 'COMPLETED',
      property: {
        id: 'prop-3',
        title: 'Modern Yorkville Apartment',
        address: '789 Yonge Street',
        city: 'Toronto',
        images: [{ url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800' }],
      },
    },
  ],
  past: [
    {
      id: 'booking-4',
      bookingNumber: 'BK-2023-045',
      checkIn: '2023-12-20',
      checkOut: '2023-12-27',
      nights: 7,
      guests: 3,
      totalPrice: 4200,
      currency: 'CAD',
      status: 'CHECKED_OUT',
      paymentStatus: 'COMPLETED',
      property: {
        id: 'prop-4',
        title: 'Cozy Midtown Studio',
        address: '321 Eglinton Ave',
        city: 'Toronto',
        images: [{ url: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=800' }],
      },
    },
    {
      id: 'booking-5',
      bookingNumber: 'BK-2023-038',
      checkIn: '2023-11-10',
      checkOut: '2023-11-15',
      nights: 5,
      guests: 2,
      totalPrice: 2800,
      currency: 'CAD',
      status: 'CHECKED_OUT',
      paymentStatus: 'COMPLETED',
      property: {
        id: 'prop-5',
        title: 'Stylish Entertainment District Loft',
        address: '654 King Street W',
        city: 'Toronto',
        images: [{ url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800' }],
      },
    },
  ],
  cancelled: [
    {
      id: 'booking-6',
      bookingNumber: 'BK-2023-022',
      checkIn: '2023-10-05',
      checkOut: '2023-10-10',
      nights: 5,
      guests: 2,
      totalPrice: 3000,
      currency: 'CAD',
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      property: {
        id: 'prop-6',
        title: 'Bright North York Apartment',
        address: '987 Sheppard Ave',
        city: 'Toronto',
        images: [{ url: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800' }],
      },
    },
  ],
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Simulate fetching bookings based on tab
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setBookings(mockBookings[activeTab]);
    setIsLoading(false);
  }, [activeTab]);

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

  const handleConfirmCancel = () => {
    // Simulate cancellation
    setBookings(prev => prev.filter(b => b.id !== selectedBooking?.id));
    setShowCancelModal(false);
    setSelectedBooking(null);
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

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="pt-24 pb-12">
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
                    {/* Property Image */}
                    <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                      <Image
                        src={booking.property.images[0]?.url || '/images/placeholder.jpg'}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-neutral-500">
                              Booking #{booking.bookingNumber}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>

                          <Link 
                            href={`/properties/${booking.property.id}`}
                            className="text-lg font-semibold text-neutral-900 hover:text-accent transition-colors"
                          >
                            {booking.property.title}
                          </Link>

                          <div className="flex items-center gap-1 text-neutral-500 text-sm mt-1">
                            <MapPin size={14} />
                            <span>{booking.property.address}, {booking.property.city}</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="p-3 bg-neutral-50 rounded-lg">
                              <p className="text-xs text-neutral-500 mb-1">Check-in</p>
                              <p className="font-medium text-neutral-900">{formatDate(booking.checkIn)}</p>
                            </div>
                            <div className="p-3 bg-neutral-50 rounded-lg">
                              <p className="text-xs text-neutral-500 mb-1">Check-out</p>
                              <p className="font-medium text-neutral-900">{formatDate(booking.checkOut)}</p>
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
                            ${booking.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-neutral-500">{booking.currency}</p>
                          <div className="mt-4 space-y-2">
                            <Link href={`/dashboard/bookings/${booking.id}`}>
                              <Button variant="outline" size="sm" fullWidth
                                rightIcon={<ChevronRight size={14} />}
                              >
                                View Details
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
        size="md"
        footer={
          <div className="flex justify-end gap-2">
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
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to cancel booking <span className="font-medium">#{selectedBooking?.bookingNumber}</span>?
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-medium text-amber-800 mb-2">⚠️ Please note:</p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• This action cannot be undone</li>
              <li>• Refunds will be processed within 3-5 business days</li>
              <li>• Cancellation fees may apply</li>
            </ul>
          </div>
        </div>
      </Modal>
    </main>
  );
}
