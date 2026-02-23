"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200 mb-4" aria-hidden="true">
            404
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('errors.pageNotFound')}
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('errors.pageNotFoundDesc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            {t('nav.home')}
          </Link>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {t('nav.properties')}
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {t('common.back')}
        </button>

        {/* Help Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('errors.youMayBeLooking')}
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link
                href="/properties"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {t('nav.properties')}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
