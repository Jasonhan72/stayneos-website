'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function CitiesSection() {
  const { t, locale } = useI18n();
  const cityName = locale === 'zh' ? '多伦多' : locale === 'fr' ? 'Toronto' : 'Toronto';

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{t('cities.title')}</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">{t('cities.subtitle')}</p>
        </div>

        <div className="max-w-sm mx-auto">
          <Link href="/properties?city=toronto">
            <div className="group relative overflow-hidden rounded-xl aspect-[4/5]">
              <Image src="/images/cities/toronto.jpg" alt={cityName} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">{cityName}</h3>
                <p className="text-white/80 text-sm">{t('cities.availableNow') || 'Available now'}</p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full p-2"><ArrowRight size={20} className="text-neutral-900" /></div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
