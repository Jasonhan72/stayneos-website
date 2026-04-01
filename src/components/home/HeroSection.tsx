'use client';

import Image from 'next/image';
import { Container } from '@/components/ui';
import { HeroChatInline } from './HeroChatInline';
import { useI18n } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden bg-neutral-900">
        {/* Background image (always visible, renders first) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cooper-55-e98a880d.jpg"
            alt="55 Cooper St lakefront view"
            fill
            priority={true}
            className="object-cover"
          />
        </div>

        {/* Background video (overlays image on desktop, may not autoplay on iOS) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/cooper-55-e98a880d.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0 hidden md:block"
        >
          <source src="/videos/hero-loop.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/40 to-neutral-900/70 z-[1]" />

        <Container className="relative z-10 text-center px-4 py-16 md:py-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4 leading-tight">
              {t('hero.title', 'Experience Toronto, Curated by AI & Human Expertise.')}
            </h1>

            <p className="text-lg md:text-2xl text-accent font-semibold mb-3 md:mb-4">
              {t('hero.highlight', 'Stop searching. Start living.')}
            </p>

            <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto">
              {t('hero.subtitle', 'Premium furnished apartments in downtown Toronto. 30 days to 12 months. Move-in ready.')}
            </p>

            <HeroChatInline />
          </div>
        </Container>
      </section>
    </>
  );
}
