'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function ForbiddenContent() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">{t('forbiddenPage.title')}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('forbiddenPage.subtitle')}</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{t('forbiddenPage.description')}</p>
        <div className="space-x-4">
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{t('forbiddenPage.goHome')}</Link>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">{t('forbiddenPage.myDashboard')}</Link>
        </div>
      </div>
    </div>
  );
}
