'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge, Card, Section } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

export function MarketSegmentsSection() {
  const { t } = useI18n();

  const segments = [
    {
      title: t('marketSegments.business.title', 'Business travel'),
      subtitle: t('marketSegments.business.subtitle', 'Corporate-ready'),
      description: t('marketSegments.business.description', 'Furnished residences for executives, project teams, and consultants who need a dependable downtown base.'),
      cta: t('marketSegments.business.cta', 'Explore business stays'),
      href: '/for-business',
      image: '/images/cooper-55-dining.jpg',
    },
    {
      title: t('marketSegments.longTerm.title', 'Long-term stays'),
      subtitle: t('marketSegments.longTerm.subtitle', '30+ day living'),
      description: t('marketSegments.longTerm.description', 'Ideal for renovation gaps, temporary housing, and guests who want home-level comfort for longer periods.'),
      cta: t('marketSegments.longTerm.cta', 'View long-term options'),
      href: '/long-term',
      image: '/images/simcoe-238-living.jpg',
    },
    {
      title: t('marketSegments.relocation.title', 'Relocation support'),
      subtitle: t('marketSegments.relocation.subtitle', 'Move with certainty'),
      description: t('marketSegments.relocation.description', 'A smoother landing for employees, families, and international arrivals transitioning into Toronto.'),
      cta: t('marketSegments.relocation.cta', 'See relocation-ready homes'),
      href: '/properties',
      image: '/images/cooper-55-e98a880d.jpg',
    },
  ];

  return (
    <Section bg="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          {t('marketSegments.title', 'Built for different stay scenarios')}
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {t('marketSegments.subtitle', 'NEOS supports relocation, business housing, and longer monthly stays with the same premium standard.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <Card key={segment.title} className="group">
            <div className="aspect-[4/3] overflow-hidden">
              <Image
                src={segment.image}
                alt={segment.title}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-6">
              <Badge variant="primary" className="mb-3">{segment.subtitle}</Badge>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">{segment.title}</h3>
              <p className="text-neutral-600 mb-4">{segment.description}</p>
              <Link
                href={segment.href}
                className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors"
              >
                {segment.cta}
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
