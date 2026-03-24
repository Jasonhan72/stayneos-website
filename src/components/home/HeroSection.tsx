'use client';

import Image from 'next/image';
import { Container } from '@/components/ui';
import { HeroSearchBox } from './HeroSearchBox';
import { useI18n } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useI18n();

  const heroCopy = {
    title: t('hero.title', 'Your Home Awaits'),
    highlight: t('hero.highlight', 'Arrive today. Feel at home tonight.'),
    subtitle: t('hero.subtitle', 'Premium furnished apartments in downtown Toronto. 30 days to 12 months. Move-in ready.'),
    stats: [
      { value: '2+', label: t('hero.stats.residences', 'Luxury residences') },
      { value: '100%', label: t('hero.stats.managed', 'Fully managed stays') },
      { value: '24/7', label: t('hero.stats.support', 'Guest support') },
    ],
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src="/images/cooper-55-e98a880d.jpg"
          alt="55 Cooper St lakefront view"
          fill
          priority={true}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/50 to-neutral-900/70" />
      </div>

      <Container className="relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {heroCopy.title}
            <br />
            <span className="text-accent">{heroCopy.highlight}</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            {heroCopy.subtitle}
          </p>

          <HeroSearchBox />

          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white">
            {heroCopy.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
