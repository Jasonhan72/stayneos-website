'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { CheckCircle, Calendar, Mail, ArrowRight, Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get('booking');
  const [countdown, setCountdown] = useState(5);

  // 自动跳转倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
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

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={18} className="text-amber-500" />
            <span>{t('payment.success.emailSent')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar size={18} className="text-amber-500" />
            <span>{t('payment.success.manageBooking')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard/bookings">
            <Button size="lg" className="w-full">
              {t('payment.success.viewBookings')}
              <ArrowRight size={18} className="ml-2" />
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

export default function PaymentSuccessPage() {
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
