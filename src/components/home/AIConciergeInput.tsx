'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  const handleChipClick = (chipText: string) => {
    setInput(chipText);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Glowing input container */}
      <form onSubmit={handleSubmit} className="relative group">
        {/* Breathing glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 animate-breathing-glow transition-opacity duration-500" />

        <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiConcierge.placeholder', 'Tell me about your Toronto plans...')}
            className="flex-1 px-6 py-4 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="mr-2 px-6 py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 whitespace-nowrap"
          >
            {isLoading ? '...' : t('aiConcierge.submit', 'Ask NEOS AI')}
          </button>
        </div>
      </form>

      {/* Prompt chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {promptChipKeys.map((key, i) => {
          const chipText = t(key, defaultChips[i]);
          return (
            <button
              key={key}
              onClick={() => handleChipClick(chipText)}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white/90 text-sm rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
            >
              {chipText}
            </button>
          );
        })}
      </div>

      {/* Fallback link */}
      <div className="mt-6 text-center">
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
