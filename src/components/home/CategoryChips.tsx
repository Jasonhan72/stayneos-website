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
  const { t } = useI18n();
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
    <section className="relative -mt-6 mb-8">
      {/* Fade edge masks */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
      )}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
      )}

      {/* Scrollable chip row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.key}
              href={`/properties?category=${cat.key}`}
              className={cn(
                'flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-full relative',
                'border border-neutral-200 bg-white',
                'text-sm font-medium',
                'transition-all duration-200',
                activeCategory === cat.key
                  ? 'text-neutral-900 border-neutral-300 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:border-neutral-400 hover:shadow-sm',
                // Animated underline via ::after
                'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-neutral-900 after:rounded-full after:transition-all after:duration-300',
                activeCategory === cat.key
                  ? 'after:w-[calc(100%-2rem)]'
                  : 'after:w-0 hover:after:w-[calc(100%-2rem)]',
              )}
            >
              <Icon size={18} className={cn('shrink-0', activeCategory === cat.key ? 'text-neutral-900' : 'text-neutral-400')} />
              <span className="whitespace-nowrap">
                {t(cat.labelKey, cat.defaultLabel)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryChips;
