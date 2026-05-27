'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Users,
  GraduationCap,
  Truck,
  CalendarDays,
  Waves,
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
  { key: 'executive', icon: Briefcase, labelKey: 'categories.executive', defaultLabel: 'Executive' },
  { key: 'family', icon: Users, labelKey: 'categories.family', defaultLabel: 'Family' },
  { key: 'medical-academic', icon: GraduationCap, labelKey: 'categories.medicalAcademic', defaultLabel: 'Medical-Academic' },
  { key: 'relocation', icon: Truck, labelKey: 'categories.relocation', defaultLabel: 'Relocation' },
  { key: 'long-term', icon: CalendarDays, labelKey: 'categories.longTerm', defaultLabel: 'Long-term' },
  { key: 'waterfront', icon: Waves, labelKey: 'categories.waterfront', defaultLabel: 'Waterfront' },
  { key: 'downtown-core', icon: Building2, labelKey: 'categories.downtownCore', defaultLabel: 'Downtown Core' },
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
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
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
        className="flex items-center justify-start gap-2 overflow-x-auto scrollbar-none px-1 pb-1 md:justify-center"
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
                'relative flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2.5',
                'border border-white/25 bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.12)]',
                'text-sm font-medium',
                'transition-all duration-200',
                activeCategory === cat.key
                  ? 'text-neutral-950 border-white shadow-md'
                  : 'text-neutral-700 hover:text-neutral-950 hover:border-white hover:bg-white',
                // Animated underline via ::after
                'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-neutral-900 after:rounded-full after:transition-all after:duration-300',
                activeCategory === cat.key
                  ? 'after:w-[calc(100%-2rem)]'
                  : 'after:w-0 hover:after:w-[calc(100%-2rem)]',
              )}
            >
              <Icon size={18} className={cn('shrink-0', activeCategory === cat.key ? 'text-neutral-900' : 'text-neutral-500')} />
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
