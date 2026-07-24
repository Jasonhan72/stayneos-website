'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Truck,
  CalendarDays,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface Category {
  key: string;
  icon: React.ElementType;
  labelKey: string;
  defaultLabel: string;
}

const CATEGORIES: Category[] = [
  { key: 'corporate', icon: Briefcase, labelKey: 'categories.corporateStays', defaultLabel: 'Corporate stays' },
  { key: 'relocation', icon: Truck, labelKey: 'categories.relocation', defaultLabel: 'Relocation' },
  { key: 'long-term', icon: CalendarDays, labelKey: 'categories.longTerm', defaultLabel: '30+ days' },
  { key: 'downtown-core', icon: Building2, labelKey: 'categories.downtownCore', defaultLabel: 'Downtown Toronto' },
];

export function CategoryChips() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const updateFadeEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 8);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateFadeEdges();
    el.addEventListener('scroll', updateFadeEdges, { passive: true });
    window.addEventListener('resize', updateFadeEdges);
    return () => {
      el.removeEventListener('scroll', updateFadeEdges);
      window.removeEventListener('resize', updateFadeEdges);
    };
  }, []);

  return (
    <div className="relative mx-auto mt-4 w-full max-w-5xl md:mt-6">
      <p className="mb-3 text-left text-xs font-semibold uppercase text-white/75 md:text-center">
        {t('categories.quickLabel', 'Popular searches')}
      </p>
      {/* Fade edge masks */}
      {showLeftFade && (
        <div className="absolute bottom-0 left-0 top-7 z-10 w-10 pointer-events-none bg-gradient-to-r from-neutral-900/35 to-transparent" />
      )}
      {showRightFade && (
        <div className="absolute bottom-0 right-0 top-7 z-10 w-10 pointer-events-none bg-gradient-to-l from-neutral-900/35 to-transparent" />
      )}

      {/* Scrollable chip row */}
      <div
        ref={scrollRef}
        className="flex snap-x items-center justify-start gap-2 overflow-x-auto scrollbar-none px-1 pb-1 md:flex-wrap md:justify-center md:overflow-visible"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const href = `${locale === 'en' ? '' : `/${locale}`}/properties?category=${cat.key}`;
          return (
            <Link
              key={cat.key}
              href={href}
              className={cn(
                'relative flex min-h-11 shrink-0 snap-start items-center gap-2 px-4 py-2.5',
                'border border-white/30 bg-white/10 backdrop-blur-sm',
                'text-sm font-medium',
                'transition-colors duration-200',
                activeCategory === cat.key
                  ? 'text-white border-white/70 bg-white/20'
                  : 'text-white/90 hover:text-white hover:border-white/50 hover:bg-white/15',
                // Animated underline via ::after
                'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-white after:transition-all after:duration-300',
                activeCategory === cat.key
                  ? 'after:w-[calc(100%-2rem)]'
                  : 'after:w-0 hover:after:w-[calc(100%-2rem)]',
              )}
            >
              <Icon size={18} className={cn('shrink-0', activeCategory === cat.key ? 'text-white' : 'text-white/70')} />
              <span className="whitespace-nowrap">
                {t(cat.labelKey, cat.defaultLabel)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryChips;
