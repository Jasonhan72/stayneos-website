'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { locales, localeNames } from '@/i18n.config';

interface LanguageSwitcherProps {
  locale: string;
  isScrolled?: boolean;
}

export default function LanguageSwitcher({ locale, isScrolled = false }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // 获取当前路径（去掉语言前缀）
    const pathWithoutLocale = pathname.replace(/^\/(en|fr|zh)/, '') || '/';
    
    // 导航到新语言的相同页面
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
          isScrolled
            ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            : 'text-white/90 hover:text-white hover:bg-white/10'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={18} />
        <span className="hidden md:inline">{localeNames[locale as keyof typeof localeNames] || 'English'}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                  locale === loc
                    ? 'text-amber-600 font-medium'
                    : 'text-gray-700'
                )}
              >
                <span>{localeNames[loc]}</span>
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