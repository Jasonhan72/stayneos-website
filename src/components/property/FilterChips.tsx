'use client';

import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  activeCount: number;
  onOpenModal: () => void;
  onClearAll: () => void;
  allFiltersLabel?: string;
  clearAllLabel?: string;
  className?: string;
}

export default function FilterChips({
  chips,
  activeCount,
  onOpenModal,
  onClearAll,
  allFiltersLabel = 'All filters',
  clearAllLabel = 'Clear all',
  className,
}: FilterChipsProps) {
  if (!chips.length) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <X size={14} />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm font-medium text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors"
      >
        {clearAllLabel}
      </button>
      <div className="flex-1 min-w-[8px]" />
      <button
        onClick={onOpenModal}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-neutral-300 text-sm font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors bg-white shadow-sm"
      >
        <SlidersHorizontal size={16} />
        {allFiltersLabel}
        {activeCount > 0 && (
          <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}
