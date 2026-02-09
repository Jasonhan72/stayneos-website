// Blueground 风格首页 - 方形 UI
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  ArrowRight,
  Star
} from 'lucide-react';
import { Button, Container, Section, Card, Badge } from '@/components/ui';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { useI18n } from '@/lib/i18n';

// Export WelcomeBanner
export { WelcomeBanner } from './WelcomeBanner';

// ============================================================
// Hero Section - 全屏背景 + 搜索框
// ============================================================
export function HeroSection() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const { t } = useI18n();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80"
          alt="Luxury apartment"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/50 to-neutral-900/70" />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('hero.title')}
            <br />
            <span className="text-accent">{t('hero.highlight')}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* Search Box - Blueground Style with Airbnb Date Picker */}
          <div className="bg-white p-4 shadow-2xl max-w-4xl mx-auto">
            {/* Location - Full Width */}
            <div className="mb-3">
              <div className="relative h-14">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  placeholder={t('search.selectLocation')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-full pl-12 pr-4 bg-neutral-50 border border-neutral-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-base"
                />
              </div>
            </div>
            
            {/* Date Range Picker - Full Width */}
            <div className="mb-3">
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                minNights={28}
                className="w-full"
              />
            </div>

            {/* Search Button - Full Width */}
            <Link href="/properties" className="block h-14">
              <Button variant="primary" size="lg" className="w-full h-full flex items-center justify-center">
                <Search size={20} className="mr-2" />
                {t('search.search')}
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">2+</div>
              <div className="text-sm text-white/80">{t('features.quality')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/80">{t('features.service')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/80">{t('features.support')}</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================
// Value Proposition - 四大价值支柱
// ============================================================
const valueProps = [
  {
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
    titleKey: 'features.quality',
    descKey: 'features.qualityDesc'
  },
  {
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80',
    titleKey: 'features.flexible',
    descKey: 'features.flexibleDesc'
  },
  {
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80',
    titleKey: 'features.service',
    descKey: 'features.serviceDesc'
  },
  {
    image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&q=80',
    titleKey: 'features.support',
    descKey: 'features.supportDesc'
  }
];

export function ValuePropositionSection() {
  const { t } = useI18n();
  
  return (
    <Section bg="neutral">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          {t('features.title')}
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {t('features.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {valueProps.map((prop) => (
          <div key={prop.titleKey} className="text-center p-8 bg-white border border-neutral-200">
            <div className="w-full h-32 mx-auto mb-6 overflow-hidden rounded-lg">
              <Image
                src={prop.image}
                alt={t(prop.titleKey)}
                width={200}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-neutral-900">{t(prop.titleKey)}</h3>
            <p className="text-neutral-600">{t(prop.descKey)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============================================================
// Market Segments - 细分市场
// ============================================================
const segments = [
  {
    titleKey: 'segments.business.title',
    subtitleKey: 'segments.business.subtitle',
    descKey: 'segments.business.desc',
    ctaKey: 'segments.business.cta',
    href: '/business',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80'
  },
  {
    titleKey: 'segments.longterm.title',
    subtitleKey: 'segments.longterm.subtitle',
    descKey: 'segments.longterm.desc',
    ctaKey: 'segments.longterm.cta',
    href: '/properties',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
  },
  {
    titleKey: 'segments.relocation.title',
    subtitleKey: 'segments.relocation.subtitle',
    descKey: 'segments.relocation.desc',
    ctaKey: 'segments.relocation.cta',
    href: '/properties',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80'
  }
];

export function MarketSegmentsSection() {
  const { t } = useI18n();
  
  return (
    <Section bg="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          {t('segments.title')}
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {t('segments.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <Card key={segment.titleKey} className="group">
            <div className="aspect-[4/3] overflow-hidden">
              <Image
                src={segment.image}
                alt={t(segment.titleKey)}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            
            <div className="p-6">
              <Badge variant="primary" className="mb-3">{t(segment.subtitleKey)}</Badge>
              
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">{t(segment.titleKey)}</h3>
              
              <p className="text-neutral-600 mb-4">{t(segment.descKey)}</p>
              
              <Link 
                href={segment.href}
                className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors"
              >
                {t(segment.ctaKey)}
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ============================================================
// Featured Properties - 精选房源
// ============================================================
const featuredProperties = [
  {
    id: '1',
    title: { zh: 'Cooper St 豪华湖景公寓', en: 'Cooper St Luxury Lakeview Condo', fr: 'Condo Vue Lac Cooper St' },
    location: '55 Cooper St, Toronto',
    price: 680,
    rating: 4.9,
    reviews: 42,
    image: '/images/cooper-55-c5e8357d.jpg',
    badges: ['featured', '3bed3bath']
  },
  {
    id: '2',
    title: { zh: 'Simcoe St 高层精品公寓', en: 'Simcoe St Premium High-rise', fr: 'Appartement Premium Simcoe St' },
    location: '238 Simcoe St, Toronto',
    price: 450,
    rating: 4.8,
    reviews: 38,
    image: '/images/simcoe-238-living.jpg',
    badges: ['new']
  }
];

const badgeTranslations: Record<string, { en: string; zh: string; fr: string }> = {
  featured: { en: 'Featured', zh: '精选', fr: 'En Vedette' },
  new: { en: 'New', zh: '新上架', fr: 'Nouveau' },
  '3bed3bath': { en: '3BR 3BA', zh: '3室3卫', fr: '3Ch 3SdB' }
};

export function FeaturedPropertiesSection() {
  const { t, locale } = useI18n();
  
  const getBadgeText = (badge: string) => {
    return badgeTranslations[badge]?.[locale] || badge;
  };
  
  return (
    <Section bg="neutral">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('properties.title')}
          </h2>
          <p className="text-lg text-neutral-600 max-w-xl">
            {t('properties.subtitle')}
          </p>
        </div>
        
        <Link 
          href="/properties"
          className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors mt-4 md:mt-0"
        >
          {t('properties.viewAll')}
          <ArrowRight size={18} className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredProperties.map((property) => (
          <Card key={property.id} className="group">
            <Link href={`/property/${property.id}`}>
              <div className="aspect-[4/3] overflow-hidden relative">
                <Image
                  src={property.image}
                  alt={typeof property.title === 'object' ? property.title[locale] : property.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.badges.map((badge) => (
                    <Badge 
                      key={badge}
                      variant={badge === 'featured' ? 'primary' : 'default'}
                    >
                      {getBadgeText(badge)}
                    </Badge>
                  ))}
                </div>
                
                <button className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white transition-colors">
                  <Star size={18} className="text-neutral-400" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                    {typeof property.title === 'object' ? property.title[locale] : property.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-accent fill-accent" />
                    <span className="text-sm font-medium">{property.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-neutral-500 mb-4">
                  <MapPin size={14} />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="flex items-baseline justify-between pt-4 border-t border-neutral-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-neutral-900">
                      ${property.price}
                    </span>
                    <span className="text-neutral-500">CAD{t('properties.perNight')}</span>
                  </div>
                  
                  <span className="text-sm text-neutral-400">{property.reviews} {t('properties.reviews')}</span>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ============================================================
// How It Works - 流程说明
// ============================================================
const steps = [
  {
    number: '01',
    titleKey: 'steps.search.title',
    descKey: 'steps.search.desc'
  },
  {
    number: '02',
    titleKey: 'steps.book.title',
    descKey: 'steps.book.desc'
  },
  {
    number: '03',
    titleKey: 'steps.movein.title',
    descKey: 'steps.movein.desc'
  }
];

export function HowItWorksSection() {
  const { t } = useI18n();
  
  return (
    <Section bg="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          {t('howItWorks.title')}
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {t('howItWorks.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-neutral-200" />
            )}
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary text-white text-3xl font-bold mb-6">
                {step.number}
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">{t(step.titleKey)}</h3>
              
              <p className="text-neutral-600">{t(step.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============================================================
// CTA Section - 行动号召
// ============================================================
export function CTASection() {
  const { t } = useI18n();
  
  return (
    <section className="py-24 bg-primary">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          
          <p className="text-lg text-white/90 mb-10">
            {t('cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button variant="secondary" size="lg" className="bg-accent text-neutral-900 hover:bg-accent-600 font-semibold">
                {t('cta.explore')}
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                {t('cta.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
