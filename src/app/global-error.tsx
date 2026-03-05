"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Simple i18n for global-error (outside I18nProvider)
type Locale = 'en' | 'zh' | 'fr';
const translations: Record<Locale, { title: string; description: string; errorCode: string; refresh: string }> = {
  en: { title: "System Error", description: "Sorry, the application encountered a serious error. Please refresh and try again.", errorCode: "Error code: {code}", refresh: "Refresh Page" },
  zh: { title: "系统错误", description: "抱歉，应用遇到了严重错误。请刷新页面重试。", errorCode: "错误代码: {code}", refresh: "刷新页面" },
  fr: { title: "Erreur Système", description: "Désolé, erreur grave. Veuillez rafraîchir.", errorCode: "Code : {code}", refresh: "Rafraîchir" },
};

function getLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('preferred-locale');
  if (stored === 'zh' || stored === 'en' || stored === 'fr') return stored;
  return 'en';
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    setLocale(getLocale());
    console.error("Global error:", error);
  }, [error]);

  const t = translations[locale];

  return (
    <html lang={locale === 'zh' ? 'zh-CN' : locale}>
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-600" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600 mb-4">{t.description}</p>
            {error.digest && (
              <p className="text-sm text-gray-400">{t.errorCode.replace('{code}', error.digest)}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {t.refresh}
          </button>
        </div>
      </body>
    </html>
  );
}
