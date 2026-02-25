'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guests: GuestCounts) => void;
  initialGuests: GuestCounts;
  maxGuests: number;
  maxInfants?: number;
  allowPets?: boolean;
}

const MIN_ADULTS = 1;
const MIN_CHILDREN = 0;
const MIN_INFANTS = 0;
const DEFAULT_MAX_INFANTS = 5;

export function GuestSelector({
  isOpen,
  onClose,
  onSave,
  initialGuests,
  maxGuests,
  maxInfants = DEFAULT_MAX_INFANTS,
  allowPets = false,
}: GuestSelectorProps) {
  const { t } = useI18n();
  const [guests, setGuests] = useState<GuestCounts>(initialGuests);

  // Reset guests when modal opens
  useEffect(() => {
    if (isOpen) {
      setGuests(initialGuests);
    }
  }, [isOpen, initialGuests]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const totalGuests = guests.adults + guests.children;

  const updateGuests = useCallback((type: keyof GuestCounts, delta: number) => {
    setGuests((prev) => {
      const newValue = prev[type] + delta;
      
      if (type === 'adults') {
        if (newValue < MIN_ADULTS || newValue > maxGuests) return prev;
      } else if (type === 'children') {
        const newTotal = prev.adults + newValue;
        if (newValue < MIN_CHILDREN || newTotal > maxGuests) return prev;
      } else if (type === 'infants') {
        if (newValue < MIN_INFANTS || newValue > maxInfants) return prev;
      }
      
      return { ...prev, [type]: newValue };
    });
  }, [maxGuests, maxInfants]);

  const handleSave = useCallback(() => {
    onSave(guests);
    onClose();
  }, [guests, onSave, onClose]);

  const getMaxGuestsText = useCallback(() => {
    return t('booking.guestSelector.maxGuests', { count: maxGuests });
  }, [maxGuests, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - Mobile: bottom sheet, Desktop: centered */}
      <div
        className={cn(
          'relative w-full bg-white shadow-2xl overflow-hidden z-10',
          'sm:max-w-lg sm:rounded-2xl sm:max-h-[90vh]',
          'rounded-t-2xl max-h-[85vh] flex flex-col'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-selector-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label={t('common.close')}
          >
            <X size={20} className="text-neutral-900" />
          </button>
          <h2
            id="guest-selector-title"
            className="text-lg font-semibold text-neutral-900"
          >
            {t('booking.guestSelector.title')}
          </h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {/* Info Text */}
          <p className="text-sm text-neutral-600 mb-8">
            {getMaxGuestsText()}
            {!allowPets && (
              <span> {t('booking.guestSelector.noPets')}</span>
            )}
          </p>

          {/* Guest Types */}
          <div className="space-y-6">
            {/* Adults */}
            <GuestCounter
              label={t('booking.guestSelector.adults')}
              description={t('booking.guestSelector.adultsDescription')}
              value={guests.adults}
              onDecrease={() => updateGuests('adults', -1)}
              onIncrease={() => updateGuests('adults', 1)}
              minValue={MIN_ADULTS}
              maxValue={maxGuests}
              canDecrease={guests.adults > MIN_ADULTS}
              canIncrease={totalGuests < maxGuests}
            />

            <div className="border-t border-neutral-100" />

            {/* Children */}
            <GuestCounter
              label={t('booking.guestSelector.children')}
              description={t('booking.guestSelector.childrenDescription')}
              value={guests.children}
              onDecrease={() => updateGuests('children', -1)}
              onIncrease={() => updateGuests('children', 1)}
              minValue={MIN_CHILDREN}
              maxValue={maxGuests - guests.adults}
              canDecrease={guests.children > MIN_CHILDREN}
              canIncrease={totalGuests < maxGuests}
            />

            <div className="border-t border-neutral-100" />

            {/* Infants */}
            <GuestCounter
              label={t('booking.guestSelector.infants')}
              description={t('booking.guestSelector.infantsDescription')}
              value={guests.infants}
              onDecrease={() => updateGuests('infants', -1)}
              onIncrease={() => updateGuests('infants', 1)}
              minValue={MIN_INFANTS}
              maxValue={maxInfants}
              canDecrease={guests.infants > MIN_INFANTS}
              canIncrease={guests.infants < maxInfants}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-4 sm:px-6 py-4 flex-shrink-0 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-6 border border-neutral-300 rounded-xl font-semibold text-neutral-900 hover:border-neutral-900 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 px-6 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Guest Counter Item Component
interface GuestCounterProps {
  label: string;
  description: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  minValue: number;
  maxValue: number;
  canDecrease: boolean;
  canIncrease: boolean;
}

function GuestCounter({
  label,
  description,
  value,
  onDecrease,
  onIncrease,
  canDecrease,
  canIncrease,
}: GuestCounterProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-neutral-900">{label}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        {/* Decrease Button */}
        <button
          onClick={onDecrease}
          disabled={!canDecrease}
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
            canDecrease
              ? 'border-neutral-400 text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50'
              : 'border-neutral-200 text-neutral-300 cursor-not-allowed'
          )}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={16} />
        </button>

        {/* Value */}
        <span className="w-6 text-center font-semibold text-neutral-900">
          {value}
        </span>

        {/* Increase Button */}
        <button
          onClick={onIncrease}
          disabled={!canIncrease}
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
            canIncrease
              ? 'border-neutral-400 text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50'
              : 'border-neutral-200 text-neutral-300 cursor-not-allowed'
          )}
          aria-label={`Increase ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default GuestSelector;
