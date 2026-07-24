'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Loader2, MapPin, SendHorizontal, Users } from 'lucide-react';
import { csrfFetch } from '@/lib/security/csrf-client';
import { ChatExternalPropertyCard, type ChatExternalProperty } from '@/components/shared/chat/ChatExternalPropertyCard';
import { ChatPropertyCard } from '@/components/shared/chat/ChatPropertyCard';
import { CategoryChips } from './CategoryChips';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  properties?: PropertyRecommendation[];
  hotelComparison?: string;
  externalProperties?: ChatExternalProperty[];
}

interface PropertyRecommendation {
  id: string;
  title: string;
  location: string;
  monthlyPrice: number;
  image: string;
  url?: string;
  bedrooms: number;
}

export function HeroChatInline() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [bottomInput, setBottomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showChat, setShowChat] = useState(false);
  const desktopTopInputRef = useRef<HTMLInputElement>(null);
  const mobileTopInputRef = useRef<HTMLInputElement>(null);
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

      const res = await csrfFetch('/api/chat', {
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
      const properties: PropertyRecommendation[] | undefined =
        Array.isArray(data.properties) && data.properties.length > 0
          ? data.properties.map((property: {
              id: string;
              title: string;
              location: string;
              price?: number;
              monthlyPrice?: number;
              image?: string;
              url?: string;
              bedrooms?: number;
            }) => ({
              id: property.id,
              title: property.title,
              location: property.location,
              monthlyPrice: Number(property.price ?? property.monthlyPrice ?? 0),
              image: property.image || '',
              url: property.url,
              bedrooms: Number(property.bedrooms || 0),
            }))
          : undefined;

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
        properties,
        hotelComparison,
        externalProperties,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          text: t('chat.error', 'Sorry, something went wrong. Please try again or email support@stayneos.com.'),
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      const inputRef = window.matchMedia('(min-width: 640px)').matches
        ? desktopTopInputRef
        : mobileTopInputRef;
      inputRef.current?.focus();
      return;
    }
    void sendMessage(input);
  };

  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(bottomInput);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Top search module - always visible */}
      <form onSubmit={handleTopSubmit} className="mx-0 max-w-3xl">
        {/* Desktop */}
        <div className="relative hidden border border-white/35 bg-white shadow-xl sm:grid sm:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto]">
          <label className="flex min-w-0 items-center gap-3 border-r border-neutral-200 px-4 py-3 text-left">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase text-neutral-500">{t('search.location', 'Location')}</span>
              <input
                ref={desktopTopInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('aiConcierge.placeholder', 'Where in Toronto?')}
                className="mt-1 w-full bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
                disabled={isLoading}
              />
            </span>
          </label>
          <div className="flex items-center gap-3 border-r border-neutral-200 px-4 py-3 text-left">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
            <span>
              <span className="block text-xs font-semibold uppercase text-neutral-500">{t('search.term', 'Term')}</span>
              <span className="mt-1 block text-sm font-medium text-neutral-900">{t('search.termValue', '30+ days')}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-left">
            <Users className="h-5 w-5 shrink-0 text-primary" />
            <span>
              <span className="block text-xs font-semibold uppercase text-neutral-500">{t('search.support', 'Support')}</span>
              <span className="mt-1 block text-sm font-medium text-neutral-900">{t('search.supportValue', 'NEOS advisor')}</span>
            </span>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="m-2 flex min-h-12 items-center gap-2 whitespace-nowrap bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-wait"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {t('aiConcierge.submit', 'Find stays')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Mobile */}
        <div className="relative border border-white/35 bg-white shadow-xl sm:hidden">
          <label className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 text-left">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase text-neutral-500">{t('search.location', 'Location')}</span>
              <input
                ref={mobileTopInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('aiConcierge.placeholder', 'Where in Toronto?')}
                className="mt-1 w-full bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
                disabled={isLoading}
              />
            </span>
          </label>
          <div className="grid grid-cols-2 border-b border-neutral-200 text-left">
            <div className="flex items-center gap-3 border-r border-neutral-200 px-4 py-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-xs font-semibold uppercase text-neutral-500">{t('search.term', 'Term')}</span>
                <span className="mt-1 block text-sm font-medium text-neutral-900">{t('search.termValue', '30+ days')}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Users className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-xs font-semibold uppercase text-neutral-500">{t('search.support', 'Support')}</span>
                <span className="mt-1 block text-sm font-medium text-neutral-900">{t('search.supportValue', 'Advisor')}</span>
              </span>
            </div>
          </div>
          <div className="px-3 pb-3">
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-wait"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t('aiConcierge.submit', 'Find stays')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <CategoryChips />

      {/* Browse all link — only before first message */}
      {!showChat && (
        <div className="mt-5 text-center">
          <Link
            href="/properties"
            className="inline-flex min-h-11 items-center text-sm text-white/75 underline underline-offset-4 transition-colors duration-200 hover:text-white"
          >
            {t('aiConcierge.fallbackLink', 'Or browse our full collection →')}
          </Link>
        </div>
      )}

      {/* Conversation panel */}
      {showChat && (
        <div className="mx-auto mt-6 max-w-2xl bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
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
                <p className="text-white/50 text-xs">{t('chat.heroSubtitle', 'Aria · Customer Care')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Clear chat */}
              <button
                onClick={() => {
                  setMessages([]);
                  setSessionId(`hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
                }}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
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
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
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

                {msg.properties && msg.properties.length > 0 && (
                  <div className="mt-3 -mx-1 flex gap-3 overflow-x-auto pb-2 pl-1 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                    {msg.properties.map((property) => (
                      <ChatPropertyCard
                        key={property.id}
                        property={{
                          id: property.id,
                          title: property.title,
                          location: property.location,
                          price: property.monthlyPrice,
                          bedrooms: property.bedrooms,
                          image: property.image,
                          url: property.url,
                        }}
                      />
                    ))}
                  </div>
                )}

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
          <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-3">
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
                className="flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent/60 p-2.5 text-white backdrop-blur-sm transition-all duration-200 hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="inline-flex min-h-11 items-center text-xs text-white/40 underline underline-offset-4 transition-colors hover:text-white/70"
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
