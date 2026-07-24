'use client';

import { useEffect, useState } from 'react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { Container } from '@/components/ui';
import { HeroChatInline } from './HeroChatInline';
import { useI18n } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useI18n();
  // Defer video mount until after first paint + 1.2s so the hero JPEG can land
  // first without fighting the 1.88MB video metadata preload for bandwidth.
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Skip on small viewports (video is hidden on mobile anyway).
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(max-width: 767px)').matches) return;
    // Respect reduced-motion users: don't auto-play decorative video.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Defer 2s so the hero JPEG lands first without fighting the
    // 1.88MB video for bandwidth. Simple timeout avoids the
    // requestIdleCallback trap (Chromium may never go idle on a
    // busy page with animations / network).
    const t = setTimeout(() => setShowVideo(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <section className="relative flex h-[92svh] min-h-[620px] items-center justify-center overflow-hidden bg-neutral-900 md:h-[88svh]">
        {/* Background image (always visible, renders first).
            sizes caps mobile at 640px (24KB webp) and nudges desktop
            to 1080w webp (~157KB) instead of 1920w (~514KB). */}
        <div className="absolute inset-0 z-0">
          <ResponsiveImage
            src="/images/cooper-55-c5e8357d.jpg"
            alt="Furnished living room at 55 Cooper St"
            fill
            priority={true}
            sizes="(max-width: 640px) 640px, (max-width: 1080px) 100vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* Background video (desktop only, deferred to keep critical path light).
            preload="none" so the 1.88MB loop never blocks first paint; we only
            mount the <video> element after first paint + idle. */}
        {showVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/videos/hero-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover z-0 hidden md:block"
          >
            {/* WebM first (VP9, ~37% smaller than the MP4) so Chrome/Firefox grab it;
                Safari falls back to MP4. */}
            <source src="/videos/hero-loop.webm" type="video/webm" />
            <source src="/videos/hero-loop.mp4" type="video/mp4" />
          </video>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/65 via-neutral-900/20 to-neutral-950/70 z-[1]" />

        <Container className="relative z-10 px-4 py-16 md:py-0">
          <div className="max-w-4xl">
            <h1 className="max-w-3xl text-left text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
              {t('hero.title', 'Furnished apartments for monthly stays in Toronto')}
            </h1>

            <p className="mt-4 max-w-2xl text-left text-lg font-medium text-accent md:text-2xl">
              {t('hero.highlight', 'Move-in ready homes with flexible monthly terms')}
            </p>

            <p className="mb-7 mt-4 max-w-2xl text-left text-base leading-7 text-white/90 md:mb-10 md:text-xl">
              {t('hero.subtitle', 'Premium furnished apartments in downtown Toronto. 30 days to 12 months. Move-in ready.')}
            </p>

            <HeroChatInline />
          </div>
        </Container>
      </section>
    </>
  );
}
