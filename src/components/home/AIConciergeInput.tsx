'use client';

import { useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

interface AIConciergeInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
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

export function AIConciergeInput({ onSubmit, isLoading }: AIConciergeInputProps) {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      const inputRef = window.matchMedia('(min-width: 640px)').matches
        ? desktopInputRef
        : mobileInputRef;
      inputRef.current?.focus();
      return;
    }
    if (!isLoading) onSubmit(trimmed);
  };

  const handleChipClick = (chipText: string) => {
    setInput(chipText);
    // Auto-submit on chip click
    if (!isLoading) {
      onSubmit(chipText);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input container */}
      <form onSubmit={handleSubmit} className="relative group">
        {/* Breathing glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 animate-breathing-glow transition-opacity duration-500" />

        {/* Desktop: inline layout */}
        <div className="relative hidden sm:flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <input
            ref={desktopInputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiConcierge.placeholder', 'Where are you looking to stay?')}
            className="flex-1 px-5 py-4 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mr-2 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-accent transition-all duration-200 hover:bg-accent-hover active:bg-accent-hover disabled:cursor-wait"
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

        {/* Mobile: stacked layout */}
        <div className="relative sm:hidden bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <input
            ref={mobileInputRef}
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
              disabled={isLoading}
              className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white shadow-accent transition-all duration-200 hover:bg-accent-hover active:bg-accent-hover disabled:cursor-wait"
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

      {/* Prompt chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {promptChipKeys.map((key, i) => {
          const chipText = t(key, defaultChips[i]);
          return (
            <button
              key={key}
              onClick={() => handleChipClick(chipText)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white/90 text-xs sm:text-sm rounded-full border border-white/20 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {chipText}
            </button>
          );
        })}
      </div>

      {/* Fallback link */}
      <div className="mt-5 text-center">
        <Link
          href="/properties"
          className="text-white/70 hover:text-white text-sm transition-colors duration-200 underline underline-offset-4"
        >
          {t('aiConcierge.fallbackLink', 'Or browse our full collection →')}
        </Link>
      </div>
    </div>
  );
}
