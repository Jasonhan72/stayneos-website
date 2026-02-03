'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n, type Locale } from '@/lib/i18n';

const localeLabels: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  zh: '中文'
};

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

export default function LanguageSwitcher({ isScrolled = false }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useI18n();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
          isScrolled
            ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            : 'text-white/90 hover:text-white hover:bg-white/10'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={18} />
        <span className="hidden md:inline">{localeLabels[locale]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
            {(['en', 'fr', 'zh'] as Locale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  locale === loc
                    ? 'text-amber-600 font-medium'
                    : 'text-gray-700'
                }`}
              >
                <span>{localeLabels[loc]}</span>
                {locale === loc && (
                  <Check size={16} className="text-amber-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
