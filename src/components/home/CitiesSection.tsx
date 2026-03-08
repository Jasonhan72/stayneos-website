'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const neighborhoods = [
  {
    id: 'downtown',
    name: 'Downtown',
    nameZh: '市中心',
    nameFr: 'Centre-ville',
    image: 'https://images.unsplash.com/photo-1517090504581-fd19fe0007a9?w=600&q=80',
    propertyCount: 25,
  },
  {
    id: 'midtown',
    name: 'Midtown',
    nameZh: '市中心区',
    nameFr: 'Midtown',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80',
    propertyCount: 18,
  },
  {
    id: 'north-york',
    name: 'North York',
    nameZh: '北约克',
    nameFr: 'North York',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
    propertyCount: 22,
  },
  {
    id: 'yorkville',
    name: 'Yorkville',
    nameZh: '约克维尔',
    nameFr: 'Yorkville',
    image: 'https://images.unsplash.com/photo-1573047721567-5e5b58ad3c30?w=600&q=80',
    propertyCount: 15,
  },
];

export function CitiesSection() {
  const { t, locale } = useI18n();
  
  const getNeighborhoodName = (neighborhood: typeof neighborhoods[0]) => {
    switch (locale) {
      case 'zh': return neighborhood.nameZh;
      case 'fr': return neighborhood.nameFr;
      default: return neighborhood.name;
    }
  };

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('neighborhoods.title') || 'Explore Toronto Neighborhoods'}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('neighborhoods.subtitle') || 'Discover furnished apartments in Toronto\'s most desirable neighborhoods'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {neighborhoods.map((neighborhood) => (
            <Link
              key={neighborhood.id}
              href={`/properties?neighborhood=${neighborhood.id}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/5]"
            >
              <Image
                src={neighborhood.image}
                alt={getNeighborhoodName(neighborhood)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">{getNeighborhoodName(neighborhood)}</h3>
                <p className="text-white/80 text-sm">
                  {neighborhood.propertyCount} {t('neighborhoods.properties') || 'properties'}
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
