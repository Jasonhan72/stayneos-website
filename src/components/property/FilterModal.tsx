'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

export interface BedroomOption {
  value: string;
  label: string;
}

export interface AmenityOption {
  value: string;
  label: string;
}

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' },
];

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  priceRanges: PriceRange[];
  selectedPriceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  bedroomOptions: BedroomOption[];
  selectedBedrooms: string;
  onBedroomsChange: (value: string) => void;
  amenitiesList: AmenityOption[];
  selectedAmenities: string[];
  onAmenityToggle: (value: string) => void;
  selectedPropertyTypes: string[];
  onPropertyTypeToggle: (value: string) => void;
  onClearAll: () => void;
  onApply: () => void;
  activeFilterCount: number;
  title?: string;
  priceLabel?: string;
  bedroomsLabel?: string;
  amenitiesLabel?: string;
  propertyTypeLabel?: string;
  clearAllLabel?: string;
  _applyLabel?: string;
  showResultsLabel?: string;
}

export default function FilterModal({
  open,
  onClose,
  priceRanges,
  selectedPriceRange,
  onPriceRangeChange,
  bedroomOptions,
  selectedBedrooms,
  onBedroomsChange,
  amenitiesList,
  selectedAmenities,
  onAmenityToggle,
  selectedPropertyTypes,
  onPropertyTypeToggle,
  onClearAll,
  onApply,
  activeFilterCount,
  title = 'Filters',
  priceLabel = 'Price range',
  bedroomsLabel = 'Bedrooms',
  amenitiesLabel = 'Amenities',
  propertyTypeLabel = 'Property type',
  clearAllLabel = 'Clear all',
  showResultsLabel = 'Show results',
}: FilterModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm font-medium text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors"
            >
              {clearAllLabel}
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              {priceLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => onPriceRangeChange(range)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors',
                    selectedPriceRange.label === range.label
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              {bedroomsLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onBedroomsChange(option.value)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors',
                    selectedBedrooms === option.value
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              {propertyTypeLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onPropertyTypeToggle(type.value)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors',
                    selectedPropertyTypes.includes(type.value)
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              {amenitiesLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity.value}
                  onClick={() => onAmenityToggle(amenity.value)}
                  className={cn(
                    'px-3 py-2 rounded-xl border-2 text-sm font-medium transition-colors',
                    selectedAmenities.includes(amenity.value)
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900'
                  )}
                >
                  {amenity.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 shrink-0">
          <button
            onClick={onClearAll}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors"
          >
            {clearAllLabel}
          </button>
          <Button
            onClick={onApply}
            className="px-8 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-semibold transition-colors"
          >
            {showResultsLabel}
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
