// User Bookings Page
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar,
  MapPin,
  CreditCard,
  Download,
  MessageSquare,
  ChevronRight,
  Check,
  Clock,
  X,
  Printer,
  Star
} from 'lucide-react';
import { Button, Container, Card, Badge, Divider, Modal } from '@/components/ui';
import BackToHomeButton from '@/components/navigation/BackToHomeButton';

// Mock bookings data
const mockBookings = [
  {
    id: 'BK001',
    property: {
      id: '1',
      title: 'Cooper St 豪华湖景公寓',
      location: '5811-55 Cooper St, Toronto, ON M5E 0G1',
      image: '/images/cooper-55-dining.jpg',
    },
    checkIn: '2024-03-01',
    checkOut: '2024-03-31',
    nights: 30,
    guests: 2,
    status: 'upcoming',
    totalPrice: 17680,
    paidAmount: 17680,
    paymentStatus: 'paid',
    bookingDate: '2024-02-01',
    confirmationCode: 'STY-2024-001',
  },
  {
    id: 'BK002',
    property: {
      id: '2',
      title: 'Simcoe St 高层精品公寓',
      location: '3709-238 Simcoe St, Toronto, ON M5S 1T4',
      image: '/images/simcoe-238-living.jpg',
    },
    checkIn: '2024-01-15',
    checkOut: '2024-02-15',
    nights: 31,
    guests: 2,
    status: 'completed',
    totalPrice: 12150,
    paidAmount: 12150,
    paymentStatus: 'paid',
    bookingDate: '2023-12-20',
    confirmationCode: 'STY-2024-002',
    review: {
      rating: 5,
      comment: '非常棒的住宿体验，公寓干净整洁，位置便利，强烈推荐！',
      date: '2024-02-16',
    },
  },
  {
    id: 'BK003',
    property: {
      id: '1',
      title: 'Cooper St 豪华湖景公寓',
      location: '5811-55 Cooper St, Toronto, ON M5E 0G1',
      image: '/images/cooper-55-c5e8357d.jpg',
    },
    checkIn: '2024-05-01',
    checkOut: '2024-05-31',
    nights: 30,
    guests: 3,
    status: 'confirmed',
    totalPrice: 17680,
    paidAmount: 8840,
    paymentStatus: 'partial',
    bookingDate: '2024-01-20',
    confirmationCode: 'STY-2024-003',
  },
];

const statusConfig = {
  upcoming: {
    label: '即将入住',
    color: 'bg-primary',
    icon: Clock,
  },
  confirmed: {
    label: '已确认',
    color: 'bg-success',
    icon: Check,
  },
  completed: {
    label: '已完成',
    color: 'bg-neutral-500',
    icon: Check,
  },
  cancelled: {
    label: '已取消',
    color: 'bg-error',
    icon: X,
  },
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const filteredBookings = mockBookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return ['upcoming', 'confirmed'].includes(booking.status);
    if (activeTab === 'completed') return booking.status === 'completed';
    return true;
  });

  const handleSubmitReview = () => {
    // Simulate API call
    setTimeout(() => {
      setShowReviewModal(false);
      setSelectedBooking(null);
      setReviewRating(5);
      setReviewComment('');
    }, 500);
  };

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">我的预订</h1>
          <p className="text-neutral-600 mt-2">管理您的预订和查看历史记录</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200">
          {[
            { id: 'all', label: '全部预订', count: mockBookings.length },
            { id: 'upcoming', label: '即将入住', count: mockBookings.filter(b => ['upcoming', 'confirmed'].includes(b.status)).length },
            { id: 'completed', label: '已完成', count: mockBookings.filter(b => b.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'upcoming' | 'completed')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-primary' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-neutral-200 text-neutral-600 text-xs">
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 flex items-center justify-center">
                <Calendar size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">暂无预订</h3>
              <p className="text-neutral-600 mb-4">您还没有符合条件的预订记录</p>
              <Link href="/properties">
                <Button>浏览房源</Button>
              </Link>
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig].icon;
              
              return (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Property Image */}
                    <div className="relative w-full lg:w-72 h-48 lg:h-auto flex-shrink-0">
                      <Image
                        src={booking.property.image}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute top-4 left-4 px-3 py-1 text-white text-sm font-medium flex items-center gap-1 ${statusConfig[booking.status as keyof typeof statusConfig].color}`}>
                        <StatusIcon size={14} />
                        {statusConfig[booking.status as keyof typeof statusConfig].label}
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm text-neutral-500">预订号: {booking.confirmationCode}</p>
                              <Link 
                                href={`/property/${booking.property.id}`}
                                className="text-xl font-semibold text-neutral-900 hover:text-primary transition-colors"
                              >
                                {booking.property.title}
                              </Link>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-neutral-500 text-sm mb-4">
                            <MapPin size={14} />
                            <span>{booking.property.location}</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="p-3 bg-neutral-50 border border-neutral-200">
                              <p className="text-xs text-neutral-500">入住日期</p>
                              <p className="font-medium text-neutral-900">{booking.checkIn}</p>
                            </div>
                            <div className="p-3 bg-neutral-50 border border-neutral-200">
                              <p className="text-xs text-neutral-500">退房日期</p>
                              <p className="font-medium text-neutral-900">{booking.checkOut}</p>
                            </div>
                            <div className="p-3 bg-neutral-50 border border-neutral-200">
                              <p className="text-xs text-neutral-500">入住天数</p>
                              <p className="font-medium text-neutral-900">{booking.nights} 晚</p>
                            </div>
                            <div className="p-3 bg-neutral-50 border border-neutral-200">
                              <p className="text-xs text-neutral-500">入住人数</p>
                              <p className="font-medium text-neutral-900">{booking.guests} 人</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <CreditCard size={16} className="text-neutral-400" />
                              <span className="text-sm">
                                {booking.paymentStatus === 'paid' ? '已全额支付' : '部分支付'}
                              </span>
                            </div>
                            <div className="text-sm text-neutral-400">
                              预订日期: {booking.bookingDate}
                            </div>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="lg:text-right">
                          <div className="mb-4">
                            <p className="text-sm text-neutral-500">总价</p>
                            <p className="text-2xl font-bold text-neutral-900">
                              ${booking.totalPrice.toLocaleString()} CAD
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {booking.status === 'upcoming' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <MessageSquare size={14} className="mr-1" />
                                  联系房东
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download size={14} className="mr-1" />
                                  下载凭证
                                </Button>
                              </>
                            )}
                            
                            {booking.status === 'completed' && !booking.review && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowReviewModal(true);
                                }}
                              >
                                <Star size={14} className="mr-1" />
                                写评价
                              </Button>
                            )}
                            
                            {booking.review && (
                              <div className="flex items-center gap-1 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    className={i < booking.review!.rating ? 'fill-amber-400' : 'text-neutral-300'} 
                                  />
                                ))}
                                <span className="text-sm text-neutral-600 ml-2">已评价</span>
                              </div>
                            )}

                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              查看详情
                              <ChevronRight size={14} className="ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Container>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking && !showReviewModal}
        onClose={() => setSelectedBooking(null)}
        title="预订详情"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              关闭
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Printer size={16} className="mr-1" />
                打印
              </Button>
              <Button variant="outline">
                <Download size={16} className="mr-1" />
                下载PDF
              </Button>
            </div>
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20">
              <div>
                <p className="text-sm text-neutral-500">确认码</p>
                <p className="text-xl font-bold text-primary">{selectedBooking.confirmationCode}</p>
              </div>
              <Badge variant={selectedBooking.status === 'upcoming' ? 'primary' : 'default'}>
                {statusConfig[selectedBooking.status as keyof typeof statusConfig].label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">房源</p>
                <p className="font-medium">{selectedBooking.property.title}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">地址</p>
                <p className="font-medium">{selectedBooking.property.location}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">入住日期</p>
                <p className="font-medium">{selectedBooking.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">退房日期</p>
                <p className="font-medium">{selectedBooking.checkOut}</p>
              </div>
            </div>

            <Divider />

            <div>
              <h4 className="font-medium mb-3">费用明细</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">房费</span>
                  <span>${selectedBooking.totalPrice.toLocaleString()} CAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">服务费</span>
                  <span>包含在内</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">税费</span>
                  <span>包含在内</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>总计</span>
                  <span>${selectedBooking.totalPrice.toLocaleString()} CAD</span>
                </div>
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
        title="撰写评价"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowReviewModal(false);
                setSelectedBooking(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitReview}>
              提交评价
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            请为 {selectedBooking?.property.title} 撰写评价
          </p>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">评分</label>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">评价内容</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="分享您的入住体验..."
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Back to Home Button */}
      <BackToHomeButton />
    </main>
  );
}
