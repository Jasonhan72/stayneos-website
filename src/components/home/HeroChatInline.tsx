'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  property?: PropertyRecommendation | null;
  hotelComparison?: string;
}

interface PropertyRecommendation {
  id: string;
  title: string;
  location: string;
  monthlyPrice: number;
  image: string;
  bedrooms: number;
}

// Hardcoded properties for recommendation display
const PROPERTIES: Record<string, PropertyRecommendation> = {
  '1': {
    id: '1',
    title: '55 Cooper St (Sugar Wharf) · Premium 3BR Sky Suite',
    location: '55 Cooper St, Toronto',
    monthlyPrice: 12000,
    image: '/images/cooper-55-c5e8357d.jpg',
    bedrooms: 3,
  },
  '2': {
    id: '2',
    title: '238 Simcoe St (Grange Park) · Executive 3BR Suite',
    location: '238 Simcoe St, Toronto',
    monthlyPrice: 6500,
    image: '/images/simcoe-238-kitchen.jpg',
    bedrooms: 3,
  },
  '3': {
    id: '3',
    title: '22 Wellesley St E · Modern 1BR City View',
    location: '22 Wellesley St E, Toronto',
    monthlyPrice: 3500,
    image: '/images/wellesley-1607-living.jpg',
    bedrooms: 1,
  },
};

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

// Try to extract a property ID from AI response
function extractPropertyId(text: string): string | null {
  // Match property IDs or addresses
  if (/55\s*cooper|sugar\s*wharf/i.test(text)) return '1';
  if (/238\s*simcoe|grange\s*park/i.test(text)) return '2';
  if (/22\s*wellesley/i.test(text)) return '3';
  return null;
}

export function HeroChatInline() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sid = `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sid);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowChat(true);
    setInput('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: trimmed,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

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

      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const replyText = data.text || 'Sorry, I could not process that request.';
      const propertyId = extractPropertyId(replyText);
      const property = propertyId ? PROPERTIES[propertyId] || null : null;

      // Extract hotel comparison if present
      let hotelComparison: string | undefined;
      const hotelMatch = replyText.match(/(该区域类似酒店.*?。|Hotel.*?saving.*?\.)/);
      if (hotelMatch) hotelComparison = hotelMatch[0];

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        text: replyText,
        sender: 'bot',
        property,
        hotelComparison,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          text: t('chat.error', 'Sorry, something went wrong. Please try again or email hello@neos.rentals.'),
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 animate-breathing-glow transition-opacity duration-500" />

        {/* Desktop */}
        <div className="relative hidden sm:flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiConcierge.placeholder', 'Tell me about your Toronto plans...')}
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
            placeholder={t('aiConcierge.placeholder', 'Tell me about your Toronto plans...')}
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

      {/* Prompt chips - only show when no chat started */}
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

      {/* Conversation area */}
      {showChat && (
        <div className="mt-6 max-h-[400px] overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Message bubble */}
              <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                    msg.sender === 'user'
                      ? 'bg-accent/90 text-white'
                      : 'bg-white/95 backdrop-blur-sm text-gray-800 border border-white/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>

              {/* Property card inline */}
              {msg.property && (
                <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10">
                  <div className="relative w-full md:w-56 h-40 md:h-auto flex-shrink-0">
                    <Image
                      src={msg.property.image}
                      alt={msg.property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1">
                    <h3 className="text-white font-semibold text-base mb-1">{msg.property.title}</h3>
                    <p className="text-white/60 text-sm mb-2">{msg.property.location}</p>
                    <p className="text-accent font-bold text-xl mb-3">
                      ${msg.property.monthlyPrice.toLocaleString()}/{t('common.month', 'mo')}
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={`/property/${msg.property.id}`}
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        {t('aiConcierge.scheduleViewing', 'Schedule a Viewing')}
                      </Link>
                      <a
                        href="https://wa.me/16478626518?text=Hi%2C%20I'm%20interested%20in%20NEOS%20apartments"
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

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Continue chatting hint + browse link */}
          {messages.length > 0 && !isLoading && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="text-white/50 text-xs">{t('chat.continueHint', 'Ask a follow-up question above')}</span>
              <span className="text-white/30">•</span>
              <Link
                href="/properties"
                className="text-white/70 hover:text-white text-xs transition-colors underline underline-offset-4"
              >
                {t('aiConcierge.fallbackLink', 'Browse all properties →')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
