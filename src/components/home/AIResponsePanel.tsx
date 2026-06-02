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

interface APIProperty {
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
  recommended_property_id: string | number | null;
  alternative_property_id: string | number | null;
  hotel_comparison: string;
  matchingProperties?: APIProperty[];
  externalProperties?: Array<{
    title: string; url: string; source: string; price?: number; priceText?: string;
    bedrooms?: number; location?: string; image?: string; snippet?: string;
  }>;
  budgetApplied?: number;
  closestAboveBudget?: { title: string; price: number };
}

type PanelState = 'loading' | 'response' | 'error';

interface AIResponsePanelProps {
  state: PanelState;
  response?: AIResponse;
  visible: boolean;
}

// Property images are now provided by the API response.
// Hardcoded fallback images (used only if API doesn't return images).
const PROPERTY_IMAGE_FALLBACKS: Record<string, string> = {
  '1': '/images/cooper-55-c5e8357d.jpg',
  '2': '/images/simcoe-238-kitchen.jpg',
  '3': '/images/wellesley-1607-living.jpg',
};

function resolveImage(id: string, apiImages?: string[]): string {
  if (apiImages && apiImages.length > 0) return apiImages[0];
  return PROPERTY_IMAGE_FALLBACKS[String(id)] || '';
}

export function AIResponsePanel({ state, response, visible }: AIResponsePanelProps) {
  const { t } = useI18n();

  // Look up recommended property from API-provided matchingProperties (preferred) or fallback
  const recommended = response?.matchingProperties?.find(
    (p) => String(p.id) === String(response.recommended_property_id)
  ) || (response?.recommended_property_id ? {
    id: String(response.recommended_property_id),
    title: '', location: '', monthlyPrice: 0, images: [], bedrooms: 0, maxGuests: 0,
  } : null);

  const hasNoMatch = response?.budgetApplied && (!response.matchingProperties || response.matchingProperties.length === 0);
  const closestAbove = response?.closestAboveBudget;

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

              {/* No-match notice with closest above budget */}
              {hasNoMatch && closestAbove && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
                  <p className="text-amber-300 text-sm">
                    💡 {t('aiConcierge.noMatch', 'No listings under your budget.')}{' '}
                    {t('aiConcierge.closestOption', 'Closest:')}{' '}
                    <strong>{closestAbove.title}</strong>{' '}
                    ${closestAbove.price.toLocaleString()}/{t('common.month', 'mo')}
                  </p>
                </div>
              )}

              {/* All matching properties (from API) */}
              {response.matchingProperties && response.matchingProperties.length > 0 && (
                <div className="space-y-4">
                  {response.matchingProperties.map((prop) => (
                    <div key={prop.id} className="bg-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row">
                      <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                        {resolveImage(String(prop.id), prop.images) ? (
                          <Image
                            src={resolveImage(String(prop.id), prop.images)}
                            alt={prop.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center">
                            <span className="text-white/30 text-sm">NEOS</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-medium bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                            NEOS{t('common.listingTag', '精选')}
                          </span>
                          <h3 className="text-white font-semibold text-lg">{prop.title}</h3>
                        </div>
                        <p className="text-white/60 text-sm mb-3">{prop.location}</p>
                        <p className="text-accent font-bold text-xl mb-4">
                          ${prop.monthlyPrice.toLocaleString()}/
                          {t('common.month', 'mo')}
                        </p>
                        <Link
                          href={`/properties/${prop.id}`}
                          className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          {t('common.view', 'View')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback: single recommended property card */}
              {!response.matchingProperties && recommended && recommended.title && (
                <div className="bg-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row">
                  <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                    <Image
                      src={resolveImage(recommended.id, recommended.images)}
                      alt={recommended.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
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

              {/* External property cards */}
              {response.externalProperties && response.externalProperties.length > 0 && (
                <div className="space-y-3">
                  <p className="text-white/50 text-xs uppercase tracking-wide">
                    {t('aiConcierge.externalResults', 'Also from realtor.ca / condos.ca')}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {response.externalProperties.map((prop, i) => (
                      <a
                        key={i}
                        href={prop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-[260px] bg-white/10 rounded-xl overflow-hidden border border-white/15 hover:bg-white/15 transition"
                      >
                        <div className="relative h-32 bg-gradient-to-br from-neutral-800 to-neutral-700">
                          {prop.image ? (
                            <img
                              src={prop.image}
                              alt={prop.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                          <span className="absolute right-2 top-2 text-[10px] bg-white/15 text-white/80 px-2 py-0.5 rounded-full">
                            {prop.source.replace('www.', '')}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-white text-sm font-medium line-clamp-2">{prop.title}</p>
                          {prop.price && (
                            <p className="text-accent text-sm font-bold mt-1">
                              ${prop.price.toLocaleString()}/mo
                            </p>
                          )}
                          <p className="text-white/50 text-xs mt-1">{prop.location || prop.snippet?.slice(0, 80)}</p>
                        </div>
                      </a>
                    ))}
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
