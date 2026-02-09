'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Clock,
  Check,
  X,
  Download,
  Printer,
  Star,
  AlertCircle,
  Loader2,
  Home
} from 'lucide-react';

interface BookingDetail {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  discount: number;
  tax: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  specialRequests: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    description: string;
    amenities: {
      amenity: {
        name: string;
        icon: string | null;
      };
    }[];
    images: { url: string; alt: string | null }[];
  };
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  payments: {
    id: string;
    amount: number;
    status: string;
    cardBrand: string | null;
    cardLast4: string | null;
    paidAt: string | null;
  }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number | string }> }> = {
  PENDING: {
    label: '待确认',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  CONFIRMED: {
    label: '已确认',
    color: 'bg-green-100 text-green-800',
    icon: Check,
  },
  CHECKED_IN: {
    label: '已入住',
    color: 'bg-blue-100 text-blue-800',
    icon: Home,
  },
  CHECKED_OUT: {
    label: '已退房',
    color: 'bg-gray-100 text-gray-800',
    icon: Check,
  },
  CANCELLED: {
    label: '已取消',
    color: 'bg-red-100 text-red-800',
    icon: X,
  },
};

export default function BookingDetailClient() {
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookingDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json() as { error?: string; booking: BookingDetail };

      if (!response.ok) {
        throw new Error(data.error || '获取预订详情失败');
      }

      setBooking(data.booking);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取预订详情失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: booking?.currency || 'CAD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-amber-50">
        
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-2" size={24} />
              <span>加载中...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-amber-50">
        
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-xl p-8 text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">加载失败</h2>
              <p className="text-gray-600 mb-6">{error || '预订不存在'}</p>
              <Link href="/dashboard/bookings">
                <Button>返回预订列表</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const StatusIcon = statusConfig[booking.status]?.icon || Clock;
  const statusConfigItem = statusConfig[booking.status] || statusConfig.PENDING;

  return (
    <main className="min-h-screen bg-amber-50">
      

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 返回链接 */}
          <Link 
            href="/dashboard/bookings"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft size={20} />
            <span>返回预订列表</span>
          </Link>

          {/* 预订状态卡片 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className={`p-6 ${statusConfigItem.color} bg-opacity-10`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusConfigItem.color}`}>
                    <StatusIcon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">预订号: {booking.bookingNumber}</p>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {statusConfigItem.label}
                    </h1>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">预订日期</p>
                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 房源信息 */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">房源信息</h2>
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                    <Image
                      src={booking.property.images[0]?.url || '/images/placeholder.jpg'}
                      alt={booking.property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Link 
                    href={`/properties/${booking.property.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                  >
                    {booking.property.title}
                  </Link>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin size={14} />
                    <span>{booking.property.address}, {booking.property.city}</span>
                  </div>
                </div>

                {/* 入住信息 */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">入住信息</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Calendar size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">入住日期</p>
                        <p className="font-medium">{formatDate(booking.checkIn)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Calendar size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">退房日期</p>
                        <p className="font-medium">{formatDate(booking.checkOut)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 font-medium">{booking.guests}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">入住人数</p>
                        <p className="font-medium">{booking.guests} 人 · {booking.nights} 晚</p>
                      </div>
                    </div>
                  </div>

                  {/* 入住人信息 */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-3">入住人</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">姓名：</span> {booking.guestName}</p>
                      <p><span className="text-gray-500">电话：</span> {booking.guestPhone}</p>
                      <p><span className="text-gray-500">邮箱：</span> {booking.guestEmail}</p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-medium text-gray-900 mb-3">特殊需求</h3>
                      <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 价格明细 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">费用明细</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">房费</span>
                <span>{formatAmount(booking.basePrice * booking.nights)}</span>
              </div>
              
              {booking.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>折扣</span>
                  <span>-{formatAmount(booking.discount)}</span>
                </div>
              )}
              
              {booking.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">清洁费</span>
                  <span>{formatAmount(booking.cleaningFee)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">服务费</span>
                <span>{formatAmount(booking.serviceFee)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">税费 (HST)</span>
                <span>{formatAmount(booking.tax)}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">总价</span>
                  <span className="font-bold text-lg">{formatAmount(Number(booking.totalPrice))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 支付记录 */}
          {booking.payments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">支付记录</h2>
              
              <div className="space-y-4">
                {booking.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {payment.cardBrand ? `${payment.cardBrand.toUpperCase()} ****${payment.cardLast4}` : '信用卡'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.paidAt ? formatDate(payment.paidAt) : '待支付'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold">{formatAmount(Number(payment.amount))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 评价 */}
          {booking.review && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">我的评价</h2>
              
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < booking.review!.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                  />
                ))}
                <span className="ml-2 text-gray-500">{formatDate(booking.review.createdAt)}</span>
              </div>
              
              <p className="text-gray-600">{booking.review.comment}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Printer size={18} className="mr-2" />
              打印
            </Button>
            
            <Button variant="outline">
              <Download size={18} className="mr-2" />
              下载凭证
            </Button>

            {booking.status === 'CHECKED_OUT' && !booking.review && (
              <Button>
                <Star size={18} className="mr-2" />
                写评价
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
