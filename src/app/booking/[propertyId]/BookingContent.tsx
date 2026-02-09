'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DateRangePicker from '@/components/ui/DateRangePicker';
import StripeProvider from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { Button, Input } from '@/components/ui';
import { getPropertyById } from '@/lib/data';
import { calculateBookingPrice, validateBookingDates } from '@/lib/booking';
import { useAuth } from '@/lib/UserContext';
import { useI18n } from '@/lib/i18n';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Check, 
  AlertCircle,
  Loader2,
  Shield,
  Lock,
  User
} from 'lucide-react';

export default function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = params.propertyId as string;
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  const property = getPropertyById(propertyId);
  
  // 从 URL 获取预填数据
  const queryCheckIn = searchParams.get('checkIn') || '';
  const queryCheckOut = searchParams.get('checkOut') || '';
  const queryGuests = parseInt(searchParams.get('guests') || '2', 10);
  
  // 表单状态
  const [checkIn, setCheckIn] = useState(queryCheckIn);
  const [checkOut, setCheckOut] = useState(queryCheckOut);
  const [guests, setGuests] = useState(queryGuests);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // 自动填充用户信息
  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [isAuthenticated, user]);
  
  // 步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 预订和支付状态
  const [, setBookingId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');

  // 如果房源不存在，重定向到房源列表
  useEffect(() => {
    if (!property) {
      router.push('/properties');
    }
  }, [property, router]);

  if (!property) {
    return null;
  }

  // 计算价格
  const priceCalc = checkIn && checkOut 
    ? calculateBookingPrice(property, checkIn, checkOut)
    : null;

  // 验证日期
  const dateValidation = checkIn && checkOut
    ? validateBookingDates(checkIn, checkOut, property.minNights)
    : { valid: true };

  // 处理创建预订
  const handleCreateBooking = async () => {
    if (!checkIn || !checkOut) {
      setError(t('booking.selectDatesError'));
      return;
    }

    if (!dateValidation.valid) {
      setError(dateValidation.error || t('errors.selectDates'));
      return;
    }

    // 使用用户登录信息或表单信息
    const finalGuestName = isAuthenticated ? (user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()) : guestName;
    const finalGuestEmail = isAuthenticated ? user?.email : guestEmail;
    const finalGuestPhone = isAuthenticated ? (user?.phone || guestPhone) : guestPhone;

    if (!finalGuestName || !finalGuestEmail || !finalGuestPhone) {
      setError(t('booking.fillAllInfo'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          checkIn,
          checkOut,
          nights: priceCalc?.nights || 0,
          guests,
          guestName: finalGuestName,
          guestEmail: finalGuestEmail,
          guestPhone: finalGuestPhone,
          basePrice: property.price,
          discountRate: priceCalc?.discountPercentage || 0,
          discountAmount: priceCalc?.discount || 0,
          serviceFee: priceCalc?.serviceFee || 0,
          totalPrice: priceCalc?.total || 0,
          specialRequests,
          userId: isAuthenticated ? user?.id : undefined,
        }),
      });

      const data = await response.json() as { error?: string; booking: { id: string; bookingNumber: string } };

      if (!response.ok) {
        throw new Error(data.error || t('booking.createBookingError'));
      }

      setBookingId(data.booking.id);
      setBookingNumber(data.booking.bookingNumber);
      setCurrentStep(3);
      
      // 创建支付意图
      await createPaymentIntent(data.booking.id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '创建预订失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建支付意图
  const createPaymentIntent = async (bookingId: string) => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json() as { error?: string; clientSecret: string };

      if (!response.ok) {
        throw new Error(data.error || t('booking.createPaymentError'));
      }

      setClientSecret(data.clientSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('booking.createPaymentError');
      setError(errorMessage);
    }
  };

  // 支付成功处理
  const handlePaymentSuccess = () => {
    router.push(`/payment/success?booking=${bookingNumber}`);
  };

  // 支付失败处理
  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <main className="min-h-screen bg-amber-50">
      
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* 返回链接 */}
          <Link 
            href={`/properties/${property.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft size={20} />
            <span>{t('booking.returnToProperty')}</span>
          </Link>

          {/* 步骤指示器 */}
          <div className="mb-8">
            <div className="flex items-center justify-center max-w-2xl mx-auto">
              {[1, 2, 3].map((step, index) => (
                <>
                  <div key={step} className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    currentStep >= step 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? (
                      <Check size={20} />
                    ) : (
                      step
                    )}
                  </div>
                  {index < 2 && (
                    <div key={`line-${index}`} className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-amber-500' : 'bg-gray-200'
                    }`} />
                  )}
                </>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-2 text-sm text-gray-600">
              <span>{t('booking.step1')}</span>
              <span>{t('booking.step2')}</span>
              <span>{t('booking.step3')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧 - 预订表单 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 步骤 1: 日期选择 */}
              {currentStep === 1 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('booking.selectDatesAndGuestsTitle')}</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('booking.checkInDate')} - {t('booking.checkOutDate')}
                      </label>
                      <DateRangePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onCheckInChange={setCheckIn}
                        onCheckOutChange={setCheckOut}
                        minNights={property.minNights}
                      />
                      
                      {!dateValidation.valid && (
                        <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                          <AlertCircle size={16} />
                          <span>{dateValidation.error}</span>
                        </div>
                      )}
                      
                      {property.minNights && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                          <span className="font-medium text-amber-800">📅 {t('booking.minNights', { count: property.minNights })}</span>
                          {property.monthlyDiscount && (
                            <span className="text-amber-700 ml-2">· {t('booking.monthlyDiscount', { percent: property.monthlyDiscount })}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('booking.guests')}
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        {Array.from({ length: property.maxGuests }).map((_, i) => (
                          <option key={i} value={i + 1}>
                            {t('booking.guestCount', { count: i + 1 })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!checkIn || !checkOut || !dateValidation.valid}
                      size="lg"
                    >
                      {t('booking.nextStep')}
                    </Button>
                  </div>
                </div>
              )}

              {/* 步骤 2: 信息确认 */}
              {currentStep === 2 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('booking.confirmInfoTitle')}</h2>
                  
                  <div className="space-y-6">
                    {/* 已登录用户 - 显示用户信息卡片 */}
                    {isAuthenticated && user ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{t('booking.loggedInAccount')}</h3>
                            <p className="text-sm text-gray-500">{t('booking.useAccountInfo')}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">{t('booking.name')}：</span>{guestName}</p>
                          <p><span className="text-gray-500">{t('booking.email')}：</span>{guestEmail}</p>
                          {guestPhone && <p><span className="text-gray-500">{t('booking.phone')}：</span>{guestPhone}</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <Link href="/profile" className="text-blue-600 text-sm hover:underline">
                            {t('booking.editProfile')} →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      /* 未登录用户 - 显示表单 */
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label={`${t('booking.guestName')} *`}
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder={t('booking.name')}
                            required
                          />
                          <Input
                            label={`${t('booking.guestPhone')} *`}
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder={t('booking.phone')}
                            required
                          />
                        </div>

                        <Input
                          label={`${t('booking.guestEmail')} *`}
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder={t('booking.email')}
                          required
                        />
                      </>
                    )}

                    {/* 特殊需求 - 所有用户都显示 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('booking.specialRequests')}（{t('booking.optional')}）
                      </label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder={t('booking.specialRequestsPlaceholder')}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      {t('common.back')}
                    </Button>
                    <Button
                      onClick={handleCreateBooking}
                      disabled={isLoading}
                      isLoading={isLoading}
                      size="lg"
                    >
                      {isLoading ? t('booking.submitting') : t('booking.confirmAndPay')}
                    </Button>
                  </div>
                </div>
              )}

              {/* 步骤 3: 支付 */}
              {currentStep === 3 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">安全支付</h2>
                  
                  {clientSecret ? (
                    <StripeProvider clientSecret={clientSecret}>
                      <PaymentForm
                        amount={priceCalc?.total || 0}
                        currency={priceCalc?.currency || 'CAD'}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </StripeProvider>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="animate-spin mr-2" size={24} />
                      <span>加载支付信息中...</span>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 右侧 - 价格摘要 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg">
                {/* 房源信息 */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{property.title}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </div>
                </div>

                {/* 日期摘要 */}
                {checkIn && checkOut && (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">入住日期</p>
                        <p className="font-medium">{checkIn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">退房日期</p>
                        <p className="font-medium">{checkOut}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 价格明细 */}
                {priceCalc && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ${priceCalc.basePrice.toLocaleString()} CAD x {priceCalc.nights}晚
                      </span>
                      <span>${priceCalc.subtotal.toLocaleString()} CAD</span>
                    </div>
                    
                    {priceCalc.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>月租折扣 ({priceCalc.discountPercentage}% off)</span>
                        <span>-${priceCalc.discount.toLocaleString()} CAD</span>
                      </div>
                    )}
                    
                    {priceCalc.cleaningFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">清洁费</span>
                        <span>${priceCalc.cleaningFee.toLocaleString()} CAD</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">服务费</span>
                      <span>${priceCalc.serviceFee.toLocaleString()} CAD</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">税费 (13% HST)</span>
                      <span>${priceCalc.tax.toLocaleString()} CAD</span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">总价</span>
                        <span className="font-bold text-lg">
                          ${priceCalc.total.toLocaleString()} CAD
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 安全提示 */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Shield size={16} />
                    <span>安全支付保障</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock size={16} />
                    <span>信息已加密保护</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
