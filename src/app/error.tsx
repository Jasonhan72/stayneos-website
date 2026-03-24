"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV !== 'production') console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('errors.somethingWrong') || '出错了'}
          </h1>
          <p className="text-gray-600 mb-2">
            {t('errors.pageLoadError') || '抱歉，页面加载时遇到了问题'}
          </p>
          {error.message && (
            <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {t('common.retry') || '重试'}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            {t('nav.home')}
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600 flex flex-wrap items-center justify-center gap-4">
          <Link href="/properties" className="hover:text-gray-900 hover:underline">{t('nav.properties')}</Link>
          <Link href="/contact" className="hover:text-gray-900 hover:underline">{t('nav.contact')}</Link>
          <Link href="/about" className="hover:text-gray-900 hover:underline">{t('nav.about')}</Link>
        </div>
      </div>
    </div>
  );
}
