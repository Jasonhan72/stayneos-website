'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import { Button, Modal } from '@/components/ui';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  ChevronRight,
  Clock,
  Check,
  X,
  AlertCircle,
  Loader2,
  Home
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
  paidAmount: number;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    images: { url: string }[];
  };
  review?: {
    id: string;
    rating: number;
  } | null;
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

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // 获取预订列表
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings?status=${activeTab}`);
      const data = await response.json() as { error?: string; bookings: Booking[] };

      if (!response.ok) {
        throw new Error(data.error || '获取预订失败');
      }

      setBookings(data.bookings);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取预订失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 取消预订
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          reason: cancelReason,
        }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || '取消预订失败');
      }

      // 刷新列表
      fetchBookings();
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '取消预订失败';
      setError(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-amber-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">我的预订</h1>
            <p className="text-gray-600 mt-1">管理您的预订和查看历史记录</p>
          </div>

          {/* 标签页 */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { id: 'all', label: '全部' },
              { id: 'upcoming', label: '即将入住' },
              { id: 'active', label: '进行中' },
              { id: 'completed', label: '已完成' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id 
                    ? 'text-amber-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
            ))}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* 加载状态 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-2" size={24} />
              <span>加载中...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预订</h3>
              <p className="text-gray-500 mb-6">您还没有符合条件的预订记录</p>
              <Link href="/properties">
                <Button>浏览房源</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* 房源图片 */}
                    <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={booking.property.images[0]?.url || '/images/placeholder.jpg'}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* 预订信息 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-500">预订号: {booking.bookingNumber}</p>
                          <Link 
                            href={`/properties/${booking.property.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                          >
                            {booking.property.title}
                          </Link>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                        <MapPin size={14} />
                        <span>{booking.property.address}, {booking.property.city}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">入住日期</p>
                          <p className="font-medium text-gray-900">{formatDate(booking.checkIn)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">退房日期</p>
                          <p className="font-medium text-gray-900">{formatDate(booking.checkOut)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">入住天数</p>
                          <p className="font-medium text-gray-900">{booking.nights} 晚</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">入住人数</p>
                          <p className="font-medium text-gray-900">{booking.guests} 人</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {booking.paymentStatus === 'COMPLETED' ? '已支付' : '待支付'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ${Number(booking.totalPrice).toLocaleString()} {booking.currency}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            查看详情
                            <ChevronRight size={14} className="ml-1" />
                          </Button>
                        </Link>

                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCancelModal(true);
                            }}
                          >
                            取消预订
                          </Button>
                        )}

                        {booking.status === 'CHECKED_OUT' && !booking.review && (
                          <Button size="sm">
                            写评价
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 取消预订弹窗 */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedBooking(null);
          setCancelReason('');
        }}
        title="取消预订"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason('');
              }}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelBooking}
              isLoading={isCancelling}
            >
              确认取消
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            您确定要取消预订 <span className="font-medium">{selectedBooking?.bookingNumber}</span> 吗？
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">⚠️ 注意：</p>
            <ul className="space-y-1">
              <li>· 取消后无法恢复</li>
              <li>· 退款将在 3-5 个工作日内退回原支付账户</li>
              <li>· 部分预订可能适用取消费用</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取消原因（选填）
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="请告诉我们取消的原因..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}
