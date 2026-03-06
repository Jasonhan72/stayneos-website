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
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    nameZh: '温哥华',
    nameFr: 'Vancouver',
    image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=600&q=80',
    propertyCount: 28,
  },
  {
    id: 'montreal',
    name: 'Montreal',
    nameZh: '蒙特利尔',
    nameFr: 'Montréal',
    image: 'https://images.unsplash.com/photo-1519178555425-500a1587ebb7?w=600&q=80',
    propertyCount: 22,
  },
  {
    id: 'newyork',
    name: 'New York',
    nameZh: '纽约',
    nameFr: 'New York',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?w=600&q=80',
    propertyCount: 35,
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

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('cities.title') || 'Popular Destinations'}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('cities.subtitle') || 'Find furnished apartments in major cities across Canada and the US'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/properties?city=${city.id}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/5]"
            >
              <Image
                src={city.image}
                alt={getCityName(city)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">{getCityName(city)}</h3>
                <p className="text-white/80 text-sm">
                  {city.propertyCount} {t('cities.properties') || 'properties'}
                </p>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full p-2">
                  <ArrowRight size={20} className="text-neutral-900" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
