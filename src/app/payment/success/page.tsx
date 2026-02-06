'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { CheckCircle, Calendar, Mail, ArrowRight, Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
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
          支付成功！
        </h1>
        
        <p className="text-gray-600 mb-6">
          您的预订已成功确认，我们将尽快发送确认邮件给您。
        </p>

        {bookingNumber && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">预订编号</p>
            <p className="text-xl font-bold text-gray-900">{bookingNumber}</p>
          </div>
        )}

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={18} className="text-amber-500" />
            <span>确认邮件已发送至您的邮箱</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar size={18} className="text-amber-500" />
            <span>您可以在&quot;我的预订&quot;中管理订单</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard/bookings">
            <Button size="lg" className="w-full">
              查看我的预订
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              返回首页
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          {countdown > 0 ? `${countdown}秒后自动跳转到我的预订` : '正在跳转...'}
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span>加载中...</span>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
