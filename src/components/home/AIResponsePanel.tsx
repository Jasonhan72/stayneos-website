'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface PropertyRecommendation {
  id: string;
  title: string;
  location: string;
  monthlyPrice: number;
  images: string[];
  bedrooms: number;
  maxGuests: number;
}

interface AIResponse {
  text: string;
  recommended_property_id: number;
  alternative_property_id: number | null;
  hotel_comparison: string;
}

type PanelState = 'loading' | 'response' | 'error';

interface AIResponsePanelProps {
  state: PanelState;
  response?: AIResponse;
  visible: boolean;
}

// NOTE: Prices synced with live API on 2025-07-15. Update when DB prices change.
const panelProperties: PropertyRecommendation[] = [
  {
    id: '1',
    title: '55 Cooper St (Sugar Wharf) · Premium 3BR Sky Suite',
    location: '55 Cooper St, Toronto',
    monthlyPrice: 12000,
    images: ['/images/cooper-55-c5e8357d.jpg'],
    bedrooms: 3,
    maxGuests: 6,
  },
  {
    id: '2',
    title: '238 Simcoe St (Grange Park) · Executive 3BR Suite',
    location: '238 Simcoe St, Toronto',
    monthlyPrice: 8000,
    images: ['/images/simcoe-238-kitchen.jpg'],
    bedrooms: 3,
    maxGuests: 5,
  },
  {
    id: '3',
    title: '22 Wellesley St E · Modern 1BR City View',
    location: '22 Wellesley St E, Toronto',
    monthlyPrice: 4000,
    images: ['/images/wellesley-1607-living.jpg'],
    bedrooms: 1,
    maxGuests: 2,
  },
];

export function AIResponsePanel({ state, response, visible }: AIResponsePanelProps) {
  const { t } = useI18n();

  const recommended = response
    ? panelProperties.find((p) => p.id === String(response.recommended_property_id))
    : null;

  return (
    <div
      className={`transition-all duration-[400ms] ease-in-out overflow-hidden ${
        visible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="bg-neutral-900/95 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Loading state */}
          {state === 'loading' && (
            <div className="text-center">
              <div className="text-3xl mb-3 animate-pulse">●●●</div>
              <p className="text-white/70 text-lg">
                {t('aiConcierge.loading', 'NEOS AI is finding your perfect match...')}
              </p>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="text-center">
              <p className="text-white/80 text-lg mb-6">
                {t(
                  'aiConcierge.error',
                  'Our AI is taking a moment. Browse our collection or chat with us.'
                )}
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/properties"
                  className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors"
                >
                  {t('aiConcierge.browseCta', 'Browse Properties')}
                </Link>
                <a
                  href="https://wa.me/16474467987?text=Hi%2C%20I'm%20interested%20in%20NEOS%20apartments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-lg transition-colors"
                >
                  {t('aiConcierge.whatsappCta', 'Chat on WhatsApp')}
                </a>
              </div>
            </div>
          )}

          {/* Response state */}
          {state === 'response' && response && (
            <div className="space-y-8">
              {/* AI text */}
              <p className="text-white/90 text-lg leading-relaxed">{response.text}</p>

              {/* Hotel comparison */}
              {response.hotel_comparison && (
                <p className="text-accent text-sm italic">{response.hotel_comparison}</p>
              )}

              {/* Recommended property card */}
              {recommended && (
                <div className="bg-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row">
                  <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                    <Image
                      src={recommended.images[0]}
                      alt={recommended.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{recommended.title}</h3>
                    <p className="text-white/60 text-sm mb-3">{recommended.location}</p>
                    <p className="text-accent font-bold text-xl mb-4">
                      ${recommended.monthlyPrice.toLocaleString()}/
                      {t('common.month', 'mo')}
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={`/property/${recommended.id}`}
                        className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        {t('aiConcierge.scheduleViewing', 'Schedule a Viewing')}
                      </Link>
                      <a
                        href="https://wa.me/16474467987?text=Hi%2C%20I'm%20interested%20in%20NEOS%20apartments"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        {t('aiConcierge.whatsappCta', 'Chat on WhatsApp')}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
