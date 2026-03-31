'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui';
import { AIConciergeInput } from './AIConciergeInput';
import { AIResponsePanel } from './AIResponsePanel';
import { useI18n } from '@/lib/i18n';

type PanelState = 'loading' | 'response' | 'error';

interface AIResponse {
  text: string;
  recommended_property_id: number;
  alternative_property_id: number | null;
  hotel_comparison: string;
}

export function HeroSection() {
  const { t, locale } = useI18n();
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>('loading');
  const [aiResponse, setAiResponse] = useState<AIResponse | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleAISubmit = useCallback(async (message: string) => {
    setIsLoading(true);
    setPanelVisible(true);
    setPanelState('loading');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);

      const res = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language: locale }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error('API error');

      const data: AIResponse = await res.json();
      setAiResponse(data);
      setPanelState('response');
    } catch {
      setPanelState('error');
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-900">
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

        <Container className="relative z-10 text-center pt-20 pb-8 md:pt-0 md:pb-0">
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

            <AIConciergeInput onSubmit={handleAISubmit} isLoading={isLoading} />
          </div>

          {/* AI Response Panel - Inside Hero, below input */}
          <div className="mt-8 w-full max-w-3xl mx-auto">
            <AIResponsePanel
              state={panelState}
              response={aiResponse}
              visible={panelVisible}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
