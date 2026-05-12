'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Calendar, ChevronRight, Loader2, Search, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { getVisitorId } from '@/lib/visitor';
import { ChatPropertyCard } from '@/components/shared/chat/ChatPropertyCard';

const AirbnbCalendar = dynamic(() => import('@/components/booking').then((mod) => mod.AirbnbCalendar), {
  ssr: false,
  loading: () => null,
});

type Recommendation = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
  suggestions?: string[];
};

const INITIAL_SUGGESTIONS = [
  '2BR downtown under $3000',
  'Pet-friendly apartments',
  'Available this month',
];

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function HeroSearchBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; text: string; id?: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { t, locale } = useI18n();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
  };

  useEffect(() => {
    setSessionId(getVisitorId());
    const greeting = t(
      'chat.greeting',
      "Hi! I'm Aria, your apartment concierge. Tell me what you're looking for - budget, location, bedrooms - and I'll find the perfect match!"
    );
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: greeting,
        suggestions: INITIAL_SUGGESTIONS.map((s, i) => t(`chat.suggestion.${i + 1}`, s)),
      },
    ]);
    setChatHistory([{ sender: 'bot', text: greeting, id: 'welcome' }]);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;

    const currentSessionId = sessionId || getVisitorId();
    if (!sessionId) setSessionId(currentSessionId);

    // Add user message to UI
    setMessages((prev) => [...prev, { id: createId(), role: 'user', content: message }]);
    setInputValue('');
    setIsSending(true);

    // Build history for API
    const updatedHistory = [...chatHistory, { sender: 'user', text: message }];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: currentSessionId,
          history: updatedHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('chat.error', 'Something went wrong. Please try again.'));
      }

      const replyText = data.text || data.reply || t('chat.error', 'Something went wrong. Please try again.');
      const recs = data.recommendations || [];

      if (data.sessionId) setSessionId(data.sessionId);

      setChatHistory((prev) => [...prev, { sender: 'bot', text: replyText }]);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: replyText,
          recommendations: recs,
        },
      ]);
    } catch (error) {
      const errorMsg = error instanceof Error && error.message
        ? error.message
        : t('chat.error', 'Something went wrong. Please try again.');
      setMessages((prev) => [...prev, { id: createId(), role: 'assistant', content: errorMsg }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/40 bg-white/90 p-4 shadow-2xl backdrop-blur-xl md:p-6">
      {/* Chat Messages */}
      <div className="mb-4 max-h-[300px] space-y-4 overflow-y-auto pr-1 text-left">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-3`}>
                <div
                  className={[
                    'rounded-2xl px-4 py-2 text-sm md:text-base',
                    isUser
                      ? 'bg-neutral-800 text-white'
                      : 'border border-neutral-200 bg-white/80 text-neutral-800',
                  ].join(' ')}
                >
                  {msg.content}
                </div>

                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestions.map((suggestion, i) => (
                      <button
                        key={`${msg.id}-${i}`}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        className="rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-300 hover:bg-white"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {!isUser && msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="-mx-1 flex w-[calc(100vw-5rem)] max-w-full gap-3 overflow-x-auto px-1 pb-1 md:w-full">
                    {msg.recommendations.map((property) => (
                      <ChatPropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Date Picker */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white/70 px-4 py-3 text-left transition hover:border-neutral-300"
        >
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-neutral-400" />
            <div>
              <div className="text-sm text-neutral-900">
                {checkIn && checkOut
                  ? `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                  : t('booking.selectDates', 'Select dates')}
              </div>
              <div className="mt-0.5 text-sm text-neutral-400">
                {checkIn && checkOut
                  ? `${Math.ceil(
                      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
                    )} nights`
                  : t('booking.addDate', 'Add dates')}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
        </button>

        {showDatePicker && (
          <AirbnbCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectCheckIn={setCheckIn}
            onSelectCheckOut={setCheckOut}
            onClose={() => setShowDatePicker(false)}
            onClearDates={() => {
              setCheckIn('');
              setCheckOut('');
            }}
            minNights={28}
            currency="CAD"
          />
        )}
      </div>

      {/* Chat Input */}
      <form
        className="mb-3 flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(inputValue);
        }}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="hero-chat-input" className="sr-only">
            {t('chat.inputLabel', 'Ask Aria about apartments')}
          </label>
          <textarea
            id="hero-chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(inputValue);
              }
            }}
            placeholder={t('chat.placeholder', 'Ask about apartments in Toronto...')}
            className="min-h-[56px] w-full resize-none rounded-2xl border border-neutral-200 bg-white/70 px-4 py-4 text-base text-neutral-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            rows={1}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          disabled={!inputValue.trim() || isSending}
          className="shrink-0 px-5"
          leftIcon={isSending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
        >
          {t('chat.send', 'Send')}
        </Button>
      </form>

      {/* Search Fallback */}
      <Link href="/properties" className="block">
        <Button variant="primary" size="lg" className="h-14 w-full justify-center">
          <Search size={20} className="mr-2" />
          {t('search.search', 'Search')}
        </Button>
      </Link>
    </div>
  );
}
