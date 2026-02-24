'use client';

import { useState } from 'react';
import { ChevronLeft, CreditCard, Lock, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface CardDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: (cardData: CardData) => void;
}

export interface CardData {
  cardNumber: string;
  expiry: string;
  cvc: string;
  zipCode: string;
  country: string;
}

// Card brand icons
const VisaIcon = () => (
  <svg viewBox="0 0 48 16" className="h-4">
    <path fill="#1A1F71" d="M17.68 1.5l-4.2 9.9h-2.9l2-9.9h5.1zm13.5 6.6c0-2.6-3.6-2.7-3.6-3.9 0-.4.3-.8 1.1-.9.4-.1 1.5-.1 2.7.6l.5-2.2c-.7-.3-1.5-.5-2.5-.5-2.6 0-4.5 1.4-4.5 3.3 0 1.4 1 2.2 1.8 2.7.8.5 1.1.8 1.1 1.3 0 .7-.7 1-1.3 1-.9 0-1.8-.3-2.3-.5l-.5 2.3c.6.3 1.7.5 2.8.5 2.8 0 4.7-1.3 4.7-3.7z"/>
    <path fill="#1A1F71" d="M36.8 1.5h-2.5c-.8 0-1.4.2-1.7 1l-4.9 8.9h3l.7-1.9h3.5l.4 1.9h2.6l-2.1-9.9zm-3.2 5.3l1-2.7.6 2.7h-1.6z"/>
    <path fill="#1A1F71" d="M30.5 1.5l-2.8 9.9h-2.7l2.8-9.9h2.7z"/>
    <path fill="#1A1F71" d="M12.5 1.5l-4.2 9.9h-2.9l2-9.9h5.1z"/>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 24 16" className="h-4">
    <circle cx="8" cy="8" r="6" fill="#EB001B"/>
    <circle cx="16" cy="8" r="6" fill="#F79E1B"/>
    <path fill="#FF5F00" d="M12 3.5c1.6 1.2 2.5 3 2.5 4.5s-1 3.3-2.5 4.5c-1.6-1.2-2.5-3-2.5-4.5s1-3.3 2.5-4.5z"/>
  </svg>
);

const AmexIcon = () => (
  <svg viewBox="0 0 48 16" className="h-4">
    <rect width="48" height="16" rx="2" fill="#006FCF"/>
    <text x="4" y="11" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
  </svg>
);

const countries = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
];

export function CardDetailsForm({
  isOpen,
  onClose,
  onBack,
  onSubmit,
}: CardDetailsFormProps) {
  const { t } = useI18n();
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    expiry: '',
    cvc: '',
    zipCode: '',
    country: 'CA',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CardData, string>>>({});

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CardData, string>> = {};
    
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = t('payment.invalidCardNumber') || 'Invalid card number';
    }
    
    if (!cardData.expiry || cardData.expiry.length < 5) {
      newErrors.expiry = t('payment.invalidExpiry') || 'Invalid expiration date';
    }
    
    if (!cardData.cvc || cardData.cvc.length < 3) {
      newErrors.cvc = t('payment.invalidCvc') || 'Invalid CVV';
    }
    
    if (!cardData.zipCode) {
      newErrors.zipCode = t('payment.invalidZip') || 'Invalid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(cardData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-neutral-900" />
        </button>
        
        <button 
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          {t('common.cancel') || 'Cancel'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
          {t('payment.cardDetails') || 'Card details'}
        </h1>

        {/* Card Logos */}
        <div className="flex items-center gap-2 mb-6">
          <VisaIcon />
          <MastercardIcon />
          <AmexIcon />
          <span className="text-sm text-neutral-500 ml-2">
            {t('payment.acceptedCards') || 'Visa, Mastercard, Amex'}
          </span>
        </div>

        {/* Card Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t('payment.cardNumber') || 'Card number'}
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={cardData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                errors.cardNumber ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
          </div>
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry and CVC Row */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t('payment.expiration') || 'Expiration (MM/YY)'}
            </label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => handleInputChange('expiry', e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                errors.expiry ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.expiry && (
              <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t('payment.cvv') || 'CVV'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={cardData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength={4}
                className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                  errors.cvc ? 'border-red-500' : 'border-neutral-300'
                }`}
              />
            </div>
            {errors.cvc && (
              <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>
            )}
          </div>
        </div>

        {/* ZIP Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t('payment.zipCode') || 'ZIP code'}
          </label>
          <input
            type="text"
            value={cardData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="A1A 1A1"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
              errors.zipCode ? 'border-red-500' : 'border-neutral-300'
            }`}
          />
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
          )}
        </div>

        {/* Country */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t('payment.country') || 'Country/region'}
          </label>
          <select
            value={cardData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
          <Shield className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-neutral-600">
            {t('payment.encryptedNotice') || 'Your card information is encrypted and secure.'}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-neutral-100 text-neutral-900 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            {t('common.done') || 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardDetailsForm;