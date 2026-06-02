'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2, SendHorizontal } from 'lucide-react';
import { ChatExternalPropertyCard, type ChatExternalProperty } from '@/components/shared/chat/ChatExternalPropertyCard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  property?: PropertyRecommendation | null;
  hotelComparison?: string;
  externalProperties?: ChatExternalProperty[];
}

interface PropertyRecommendation {
  id: string;
  title: string;
  location: string;
  monthlyPrice: number;
  image: string;
  images?: string[];   // From API response (preferred over single image)
  bedrooms: number;
  maxGuests?: number;
}

interface ChatApiResponse {
  text?: string;
  sessionId?: string;
  matchingProperties?: Array<{
    id: string | number;
    title?: string;
    location?: string;
    monthlyPrice?: number;
    images?: string[];
    bedrooms?: number;
    maxGuests?: number;
  }>;
  externalProperties?: ChatExternalProperty[];
}

// NOTE: Prices synced with live API on 2025-07-15. Update when DB prices change.
// Fallback image map (used when API doesn't provide images)
const PROPERTY_IMAGE_FALLBACKS: Record<string, string> = {
  '1': '/images/cooper-55-c5e8357d.jpg',
  '2': '/images/simcoe-238-kitchen.jpg',
  '3': '/images/wellesley-1607-living.jpg',
};

function resolvePropertyImage(id: string, apiImages?: string[]): string {
  if (apiImages && apiImages.length > 0) return apiImages[0];
  return PROPERTY_IMAGE_FALLBACKS[String(id)] || '';
}

const promptChipKeys = [
  'aiConcierge.chip1',
  'aiConcierge.chip2',
  'aiConcierge.chip3',
  'aiConcierge.chip4',
] as const;

const defaultChips = [
  'Medical rotation, 3 months',
  'Relocating for work, family of 4',
  'Visiting scholar at U of T',
  'Insurance housing, immediate',
];

function propertyFromApi(data: ChatApiResponse): PropertyRecommendation | null {
  const apiProperties = Array.isArray(data?.matchingProperties) ? data.matchingProperties : [];
  const apiProperty = apiProperties[0];
  if (!apiProperty) return null;

  const id = String(apiProperty.id);
  return {
    id,
    title: String(apiProperty.title || ''),
    location: String(apiProperty.location || ''),
    monthlyPrice: Number(apiProperty.monthlyPrice || 0),
    image: resolvePropertyImage(id, apiProperty.images),
    images: Array.isArray(apiProperty.images) ? apiProperty.images : [],
    bedrooms: Number(apiProperty.bedrooms || 0),
    maxGuests: Number(apiProperty.maxGuests || 0),
  };
}

export function HeroChatInline() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [bottomInput, setBottomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showChat, setShowChat] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sid = `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sid);
  }, []);

  // Scroll only within the chat container, not the page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowChat(true);
    setInput('');
    setBottomInput('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: trimmed,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Focus bottom input after sending for easy follow-up
    setTimeout(() => bottomInputRef.current?.focus(), 100);

    try {
      const history = [...messages, userMsg].slice(-10).map((m) => ({
        id: m.id,
        text: m.text,
        sender: m.sender,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          history,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = (await res.json()) as ChatApiResponse;
      if (data.sessionId) setSessionId(data.sessionId);

      const replyText = data.text || 'Sorry, I could not process that request.';
      const property = propertyFromApi(data);

      let hotelComparison: string | undefined;
      const hotelMatch = replyText.match(/(该区域类似酒店.*?。|Hotel.*?saving.*?\.)/);
      if (hotelMatch) hotelComparison = hotelMatch[0];

      const externalProperties: ChatExternalProperty[] | undefined =
        Array.isArray(data.externalProperties) && data.externalProperties.length > 0
          ? data.externalProperties
          : undefined;

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        text: replyText,
        sender: 'bot',
        property,
        hotelComparison,
        externalProperties,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          text: t('chat.error', 'Sorry, something went wrong. Please try again or email hello@stayneos.com.'),
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(bottomInput);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top Input — always visible */}
      <form onSubmit={handleTopSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 animate-breathing-glow transition-opacity duration-500" />

        {/* Desktop */}
        <div className="relative hidden sm:flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiConcierge.placeholder', 'Where are you looking to stay?')}
            className="flex-1 px-5 py-4 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="mr-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {t('aiConcierge.submit', 'Ask NEOS AI')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Mobile */}
        <div className="relative sm:hidden bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiConcierge.placeholder', 'Where are you looking to stay?')}
            className="w-full px-4 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-base"
            disabled={isLoading}
          />
          <div className="px-3 pb-3">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-full py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t('aiConcierge.submit', 'Ask NEOS AI')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Prompt chips — only before first message */}
      {!showChat && (
        <>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {promptChipKeys.map((key, i) => {
              const chipText = t(key, defaultChips[i]);
              return (
                <button
                  key={key}
                  onClick={() => void sendMessage(chipText)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white/90 text-xs sm:text-sm rounded-full border border-white/20 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  {chipText}
                </button>
              );
            })}
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/properties"
              className="text-white/70 hover:text-white text-sm transition-colors duration-200 underline underline-offset-4"
            >
              {t('aiConcierge.fallbackLink', 'Or browse our full collection →')}
            </Link>
          </div>
        </>
      )}

      {/* Conversation panel */}
      {showChat && (
        <div className="mt-6 bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          {/* Header with clear & close buttons */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-accent">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">NEOS AI</h3>
                <p className="text-white/50 text-xs">{t('chat.subtitle', 'Aria · Customer Care')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Clear chat */}
              <button
                onClick={() => {
                  setMessages([]);
                  setSessionId(`hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
                }}
                className="p-1.5 text-white/40 hover:text-white/80 transition-colors"
                title={t('chat.clear', 'Clear chat history')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
              {/* Close panel */}
              <button
                onClick={() => {
                  setShowChat(false);
                  setMessages([]);
                  setInput('');
                  setBottomInput('');
                  setSessionId(`hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
                }}
                className="p-1.5 text-white/40 hover:text-white/80 transition-colors"
                title={t('chat.close', 'Close chat')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area — fixed height, internal scroll only */}
          <div
            ref={messagesContainerRef}
            className="max-h-[350px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20"
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                      msg.sender === 'user'
                        ? 'bg-accent/90 text-white rounded-br-sm'
                        : 'bg-white/95 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>

                {msg.externalProperties && msg.externalProperties.length > 0 && (
                  <div className="mt-3 -mx-1 flex gap-3 overflow-x-auto pb-2 pl-1 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                    {msg.externalProperties.map((p, i) => (
                      <ChatExternalPropertyCard
                        key={`${p.url}-${i}`}
                        property={p}
                        variant="dark"
                      />
                    ))}
                  </div>
                )}

                {msg.property && (
                  <div className="mt-3 bg-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10">
                    <div className="relative w-full md:w-56 h-40 md:h-auto flex-shrink-0">
                      {msg.property.image ? (
                        <Image
                          src={msg.property.image}
                          alt={msg.property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-800 flex items-center justify-center text-white/30 text-sm">
                          NEOS
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1">
                      {msg.property.title && (
                        <h3 className="text-white font-semibold text-base mb-1">{msg.property.title}</h3>
                      )}
                      {msg.property.location && (
                        <p className="text-white/60 text-sm mb-2">{msg.property.location}</p>
                      )}
                      {msg.property.monthlyPrice > 0 && (
                        <p className="text-accent font-bold text-xl mb-3">
                          ${msg.property.monthlyPrice.toLocaleString()}/{t('common.month', 'mo')}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Link
                          href={`/property/${msg.property.id}`}
                          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          {t('aiConcierge.scheduleViewing', 'Schedule a Viewing')}
                        </Link>
                        <a
                          href="https://wa.me/16474467987?text=Hi%2C%20I'm%20interested%20in%20NEOS%20apartments"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/95 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom input — inside the conversation panel */}
          <div className="border-t border-white/10 p-3">
            <form onSubmit={handleBottomSubmit} className="flex items-center gap-2">
              <input
                ref={bottomInputRef}
                type="text"
                value={bottomInput}
                onChange={(e) => setBottomInput(e.target.value)}
                placeholder={t('chat.followUp', 'Ask a follow-up...')}
                className="flex-1 px-4 py-2.5 bg-white/10 text-white placeholder-white/40 rounded-full border border-white/15 outline-none focus:border-accent/60 focus:bg-white/15 transition-all text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!bottomInput.trim() || isLoading}
                className="p-2.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all duration-200 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SendHorizontal className="w-4 h-4" />
                )}
              </button>
            </form>
            <div className="flex items-center justify-center gap-3 mt-2">
              <Link
                href="/properties"
                className="text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-4"
              >
                {t('aiConcierge.fallbackLink', 'Browse all properties →')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
