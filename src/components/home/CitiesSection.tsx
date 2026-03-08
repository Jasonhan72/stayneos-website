'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const cities = [
  {
    id: 'toronto',
    name: 'Toronto',
    nameZh: '多伦多',
    nameFr: 'Toronto',
    image: 'https://images.unsplash.com/photo-1517090504581-fd19fe0007a9?w=600&q=80',
    propertyCount: 45,
    comingSoon: false,
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    nameZh: '温哥华',
    nameFr: 'Vancouver',
    image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=600&q=80',
    propertyCount: 0,
    comingSoon: true,
  },
  {
    id: 'montreal',
    name: 'Montreal',
    nameZh: '蒙特利尔',
    nameFr: 'Montréal',
    image: 'https://images.unsplash.com/photo-1519178555425-500a1587ebb7?w=600&q=80',
    propertyCount: 0,
    comingSoon: true,
  },
  {
    id: 'newyork',
    name: 'New York',
    nameZh: '纽约',
    nameFr: 'New York',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?w=600&q=80',
    propertyCount: 0,
    comingSoon: true,
  },
];

export function CitiesSection() {
  const { t, locale } = useI18n();
  
  const getCityName = (city: typeof cities[0]) => {
    switch (locale) {
      case 'zh': return city.nameZh;
      case 'fr': return city.nameFr;
      default: return city.name;
    }
  };

  const comingSoonLabel = locale === 'zh' ? '即将开放' : locale === 'fr' ? 'Bientôt' : 'Coming Soon';

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('cities.title')}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('cities.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => {
            const content = (
              <div className="group relative overflow-hidden rounded-xl aspect-[4/5]">
                <Image
                  src={city.image}
                  alt={getCityName(city)}
                  fill
                  className={`object-cover transition-transform duration-500 group-hover:scale-110 ${city.comingSoon ? 'grayscale-[30%]' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {city.comingSoon && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-neutral-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {comingSoonLabel}
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{getCityName(city)}</h3>
                  <p className="text-white/80 text-sm">
                    {city.comingSoon 
                      ? comingSoonLabel
                      : `${city.propertyCount} ${t('cities.properties')}`
                    }
                  </p>
                </div>
                
                {!city.comingSoon && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-2">
                      <ArrowRight size={20} className="text-neutral-900" />
                    </div>
                  </div>
                )}
              </div>
            );

            if (city.comingSoon) {
              return <div key={city.id} className="cursor-default">{content}</div>;
            }

            return (
              <Link key={city.id} href={`/properties?city=${city.id}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
