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

    const idle = (cb: () => void) => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
      if (w.requestIdleCallback) {
        w.requestIdleCallback(cb);
      } else {
        setTimeout(cb, 1200);
      }
    };
    const t1 = setTimeout(() => idle(() => setShowVideo(true)), 800);
    return () => clearTimeout(t1);
  }, []);

  return (
    <>
      <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden bg-neutral-900">
        {/* Background image (always visible, renders first).
            sizes caps mobile at 640px (24KB webp) and nudges desktop
            to 1080w webp (~157KB) instead of 1920w (~514KB). */}
        <div className="absolute inset-0 z-0">
          <ResponsiveImage
            src="/images/cooper-55-e98a880d.jpg"
            alt="55 Cooper St lakefront view"
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
            <source src="/videos/hero-loop.mp4" type="video/mp4" media="(min-width: 768px)" />
          </video>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/25 to-neutral-900/70 z-[1]" />

        <Container className="relative z-10 text-center px-4 py-16 md:py-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-2 md:mb-4 leading-tight tracking-tight">
              {t('hero.title', 'Experience Toronto, Curated by AI & Human Expertise.')}
            </h1>

            <p className="text-lg md:text-2xl text-accent font-semibold mb-3 md:mb-4">
              {t('hero.highlight', 'Stop searching. Start living.')}
            </p>

            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-12 max-w-2xl mx-auto">
              {t('hero.subtitle', 'Premium furnished apartments in downtown Toronto. 30 days to 12 months. Move-in ready.')}
            </p>

            <HeroChatInline />
          </div>
        </Container>
      </section>
    </>
  );
}
