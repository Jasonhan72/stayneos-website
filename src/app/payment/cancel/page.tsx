'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          支付未完成
        </h1>
        
        <p className="text-gray-600 mb-6">
          您的支付已取消或遇到问题。请不要担心，您的预订尚未确认，不会有任何费用产生。
        </p>

        <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-amber-900 mb-2">可能的原因：</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>· 支付过程中取消了操作</li>
            <li>· 银行卡余额不足</li>
            <li>· 银行卡被银行拒绝</li>
            <li>· 网络连接中断</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard/bookings">
            <Button size="lg" className="w-full">
              查看我的预订
            </Button>
          </Link>
          
          <Link href="/properties">
            <Button variant="outline" className="w-full">
              <ArrowLeft size={18} className="mr-2" />
              返回浏览房源
            </Button>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <HelpCircle size={16} />
            <span>需要帮助？</span>
            <a href="mailto:support@stayneos.com" className="text-amber-600 hover:underline">
              联系客服
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
