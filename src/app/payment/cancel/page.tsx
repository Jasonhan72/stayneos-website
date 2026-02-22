'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('payment.cancel.title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('payment.cancel.description')}
        </p>

        <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-amber-900 mb-2">{t('payment.cancel.reasonsTitle')}</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>· {t('payment.cancel.reason1')}</li>
            <li>· {t('payment.cancel.reason2')}</li>
            <li>· {t('payment.cancel.reason3')}</li>
            <li>· {t('payment.cancel.reason4')}</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard/bookings">
            <Button size="lg" className="w-full">
              {t('payment.cancel.viewBookings')}
            </Button>
          </Link>
          
          <Link href="/properties">
            <Button variant="outline" className="w-full">
              <ArrowLeft size={18} className="mr-2" />
              {t('payment.cancel.browseProperties')}
            </Button>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <HelpCircle size={16} />
            <span>{t('payment.cancel.help')}</span>
            <a href="mailto:support@stayneos.com" className="text-amber-600 hover:underline">
              {t('payment.cancel.contact')}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
